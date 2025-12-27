import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, Users, TrendingUp, Activity, MessageSquare, Calendar, DollarSign, FileText } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const activityData = [
  { name: "Mon", messages: 45, events: 12, expenses: 8 },
  { name: "Tue", messages: 52, events: 15, expenses: 12 },
  { name: "Wed", messages: 61, events: 18, expenses: 6 },
  { name: "Thu", messages: 48, events: 14, expenses: 15 },
  { name: "Fri", messages: 72, events: 22, expenses: 9 },
  { name: "Sat", messages: 38, events: 8, expenses: 4 },
  { name: "Sun", messages: 29, events: 6, expenses: 3 },
];

const userDistribution = [
  { name: "Parents", value: 1250, color: "hsl(221, 83%, 53%)" },
  { name: "Lawyers", value: 85, color: "hsl(262, 83%, 58%)" },
  { name: "Mediators", value: 42, color: "hsl(328, 81%, 56%)" },
  { name: "Partners", value: 120, color: "hsl(142, 76%, 36%)" },
];

const AnalyticsDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) navigate("/login");
    });
  }, [navigate]);

  if (loading || !user) return null;

  const isAdmin = hasRole("superadmin");
  const isFinance = hasRole("finance_manager");
  const isSupport = hasRole("support_agent");

  return (
    <>
      <Helmet>
        <title>Analytics - SplitSchedule</title>
      </Helmet>
      <DashboardLayout user={user}>
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-light text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground">Platform metrics and insights</p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">1,497</p>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-success">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <Activity className="w-5 h-5 text-success" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">892</p>
                    <p className="text-xs text-muted-foreground">Active Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple/10">
                    <MessageSquare className="w-5 h-5 text-purple" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">2,450</p>
                    <p className="text-xs text-muted-foreground">Messages/Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber/10">
                    <Calendar className="w-5 h-5 text-amber" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">1,234</p>
                    <p className="text-xs text-muted-foreground">Events/Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Trends */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  Weekly Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={activityData}>
                    <defs>
                      <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis dataKey="name" stroke="hsl(220, 9%, 46%)" fontSize={12} />
                    <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="messages" stroke="hsl(221, 83%, 53%)" fill="url(#colorMessages)" strokeWidth={2} />
                    <Area type="monotone" dataKey="events" stroke="hsl(262, 83%, 58%)" fill="url(#colorEvents)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  User Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={userDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                      {userDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Activity Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple" strokeWidth={1.5} />
                  Activity by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis dataKey="name" stroke="hsl(220, 9%, 46%)" fontSize={12} />
                    <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="messages" fill="hsl(221, 83%, 53%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="events" fill="hsl(262, 83%, 58%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default AnalyticsDashboard;
