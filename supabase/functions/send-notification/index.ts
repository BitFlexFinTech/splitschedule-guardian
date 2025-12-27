import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  notification_id: string;
  user_id: string;
  title: string;
  message: string;
  channel: 'email' | 'sms';
  recipient: string; // email or phone number
}

// Mock email sender (simulates Brevo API)
async function sendMockEmail(to: string, subject: string, body: string): Promise<{ success: boolean; messageId: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  console.log(`[MOCK EMAIL] Sending to: ${to}`);
  console.log(`[MOCK EMAIL] Subject: ${subject}`);
  console.log(`[MOCK EMAIL] Body: ${body}`);
  
  // Simulate 95% success rate
  if (Math.random() > 0.05) {
    const messageId = `mock_email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[MOCK EMAIL] ✓ Sent successfully. Message ID: ${messageId}`);
    return { success: true, messageId };
  } else {
    throw new Error('Mock email delivery failed (simulated failure)');
  }
}

// Mock SMS sender (simulates Twilio API)
async function sendMockSMS(to: string, body: string): Promise<{ success: boolean; sid: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  console.log(`[MOCK SMS] Sending to: ${to}`);
  console.log(`[MOCK SMS] Body: ${body}`);
  
  // Simulate 98% success rate
  if (Math.random() > 0.02) {
    const sid = `mock_sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[MOCK SMS] ✓ Sent successfully. SID: ${sid}`);
    return { success: true, sid };
  } else {
    throw new Error('Mock SMS delivery failed (simulated failure)');
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    const { notification_id, user_id, title, message, channel, recipient } = payload;

    console.log(`Processing ${channel} notification for user ${user_id}`);

    // Get user's notification preferences
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('notification_email, notification_sms')
      .eq('user_id', user_id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw profileError;
    }

    // Check if user has this channel enabled
    const isChannelEnabled = channel === 'email' 
      ? profile.notification_email 
      : profile.notification_sms;

    if (!isChannelEnabled) {
      console.log(`User ${user_id} has ${channel} notifications disabled. Skipping.`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          skipped: true, 
          reason: `${channel} notifications disabled` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create delivery record
    const { data: delivery, error: deliveryError } = await supabase
      .from('notification_deliveries')
      .insert({
        notification_id,
        channel,
        recipient,
        status: 'pending'
      })
      .select()
      .single();

    if (deliveryError) {
      console.error('Error creating delivery record:', deliveryError);
      throw deliveryError;
    }

    let deliveryResult;
    let status = 'sent';
    let errorMessage = null;

    try {
      if (channel === 'email') {
        deliveryResult = await sendMockEmail(recipient, title, message);
      } else if (channel === 'sms') {
        deliveryResult = await sendMockSMS(recipient, message);
      }
    } catch (sendError) {
      status = 'failed';
      errorMessage = sendError instanceof Error ? sendError.message : 'Unknown error';
      console.error(`Failed to send ${channel}:`, errorMessage);
    }

    // Update delivery record with result
    await supabase
      .from('notification_deliveries')
      .update({
        status,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
        error_message: errorMessage
      })
      .eq('id', delivery.id);

    return new Response(
      JSON.stringify({ 
        success: status === 'sent',
        delivery_id: delivery.id,
        channel,
        status,
        error: errorMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: status === 'sent' ? 200 : 500
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Send notification error:', errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
