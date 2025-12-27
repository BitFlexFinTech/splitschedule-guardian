import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Heart, Calendar, CheckCircle, Star, Globe, Lock, Sparkles, Play } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden bg-gradient-hero">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-info/5 rounded-full blur-3xl" />
        
        {/* Floating elements */}
        <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-primary/30 rounded-full animate-float" />
        <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-accent/30 rounded-full animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-info/30 rounded-full animate-float" style={{ animationDelay: "1s" }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Trust Badges Row */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-fade-in">
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
              <Lock className="w-3 h-3" />
              Bank-Level Security
            </Badge>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 gap-1">
              <Globe className="w-3 h-3" />
              US, UK & EU
            </Badge>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 gap-1">
              <Shield className="w-3 h-3" />
              GDPR Compliant
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight animate-slide-up">
            The{" "}
            <span className="relative">
              <span className="text-gradient">smartest way</span>
              <Sparkles className="absolute -top-2 -right-6 w-6 h-6 text-amber-500 animate-pulse" />
            </span>
            <br />
            to co-parent
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Shared custody scheduling, expense tracking, and secure communication.
            <br className="hidden md:block" />
            <span className="text-foreground font-medium">Keep your children first, always.</span>
          </p>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-10 animate-slide-up" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-primary border-2 border-background flex items-center justify-center text-xs text-white font-medium">
                    {['S', 'M', 'L', 'J', 'K'][i]}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">50,000+</span> happy co-parents
                </p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Button variant="hero" size="xl" asChild className="shadow-glow">
              <Link to="/signup" className="gap-2">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <Link to="/login" className="gap-2">
                <Play className="w-4 h-4 fill-current" />
                Try Demo
              </Link>
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            {[
              { icon: Calendar, text: "Custody Calendar", check: true },
              { icon: Heart, text: "Child-Focused", check: true },
              { icon: Shield, text: "Court-Ready", check: true },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-5 py-3 rounded-full bg-card shadow-lg border border-border/50 hover:shadow-xl transition-shadow"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-primary" />
                </div>
                <span className="font-medium text-foreground">{feature.text}</span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 max-w-6xl mx-auto animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-primary rounded-2xl blur-2xl opacity-20 transform scale-95" />
            
            {/* Browser frame */}
            <div className="relative bg-card rounded-2xl shadow-2xl border border-border/50 overflow-hidden">
              {/* Browser header */}
              <div className="bg-secondary/50 px-4 py-3 flex items-center gap-2 border-b border-border/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1.5 rounded-full bg-background text-sm text-muted-foreground flex items-center gap-2">
                    <Lock className="w-3 h-3 text-green-500" />
                    splitschedule.app
                  </div>
                </div>
              </div>
              
              {/* Dashboard preview content */}
              <div className="aspect-[16/9] bg-gradient-to-br from-background to-secondary/20 p-8">
                <div className="h-full grid grid-cols-12 gap-4">
                  {/* Sidebar mock */}
                  <div className="col-span-3 bg-card rounded-xl p-4 shadow-md border border-border/50">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary mb-6 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div className="space-y-3">
                      {['Dashboard', 'Calendar', 'Messages', 'Expenses', 'Reports'].map((item, i) => (
                        <div key={i} className={`h-8 rounded-lg ${i === 0 ? 'bg-primary/10' : 'bg-muted/50'} flex items-center px-3`}>
                          <div className={`w-4 h-4 rounded ${i === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                          <span className={`ml-2 text-xs ${i === 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Main content mock */}
                  <div className="col-span-9 space-y-4">
                    <div className="bg-card rounded-xl p-6 shadow-md border border-border/50 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">Welcome back, Sarah!</h3>
                        <p className="text-sm text-muted-foreground">Next custody exchange in 2 days</p>
                      </div>
                      <Badge className="bg-green-500">On Schedule</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: 'Upcoming Events', value: '3', color: 'text-primary' },
                        { label: 'Unread Messages', value: '2', color: 'text-accent' },
                        { label: 'Pending Expenses', value: '$125', color: 'text-info' },
                      ].map((stat, i) => (
                        <div key={i} className="bg-card rounded-xl p-4 shadow-md border border-border/50">
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-card rounded-xl p-4 shadow-md border border-border/50 h-32 flex items-center justify-center">
                      <div className="text-center">
                        <Calendar className="w-8 h-8 mx-auto text-primary/50 mb-2" />
                        <p className="text-sm text-muted-foreground">Your custody calendar appears here</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
