import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check, Crown, Zap, Shield, Star } from 'lucide-react';

const plans = [
  {
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
    current: true,
  },
  {
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
  const { user } = useAuth();

  const handleSelectPlan = (planName: string) => {
    if (planName === 'Free') {
      toast.info('You are already on the Free plan');
      return;
    }
    
    // In production, this would integrate with Stripe
    toast.info(`Stripe checkout coming soon for ${planName}`);
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
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
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
                    variant={plan.current ? 'secondary' : 'default'}
                    disabled={plan.current}
                    onClick={() => handleSelectPlan(plan.name)}
                  >
                    {plan.current ? 'Current Plan' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
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
      </DashboardLayout>
    </>
  );
};

export default Subscriptions;
