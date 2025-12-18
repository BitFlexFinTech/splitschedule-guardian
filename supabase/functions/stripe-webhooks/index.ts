import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // In production, you would verify the Stripe signature here
    // const stripeSignature = req.headers.get('stripe-signature');
    // const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

    const body = await req.json();
    const { type, data } = body;

    console.log(`Received Stripe webhook: ${type}`);

    // Log the webhook event to audit logs
    await supabase.from('audit_logs').insert({
      action: 'stripe_webhook',
      entity_type: 'stripe_event',
      entity_id: data?.object?.id || null,
      new_values: { event_type: type, data: data?.object },
    });

    switch (type) {
      case 'checkout.session.completed': {
        const session = data.object;
        console.log('Checkout session completed:', session.id);
        
        // Update subscription in database
        if (session.metadata?.family_id) {
          await supabase
            .from('subscriptions')
            .upsert({
              family_id: session.metadata.family_id,
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              plan_type: session.metadata.plan_type || 'monthly',
              status: 'active',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = data.object;
        console.log('Subscription updated:', subscription.id);
        
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = data.object;
        console.log('Subscription deleted:', subscription.id);
        
        await supabase
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('stripe_subscription_id', subscription.id);
        break;
      }

      case 'invoice.paid': {
        const invoice = data.object;
        console.log('Invoice paid:', invoice.id);
        
        // Update subscription status to active
        if (invoice.subscription) {
          await supabase
            .from('subscriptions')
            .update({ status: 'active' })
            .eq('stripe_subscription_id', invoice.subscription);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = data.object;
        console.log('Invoice payment failed:', invoice.id);
        
        // Update subscription status to past_due
        if (invoice.subscription) {
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due' })
            .eq('stripe_subscription_id', invoice.subscription);
        }
        break;
      }

      case 'issuing_card.created': {
        const card = data.object;
        console.log('Issuing card created:', card.id);
        
        // This would be handled by Stripe Issuing in production
        // For sandbox, we just log it
        break;
      }

      case 'issuing_transaction.created': {
        const transaction = data.object;
        console.log('Issuing transaction:', transaction.id);
        
        // Check merchant whitelist, log transaction, etc.
        break;
      }

      default:
        console.log(`Unhandled event type: ${type}`);
    }

    return new Response(
      JSON.stringify({ received: true, type }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
