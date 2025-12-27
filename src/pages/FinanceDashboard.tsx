import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, TrendingDown, CreditCard, RefreshCw, AlertCircle, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell } from "recharts";

const mockRevenueData = [
  { month: "Jan", revenue: 8400 },
  { month: "Feb", revenue: 9200 },
  { month: "Mar", revenue: 10100 },
  { month: "Apr", revenue: 9800 },
  { month: "May", revenue: 11200 },
  { month: "Jun", revenue: 12450 },
];

const mockSubscriptionData = [
  { name: "Free", value: 450, color: "hsl(220, 9%, 46%)" },
  { name: "Basic", value: 320, color: "hsl(221, 83%, 53%)" },
  { name: "Pro", value: 180, color: "hsl(262, 83%, 58%)" },
  { name: "Enterprise", value: 50, color: "hsl(142, 76%, 36%)" },
];

const mockRefunds = [
  { id: 1, user: "Johnson Family", amount: 29.99, reason: "Duplicate charge", status: "pending" },
  { id: 2, user: "Williams Family", amount: 49.99, reason: "Service issue", status: "pending" },
];

const FinanceDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session?.user) navigate("/login");
    });
  }, [navigate]);

  if (loading || !user) return null;

  return (
    <>
      <Helmet>
        <title>Finance Dashboard - SplitSchedule</title>
      </Helmet>
      <DashboardLayout user={user}>
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-light text-foreground">Finance Dashboard</h1>
            <p className="text-muted-foreground">Revenue, subscriptions, and financial analytics</p>
          </div>

          {/* Revenue Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-success">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">MRR</p>
                    <p className="text-2xl font-medium">$12,450</p>
                    <div className="flex items-center gap-1 text-success text-xs">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>+12.5%</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-success/10">
                    <DollarSign className="w-6 h-6 text-success" strokeWidth={1.5} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ARR</p>
                    <p className="text-2xl font-medium">$149,400</p>
                    <div className="flex items-center gap-1 text-success text-xs">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>+18.2%</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-warning">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Refunds</p>
                    <p className="text-2xl font-medium">$79.98</p>
                    <p className="text-xs text-muted-foreground">2 requests</p>
                  </div>
                  <div className="p-3 rounded-lg bg-warning/10">
                    <RefreshCw className="w-6 h-6 text-warning" strokeWidth={1.5} />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-destructive">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Failed Payments</p>
                    <p className="text-2xl font-medium">3</p>
                    <div className="flex items-center gap-1 text-destructive text-xs">
                      <AlertCircle className="w-3 h-3" />
                      <span>Action needed</span>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-destructive/10">
                    <CreditCard className="w-6 h-6 text-destructive" strokeWidth={1.5} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={mockRevenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                    <XAxis dataKey="month" stroke="hsl(220, 9%, 46%)" fontSize={12} />
                    <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(142, 76%, 36%)" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie data={mockSubscriptionData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {mockSubscriptionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {mockSubscriptionData.map((item) => (
                    <Badge key={item.name} variant="outline" style={{ borderColor: item.color, color: item.color }}>
                      {item.name}: {item.value}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Refund Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-warning" strokeWidth={1.5} />
                Pending Refunds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockRefunds.map((refund) => (
                  <div key={refund.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-medium">{refund.user}</p>
                      <p className="text-sm text-muted-foreground">{refund.reason}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">${refund.amount}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-destructive border-destructive/30">Deny</Button>
                        <Button size="sm" className="bg-success hover:bg-success/90">Approve</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default FinanceDashboard;
