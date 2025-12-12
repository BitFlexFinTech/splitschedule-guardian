import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Essential features for getting started",
    features: [
      "Basic custody calendar",
      "Critical incident log",
      "Up to 2 family members",
      "Email support",
    ],
    cta: "Start Free",
    variant: "hero-outline" as const,
    popular: false,
  },
  {
    name: "Family",
    price: "$9.99",
    period: "/month",
    description: "Complete co-parenting toolkit",
    features: [
      "Full custody calendar",
      "Expense tracking & splitting",
      "Secure messaging",
      "Document vault (5GB)",
      "Video calls",
      "Restricted debit card",
      "Priority support",
    ],
    cta: "Start 14-Day Trial",
    variant: "hero" as const,
    popular: true,
    yearlyPrice: "$99.99/year (save 17%)",
  },
  {
    name: "Law Firm",
    price: "Free",
    period: "read-only",
    description: "Access for legal representatives",
    features: [
      "Read-only access to cases",
      "Incident log exports",
      "Document downloads",
      "Court-ready formatting",
      "Multi-client dashboard",
    ],
    cta: "Register Law Firm",
    variant: "hero-outline" as const,
    popular: false,
  },
];

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            One plan for families, free access for incident logging, and no-cost access for legal professionals.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative p-8 rounded-2xl bg-card border transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-primary shadow-glow scale-105"
                  : "border-border/50 hover:border-primary/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                {plan.yearlyPrice && (
                  <p className="text-sm text-primary mt-1">{plan.yearlyPrice}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-success" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button variant={plan.variant} className="w-full" asChild>
                <Link to="/signup">{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
