import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Calendar, FileText, MessageSquare, Video, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const mockCases = [
  { id: 1, family: "Smith vs. Smith", status: "active", nextSession: "Dec 28, 2025", progress: 60 },
  { id: 2, family: "Johnson vs. Johnson", status: "active", nextSession: "Jan 2, 2026", progress: 30 },
  { id: 3, family: "Williams vs. Williams", status: "pending", nextSession: "Scheduling...", progress: 0 },
  { id: 4, family: "Brown vs. Brown", status: "resolved", nextSession: "Completed", progress: 100 },
];

const mockSessions = [
  { id: 1, family: "Smith Family", date: "Dec 28, 2025", time: "10:00 AM", type: "video" },
  { id: 2, family: "Johnson Family", date: "Jan 2, 2026", time: "2:00 PM", type: "video" },
];

const MediatorDashboard = () => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active": return <Badge className="bg-primary text-primary-foreground">Active</Badge>;
      case "pending": return <Badge className="bg-warning text-warning-foreground">Pending</Badge>;
      case "resolved": return <Badge className="bg-success text-success-foreground">Resolved</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Mediator Dashboard - SplitSchedule</title>
      </Helmet>
      <DashboardLayout user={user}>
        <div className="space-y-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-light text-foreground">Mediator Dashboard</h1>
            <p className="text-muted-foreground">Manage cases, sessions, and agreements</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-primary">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">4</p>
                    <p className="text-xs text-muted-foreground">Active Cases</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-purple">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple/10">
                    <Calendar className="w-5 h-5 text-purple" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">2</p>
                    <p className="text-xs text-muted-foreground">Upcoming Sessions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-warning">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <FileText className="w-5 h-5 text-warning" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium">3</p>
                    <p className="text-xs text-muted-foreground">Draft Agreements</p>
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
                    <p className="text-2xl font-medium">12</p>
                    <p className="text-xs text-muted-foreground">Cases Resolved</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Case Load */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  Case Load
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCases.map((c) => (
                    <div key={c.id} className="p-4 rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{c.family}</h4>
                        {getStatusBadge(c.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{c.nextSession}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${c.progress}%` }} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{c.progress}% complete</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Video className="w-5 h-5 text-purple" strokeWidth={1.5} />
                  Upcoming Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSessions.map((session) => (
                    <div key={session.id} className="p-4 rounded-lg border border-border bg-purple/5">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{session.family}</h4>
                        <Badge variant="outline" className="bg-purple/10 text-purple border-purple/30">
                          <Video className="w-3 h-3 mr-1" />
                          Video Call
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {session.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {session.time}
                        </span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" className="bg-purple hover:bg-purple/90">
                          <Video className="w-4 h-4 mr-2" />
                          Join Session
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};

export default MediatorDashboard;
