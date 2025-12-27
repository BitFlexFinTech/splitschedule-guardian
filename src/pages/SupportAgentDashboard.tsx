import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { AgentChatPanel } from "@/components/support/AgentChatPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Inbox, Clock, CheckCircle2, TrendingUp, MessageCircle, Users, AlertCircle, Timer } from "lucide-react";

// Mock data for support agent dashboard
const mockTickets = [
  { id: 1, subject: "Login issue with new account", priority: "high", status: "open", user: "Smith Family", time: "2m ago" },
  { id: 2, subject: "Calendar sync not working", priority: "medium", status: "open", user: "Johnson Family", time: "15m ago" },
  { id: 3, subject: "Payment failed", priority: "urgent", status: "in_progress", user: "Williams Family", time: "1h ago" },
  { id: 4, subject: "Feature request: Dark mode", priority: "low", status: "open", user: "Brown Family", time: "2h ago" },
];

const mockStats = {
  openTickets: 12,
  inProgress: 5,
  resolvedToday: 23,
  avgResponseTime: "4.2m",
  satisfactionRate: 94,
};

const SupportAgentDashboard = () => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-orange text-orange-foreground";
      case "medium": return "bg-warning text-warning-foreground";
      case "low": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <>
      <Helmet>
        <title>Support Dashboard - SplitSchedule</title>
      </Helmet>
      <DashboardLayout user={user}>
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-light text-foreground">Support Agent Dashboard</h1>
            <p className="text-muted-foreground">Manage tickets and live customer chats</p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Inbox className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">{mockStats.openTickets}</p>
                    <p className="text-xs text-muted-foreground">Open Tickets</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-warning">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Clock className="w-5 h-5 text-warning" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">{mockStats.inProgress}</p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-success">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-success/10">
                    <CheckCircle2 className="w-5 h-5 text-success" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">{mockStats.resolvedToday}</p>
                    <p className="text-xs text-muted-foreground">Resolved Today</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-info">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-info/10">
                    <Timer className="w-5 h-5 text-info" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">{mockStats.avgResponseTime}</p>
                    <p className="text-xs text-muted-foreground">Avg Response</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Queue */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange" strokeWidth={1.5} />
                Ticket Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority.toUpperCase()}
                      </Badge>
                      <div>
                        <p className="font-medium text-foreground">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground">{ticket.user} • {ticket.time}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Live Chat Panel */}
          <div>
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" strokeWidth={1.5} />
              Live Chat Support
            </h2>
            <AgentChatPanel />
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default SupportAgentDashboard;
