import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Check, Crown, Shield, Star, Loader2, CreditCard } from 'lucide-react';
import { mockStripe } from '@/lib/mock-stripe';
import { APP_CONFIG } from '@/lib/config';

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Basic incident logging',
    features: [
      'Incident log access',
      'Basic reports',
      '1 family member',
      'Email support',
    ],
    limitations: [
      'No calendar features',
      'No expense tracking',
      'No messaging',
      'No file vault',
    ],
  },
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: '$9.99',
    period: '/month',
    description: 'Full co-parenting suite',
    features: [
      'Everything in Free',
      'Custody calendar',
      'Expense tracking & splitting',
      'Secure messaging with tone meter',
      'File vault (10GB)',
      'Video/audio calls',
      'Unlimited family members',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'pro_yearly',
    name: 'Pro Yearly',
    price: '$99.99',
    period: '/year',
    description: 'Best value - 2 months free',
    features: [
      'Everything in Pro Monthly',
      'Save $20/year',
      'Extended file storage (25GB)',
      'Advanced analytics',
      'API access',
    ],
  },
];

const Subscriptions: React.FC = () => {
  const { user, profile } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('free');

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      toast.info('You are already on the Free plan');
      return;
    }

    setSelectedPlan(planId);
    setCheckoutOpen(true);
  };

  const handleCheckout = async () => {
    if (!selectedPlan || !user || !profile?.family_id) {
      toast.error('Please set up your family first');
      return;
    }

    setIsProcessing(true);
    try {
      if (APP_CONFIG.MOCK_MODE) {
        // Mock checkout flow
        toast.info('Processing payment (Sandbox Mode)...');
        
        const session = await mockStripe.createCheckoutSession(
          selectedPlan as 'pro_monthly' | 'pro_yearly'
        );
        
        // Simulate successful checkout
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const subscription = await mockStripe.completeCheckout(session.id);
        
        // Update subscription in database
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            family_id: profile.family_id,
            plan_type: selectedPlan,
            status: 'active',
            stripe_subscription_id: subscription.id,
            current_period_start: new Date().toISOString(),
            current_period_end: subscription.currentPeriodEnd.toISOString(),
          });

        if (error) throw error;

        setCurrentPlan(selectedPlan);
        toast.success('Subscription activated! (Sandbox Mode)');
        setCheckoutOpen(false);
      } else {
        // Real Stripe checkout would go here
        toast.info('Real Stripe integration not configured yet');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to process payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Subscriptions | SplitSchedule</title>
        <meta name="description" content="Choose the right plan for your family" />
      </Helmet>
      
      <DashboardLayout user={user}>
        <div className="space-y-6">
          {/* Mock Mode Banner */}
          {APP_CONFIG.MOCK_MODE && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-600">Sandbox Mode</p>
                <p className="text-sm text-yellow-600/80">
                  No real payments will be processed. This is a demo environment.
                </p>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground">Choose Your Plan</h1>
            <p className="text-muted-foreground mt-2">
              Select the plan that works best for your co-parenting needs. 
              Lawyers always get free read-only access.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {plans.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''} ${isCurrent ? 'ring-2 ring-primary' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  {isCurrent && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-green-500">
                        Current Plan
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                      {plan.limitations?.map((limitation, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="h-4 w-4 flex items-center justify-center">—</span>
                          <span>{limitation}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={`w-full ${plan.popular ? 'bg-primary' : ''}`}
                      variant={isCurrent ? 'secondary' : 'default'}
                      disabled={isCurrent}
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      {isCurrent ? 'Current Plan' : 'Get Started'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Lawyer Access Card */}
          <Card className="max-w-5xl mx-auto bg-accent/5 border-accent">
            <CardContent className="py-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Lawyer Access</h3>
                  <p className="text-sm text-muted-foreground">
                    Legal professionals always get free read-only access when invited by a family. 
                    Perfect for case review and documentation.
                  </p>
                </div>
                <Badge variant="outline" className="bg-accent/10">
                  Always Free
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card className="max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Can I cancel anytime?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll continue to have access until your billing period ends.
                </p>
              </div>
              <div>
                <h4 className="font-medium">What payment methods do you accept?</h4>
                <p className="text-sm text-muted-foreground">
                  We accept all major credit cards through Stripe. Your payment information is securely processed and never stored on our servers.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Is there a refund policy?</h4>
                <p className="text-sm text-muted-foreground">
                  Yes, we offer a 30-day money-back guarantee. If you're not satisfied, contact support for a full refund.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Checkout Dialog */}
        <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Your Purchase</DialogTitle>
              <DialogDescription>
                {APP_CONFIG.MOCK_MODE 
                  ? 'This is a sandbox environment. No real payment will be processed.'
                  : 'You will be redirected to Stripe to complete your payment.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 border rounded-lg">
                <p className="font-medium">
                  {plans.find(p => p.id === selectedPlan)?.name}
                </p>
                <p className="text-2xl font-bold">
                  {plans.find(p => p.id === selectedPlan)?.price}
                  <span className="text-sm text-muted-foreground">
                    {plans.find(p => p.id === selectedPlan)?.period}
                  </span>
                </p>
              </div>

              {APP_CONFIG.MOCK_MODE && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                  <p className="text-sm text-yellow-600">
                    🧪 Sandbox Mode: Click "Subscribe" to simulate a successful payment.
                  </p>
                </div>
              )}

              <Button 
                className="w-full" 
                onClick={handleCheckout}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
};

export default Subscriptions;
