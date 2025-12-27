import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    const { data, error } = await supabase.rpc('notify_upcoming_events', {
      hours_ahead: hoursAhead
    });

    if (error) {
      console.error('Error running notify_upcoming_events:', error);
      throw error;
    }

    console.log(`Created ${data} notifications for upcoming events`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notifications_created: data,
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
