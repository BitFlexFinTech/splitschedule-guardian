import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mock email/SMS sender for demo purposes
async function sendMockNotification(
  supabase: any,
  userId: string,
  notificationId: string,
  title: string,
  message: string,
  email: string,
  phone: string | null,
  emailEnabled: boolean,
  smsEnabled: boolean
) {
  const results = [];

  // Mock email delivery
  if (emailEnabled && email) {
    console.log(`[MOCK] Sending email to ${email}: ${title}`);
    
    // Create delivery record for email
    const { data: emailDelivery } = await supabase
      .from('notification_deliveries')
      .insert({
        notification_id: notificationId,
        channel: 'email',
        recipient: email,
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .select()
      .single();
    
    results.push({ channel: 'email', status: 'sent', id: emailDelivery?.id });
  }

  // Mock SMS delivery
  if (smsEnabled && phone) {
    console.log(`[MOCK] Sending SMS to ${phone}: ${message}`);
    
    // Create delivery record for SMS
    const { data: smsDelivery } = await supabase
      .from('notification_deliveries')
      .insert({
        notification_id: notificationId,
        channel: 'sms',
        recipient: phone,
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .select()
      .single();
    
    results.push({ channel: 'sms', status: 'sent', id: smsDelivery?.id });
  }

  return results;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body for custom hours_ahead (default 24)
    let hoursAhead = 24;
    try {
      const body = await req.json();
      if (body.hours_ahead) {
        hoursAhead = parseInt(body.hours_ahead, 10);
      }
    } catch {
      // Use default if no body
    }

    console.log(`Running notification scheduler for events in next ${hoursAhead} hours`);

    // Call the database function to create notifications for upcoming events
    const { data: notificationCount, error } = await supabase.rpc('notify_upcoming_events', {
      hours_ahead: hoursAhead
    });

    if (error) {
      console.error('Error running notify_upcoming_events:', error);
      throw error;
    }

    console.log(`Created ${notificationCount} notifications for upcoming events`);

    // Fetch recent notifications to send email/SMS
    const { data: recentNotifications, error: fetchError } = await supabase
      .from('notifications')
      .select(`
        id,
        user_id,
        title,
        message,
        category
      `)
      .eq('category', 'calendar')
      .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching recent notifications:', fetchError);
    }

    let deliveriesSent = 0;

    // Send email/SMS for each notification
    if (recentNotifications && recentNotifications.length > 0) {
      for (const notification of recentNotifications) {
        // Check if we already sent deliveries for this notification
        const { data: existingDeliveries } = await supabase
          .from('notification_deliveries')
          .select('id')
          .eq('notification_id', notification.id)
          .limit(1);

        if (existingDeliveries && existingDeliveries.length > 0) {
          continue; // Already sent
        }

        // Get user profile with notification preferences
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, phone, notification_email, notification_sms, notification_calendar')
          .eq('user_id', notification.user_id)
          .single();

        if (profile && profile.notification_calendar) {
          const results = await sendMockNotification(
            supabase,
            notification.user_id,
            notification.id,
            notification.title,
            notification.message,
            profile.email,
            profile.phone,
            profile.notification_email,
            profile.notification_sms
          );
          deliveriesSent += results.length;
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notifications_created: notificationCount,
        deliveries_sent: deliveriesSent,
        hours_ahead: hoursAhead,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Notification scheduler error:', errorMessage);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
