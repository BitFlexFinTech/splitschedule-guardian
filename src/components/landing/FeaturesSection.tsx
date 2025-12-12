import { Calendar, CreditCard, MessageSquare, FileText, Shield, Phone, DollarSign, Users } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Custody Calendar",
    description: "Visual calendar with color-coded schedules, holiday tracking, and easy swap requests.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: CreditCard,
    title: "Restricted Debit Card",
    description: "Issue child-expense cards with spending limits and merchant restrictions.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: DollarSign,
    title: "Expense Tracking",
    description: "Log and split child-related expenses with receipt uploads and automated calculations.",
    color: "bg-success/10 text-success",
  },
  {
    icon: MessageSquare,
    title: "Secure Messaging",
    description: "End-to-end encrypted communication with tone detection to keep conversations civil.",
    color: "bg-info/10 text-info",
  },
  {
    icon: Phone,
    title: "Video Calls",
    description: "Built-in video calling for parent-child connections during custody transitions.",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: FileText,
    title: "Document Vault",
    description: "Secure storage for custody agreements, medical records, and important documents.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Shield,
    title: "Incident Log",
    description: "Tamper-proof documentation for court-ready records with timestamp verification.",
    color: "bg-destructive/10 text-destructive",
  },
  {
    icon: Users,
    title: "Lawyer Access",
    description: "Grant read-only access to legal representatives for case preparation.",
    color: "bg-muted-foreground/10 text-muted-foreground",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need for{" "}
            <span className="text-gradient">peaceful co-parenting</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A comprehensive suite of tools designed to reduce conflict and keep your children at the center of every decision.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
