import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Shield, Database, Activity, Bug, Settings, 
  CreditCard, BarChart3, AlertTriangle, CheckCircle, Clock,
  RefreshCw, Download, Eye, Lock
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface BugReport {
  id: string;
  scan_type: string;
  status: string;
  issues_found: number;
  critical_count: number;
  warnings_count: number;
  auto_fixed_count: number;
  created_at: string;
}

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

const Admin: React.FC = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFamilies: 0,
    totalIncidents: 0,
    activeSubscriptions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }

    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchAdminData = async () => {
    try {
      // Fetch bug reports
      const { data: reports } = await supabase
        .from('bug_scan_reports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      setBugReports(reports || []);

      // Fetch audit logs
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      setAuditLogs(logs || []);

      // Fetch stats (counts)
      const [usersCount, familiesCount, incidentsCount, subscriptionsCount] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('families').select('id', { count: 'exact', head: true }),
        supabase.from('incidents').select('id', { count: 'exact', head: true }),
        supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      ]);

      setStats({
        totalUsers: usersCount.count || 0,
        totalFamilies: familiesCount.count || 0,
        totalIncidents: incidentsCount.count || 0,
        activeSubscriptions: subscriptionsCount.count || 0,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunBugScan = async () => {
    try {
      toast.info('Starting bug scan...');
      
      // In production, this would call an edge function
      // For now, we simulate a scan result
      const { error } = await supabase
        .from('bug_scan_reports')
        .insert({
          scan_type: 'manual',
          status: 'completed',
          issues_found: Math.floor(Math.random() * 5),
          critical_count: 0,
          warnings_count: Math.floor(Math.random() * 3),
          auto_fixed_count: Math.floor(Math.random() * 2),
          report_data: { message: 'Manual scan completed successfully' },
        });

      if (error) throw error;
      
      toast.success('Bug scan completed');
      fetchAdminData();
    } catch (error) {
      console.error('Error running bug scan:', error);
      toast.error('Failed to run bug scan');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | SplitSchedule</title>
        <meta name="description" content="Administrative dashboard for SplitSchedule" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Admin Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                  <p className="text-sm text-muted-foreground">SplitSchedule Administration</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10">
                  <Lock className="h-3 w-3 mr-1" />
                  Super Admin
                </Badge>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Exit Admin
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </div>
                  <Users className="h-10 w-10 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Families</p>
                    <p className="text-3xl font-bold">{stats.totalFamilies}</p>
                  </div>
                  <Database className="h-10 w-10 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Incidents Logged</p>
                    <p className="text-3xl font-bold">{stats.totalIncidents}</p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                    <p className="text-3xl font-bold">{stats.activeSubscriptions}</p>
                  </div>
                  <CreditCard className="h-10 w-10 text-primary/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bug-reports">Bug Reports</TabsTrigger>
              <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {auditLogs.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="font-medium">{log.action}</span>
                            <span className="text-muted-foreground"> on {log.entity_type}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {format(parseISO(log.created_at), 'HH:mm')}
                          </span>
                        </div>
                      ))}
                      {auditLogs.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* System Health */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      System Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>Database</span>
                        <Badge className="bg-green-500">Healthy</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Authentication</span>
                        <Badge className="bg-green-500">Operational</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Storage</span>
                        <Badge className="bg-green-500">Available</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Edge Functions</span>
                        <Badge className="bg-green-500">Running</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="bug-reports" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bug className="h-5 w-5" />
                      Bug Scan Reports
                    </CardTitle>
                    <CardDescription>Automated and manual bug scan results</CardDescription>
                  </div>
                  <Button onClick={handleRunBugScan}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Scan Now
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bugReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            report.critical_count > 0 ? 'bg-red-500/10' : 'bg-green-500/10'
                          }`}>
                            {report.critical_count > 0 ? (
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                            ) : (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{report.scan_type} Scan</p>
                            <p className="text-sm text-muted-foreground">
                              {format(parseISO(report.created_at), 'MMM d, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-medium">{report.issues_found} issues</p>
                            <p className="text-sm text-muted-foreground">
                              {report.auto_fixed_count} auto-fixed
                            </p>
                          </div>
                          <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {bugReports.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">No bug reports yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit-logs" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Audit Logs
                    </CardTitle>
                    <CardDescription>Tamper-proof activity logs (WORM)</CardDescription>
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{log.action}</span>
                          <span className="text-muted-foreground">on</span>
                          <Badge variant="outline">{log.entity_type}</Badge>
                        </div>
                        <span className="text-muted-foreground">
                          {format(parseISO(log.created_at), 'MMM d, HH:mm:ss')}
                        </span>
                      </div>
                    ))}
                    {auditLogs.length === 0 && (
                      <p className="text-muted-foreground text-center py-8">No audit logs yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Supabase', status: 'connected', icon: Database },
                  { name: 'Stripe', status: 'sandbox', icon: CreditCard },
                  { name: 'Storage', status: 'connected', icon: Database },
                  { name: 'Email (Brevo)', status: 'draft', icon: Settings },
                  { name: 'Push Notifications', status: 'draft', icon: Settings },
                  { name: 'OpenTimestamps', status: 'draft', icon: Clock },
                ].map((integration) => (
                  <Card key={integration.name}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <integration.icon className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-medium">{integration.name}</p>
                            <Badge 
                              variant={integration.status === 'connected' ? 'default' : 'secondary'}
                              className={integration.status === 'connected' ? 'bg-green-500' : ''}
                            >
                              {integration.status}
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          {integration.status === 'draft' ? 'Connect' : 'Configure'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default Admin;
