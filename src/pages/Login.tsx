import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Eye, EyeOff, ArrowLeft, Users, Scale, Shield, HeadphonesIcon, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DEMO_ACCOUNTS } from "@/lib/config";

type DemoRole = keyof typeof DEMO_ACCOUNTS;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<DemoRole | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        navigate("/dashboard");
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: DemoRole) => {
    setDemoLoading(role);
    const account = DEMO_ACCOUNTS[role];

    try {
      // First try to sign up the demo user (will fail if already exists, that's fine)
      await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: { full_name: account.name }
        }
      });

      // Now sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (error) {
        toast({
          title: "Demo login failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        // Ensure the role exists in user_roles
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('id')
          .eq('user_id', data.user.id)
          .eq('role', account.role)
          .maybeSingle();

        if (!existingRole) {
          await supabase
            .from('user_roles')
            .upsert({ 
              user_id: data.user.id, 
              role: account.role 
            }, { 
              onConflict: 'user_id,role' 
            });
        }

        // Seed demo data for parents
        if (role === 'parent') {
          await supabase.rpc('seed_demo_data_for_user', { demo_user_id: data.user.id });
        }
      }

      toast({
        title: `${account.name} Mode Activated!`,
        description: `Logged in as ${role}. Explore the ${role} dashboard.`,
      });
      
      navigate(account.redirectTo);
    } catch (err) {
      console.error('Demo login error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setDemoLoading(null);
    }
  };

  const demoButtons = [
    { role: 'parent' as DemoRole, icon: Users, label: 'Parent Demo', color: 'from-teal-500 to-cyan-500' },
    { role: 'lawyer' as DemoRole, icon: Scale, label: 'Lawyer Demo', color: 'from-indigo-500 to-purple-500' },
    { role: 'admin' as DemoRole, icon: Shield, label: 'Admin Demo', color: 'from-red-500 to-rose-500' },
    { role: 'support' as DemoRole, icon: HeadphonesIcon, label: 'Support Demo', color: 'from-blue-500 to-sky-500' },
  ];

  return (
    <>
      <Helmet>
        <title>Sign In - SplitSchedule</title>
        <meta name="description" content="Sign in to your SplitSchedule account to manage your co-parenting schedule." />
      </Helmet>
      <div className="min-h-screen bg-gradient-hero flex">
        {/* Left Panel - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Calendar className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
                <p className="text-muted-foreground">Sign in to continue</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Quick Demo Access</span>
              </div>
            </div>

            {/* Demo Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {demoButtons.map(({ role, icon: Icon, label, color }) => (
                <Button
                  key={role}
                  type="button"
                  variant="outline"
                  className={`h-auto py-3 flex flex-col items-center gap-1 bg-gradient-to-r ${color} text-white border-0 hover:opacity-90`}
                  onClick={() => handleDemoLogin(role)}
                  disabled={demoLoading !== null}
                >
                  {demoLoading === role ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  <span className="text-xs font-medium">{label}</span>
                </Button>
              ))}
            </div>

            <p className="text-center text-muted-foreground mt-8">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Right Panel - Visual */}
        <div className="hidden lg:flex flex-1 bg-gradient-primary items-center justify-center p-12">
          <div className="text-center max-w-md">
            <div className="w-32 h-32 mx-auto mb-8 rounded-3xl bg-primary-foreground/10 flex items-center justify-center backdrop-blur-sm">
              <Calendar className="w-16 h-16 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold text-primary-foreground mb-4">
              Co-parenting made simple
            </h2>
            <p className="text-primary-foreground/80">
              Access your custody calendar, track expenses, and communicate securely—all in one place.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
