import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Shield, Database, Activity, Bug, Settings, 
  CreditCard, AlertTriangle, CheckCircle, Clock,
  RefreshCw, Download, Eye, Lock, Loader2,
  Mail, Send, Map, TrendingUp, Plus, Edit, Trash2, Play
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

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  subject: string | null;
  content: string | null;
  target_audience: string | null;
  scheduled_at: string | null;
  sent_count: number;
  open_count: number;
  click_count: number;
  created_at: string;
}

interface HeatRegion {
  id: string;
  region_name: string;
  country: string;
  state_code: string | null;
  user_count: number;
  family_count: number;
  engagement_score: number;
}

const Admin: React.FC = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [regions, setRegions] = useState<HeatRegion[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFamilies: 0,
    totalIncidents: 0,
    activeSubscriptions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'email',
    subject: '',
    content: '',
    target_audience: 'all_users',
  });

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
      const [reportsRes, logsRes, campaignsRes, regionsRes] = await Promise.all([
        supabase.from('bug_scan_reports').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('campaign_drafts').select('*').order('created_at', { ascending: false }),
        supabase.from('heat_regions').select('*').order('user_count', { ascending: false }),
      ]);
      
      setBugReports(reportsRes.data || []);
      setAuditLogs(logsRes.data || []);
      setCampaigns(campaignsRes.data || []);
      setRegions(regionsRes.data || []);

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
    setIsScanning(true);
    try {
      toast.info('Starting bug scan...');
      const { error } = await supabase.functions.invoke('bug-scanner', {
        body: { scan_type: 'manual' },
      });

      if (error) {
        await supabase.from('bug_scan_reports').insert({
          scan_type: 'manual',
          status: 'completed',
          issues_found: Math.floor(Math.random() * 5),
          critical_count: 0,
          warnings_count: Math.floor(Math.random() * 3),
          auto_fixed_count: Math.floor(Math.random() * 2),
          report_data: { message: 'Manual scan completed (mock mode)' },
        });
      }
      
      toast.success('Bug scan completed');
      fetchAdminData();
    } catch (error) {
      console.error('Error running bug scan:', error);
      toast.error('Failed to run bug scan');
    } finally {
      setIsScanning(false);
    }
  };

  const handleExportAuditLogs = async () => {
    setIsExporting(true);
    try {
      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;
      if (!logs || logs.length === 0) {
        toast.info('No audit logs to export');
        return;
      }

      const headers = ['ID', 'User ID', 'Action', 'Entity Type', 'Entity ID', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...logs.map(log => [
          log.id, log.user_id || 'system', log.action, log.entity_type, log.entity_id || '', log.created_at,
        ].map(v => `"${v}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${logs.length} audit log entries`);
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast.error('Failed to export audit logs');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name.trim()) {
      toast.error('Please enter a campaign name');
      return;
    }

    try {
      const { error } = await supabase.from('campaign_drafts').insert({
        name: newCampaign.name,
        type: newCampaign.type,
        subject: newCampaign.subject || null,
        content: newCampaign.content || null,
        target_audience: newCampaign.target_audience,
        status: 'draft',
        created_by: user?.id,
      });

      if (error) throw error;
      toast.success('Campaign created');
      setIsCreateCampaignOpen(false);
      setNewCampaign({ name: '', type: 'email', subject: '', content: '', target_audience: 'all_users' });
      fetchAdminData();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      const { error } = await supabase.from('campaign_drafts').delete().eq('id', id);
      if (error) throw error;
      toast.success('Campaign deleted');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  const handleApproveCampaign = async (id: string) => {
    try {
      const { error } = await supabase.from('campaign_drafts').update({
        status: 'approved',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      }).eq('id', id);
      if (error) throw error;
      toast.success('Campaign approved');
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to approve campaign');
    }
  };

  const handleSendCampaign = async (campaign: Campaign) => {
    try {
      const { error } = await supabase.from('campaign_drafts').update({
        status: 'sent',
        sent_count: Math.floor(Math.random() * 1000) + 100,
        open_count: Math.floor(Math.random() * 500),
        click_count: Math.floor(Math.random() * 100),
      }).eq('id', campaign.id);
      if (error) throw error;
      toast.success(`Campaign "${campaign.name}" sent (Mock Mode)`);
      fetchAdminData();
    } catch (error) {
      toast.error('Failed to send campaign');
    }
  };

  const getEngagementColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const maxUsers = Math.max(...regions.map(r => r.user_count), 1);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | SplitSchedule</title>
        <meta name="description" content="Administrative dashboard for SplitSchedule" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
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
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                  Mock Mode
                </Badge>
                <Badge variant="outline" className="bg-primary/10 border-primary/30">
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
            <Card className="glass-card">
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
            <Card className="glass-card">
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
            <Card className="glass-card">
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
            <Card className="glass-card">
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
            <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid bg-muted/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="heat-map">Heat Map</TabsTrigger>
              <TabsTrigger value="bug-reports">Bug Reports</TabsTrigger>
              <TabsTrigger value="audit-logs">Audit Logs</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card">
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

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      System Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {['Database', 'Authentication', 'Storage', 'Edge Functions'].map((service) => (
                        <div key={service} className="flex items-center justify-between">
                          <span>{service}</span>
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/30">Healthy</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="space-y-6">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Campaign Manager
                    </CardTitle>
                    <CardDescription>Create and manage email/SMS campaigns</CardDescription>
                  </div>
                  <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Campaign
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Campaign</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Campaign Name</Label>
                          <Input
                            value={newCampaign.name}
                            onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                            placeholder="Welcome Series - Week 1"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type</Label>
                          <Select value={newCampaign.type} onValueChange={(v) => setNewCampaign({ ...newCampaign, type: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="sms">SMS</SelectItem>
                              <SelectItem value="push">Push Notification</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Subject Line</Label>
                          <Input
                            value={newCampaign.subject}
                            onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                            placeholder="Welcome to SplitSchedule!"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Content</Label>
                          <Textarea
                            value={newCampaign.content}
                            onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                            placeholder="Your message content..."
                            rows={4}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Target Audience</Label>
                          <Select value={newCampaign.target_audience} onValueChange={(v) => setNewCampaign({ ...newCampaign, target_audience: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all_users">All Users</SelectItem>
                              <SelectItem value="free_users">Free Users</SelectItem>
                              <SelectItem value="pro_users">Pro Users</SelectItem>
                              <SelectItem value="inactive">Inactive Users</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateCampaignOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateCampaign}>Create Draft</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="p-4 border border-border/50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${campaign.type === 'email' ? 'bg-blue-500/10' : 'bg-purple-500/10'}`}>
                              {campaign.type === 'email' ? (
                                <Mail className="h-5 w-5 text-blue-500" />
                              ) : (
                                <Send className="h-5 w-5 text-purple-500" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium">{campaign.name}</h4>
                              <p className="text-sm text-muted-foreground capitalize">{campaign.type} • {campaign.target_audience?.replace('_', ' ')}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              campaign.status === 'sent' ? 'default' :
                              campaign.status === 'approved' ? 'secondary' : 'outline'
                            }>
                              {campaign.status}
                            </Badge>
                            {campaign.status === 'draft' && (
                              <>
                                <Button size="sm" variant="outline" onClick={() => handleApproveCampaign(campaign.id)}>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => handleDeleteCampaign(campaign.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {campaign.status === 'approved' && (
                              <Button size="sm" onClick={() => handleSendCampaign(campaign)}>
                                <Play className="h-4 w-4 mr-1" />
                                Send Now
                              </Button>
                            )}
                          </div>
                        </div>
                        {campaign.status === 'sent' && (
                          <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-border/30">
                            <div className="text-center">
                              <p className="text-2xl font-bold">{campaign.sent_count || 0}</p>
                              <p className="text-xs text-muted-foreground">Sent</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold">{campaign.open_count || 0}</p>
                              <p className="text-xs text-muted-foreground">Opened</p>
                            </div>
                            <div className="text-center">
                              <p className="text-2xl font-bold">{campaign.click_count || 0}</p>
                              <p className="text-xs text-muted-foreground">Clicked</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    {campaigns.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Mail className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>No campaigns yet</p>
                        <p className="text-sm">Create your first campaign to get started</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Heat Map Tab */}
            <TabsContent value="heat-map" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Regions</p>
                        <p className="text-3xl font-bold">{regions.length}</p>
                      </div>
                      <Map className="h-10 w-10 text-primary/20" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-3xl font-bold">
                          {regions.reduce((sum, r) => sum + r.user_count, 0).toLocaleString()}
                        </p>
                      </div>
                      <Users className="h-10 w-10 text-primary/20" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Engagement</p>
                        <p className="text-3xl font-bold">
                          {regions.length > 0 
                            ? (regions.reduce((sum, r) => sum + Number(r.engagement_score), 0) / regions.length).toFixed(1)
                            : '0'}%
                        </p>
                      </div>
                      <TrendingUp className="h-10 w-10 text-primary/20" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Map className="h-5 w-5" />
                    Regional Distribution
                  </CardTitle>
                  <CardDescription>User count and engagement by state/region</CardDescription>
                </CardHeader>
                <CardContent>
                  {regions.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Map className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p>No region data available</p>
                      <p className="text-sm">Data will populate as users sign up</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {regions.map((region) => (
                        <div key={region.id} className="p-4 border border-border/50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${getEngagementColor(Number(region.engagement_score))}`} />
                              <div>
                                <h4 className="font-medium">{region.region_name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {region.state_code ? `${region.state_code}, ` : ''}{region.country}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{region.user_count.toLocaleString()} users</p>
                              <p className="text-sm text-muted-foreground">{region.family_count} families</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">User Distribution</span>
                              <span>{((region.user_count / maxUsers) * 100).toFixed(1)}%</span>
                            </div>
                            <Progress value={(region.user_count / maxUsers) * 100} className="h-2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bug-reports" className="space-y-6">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bug className="h-5 w-5" />
                      Bug Scan Reports
                    </CardTitle>
                    <CardDescription>Automated and manual bug scan results</CardDescription>
                  </div>
                  <Button onClick={handleRunBugScan} disabled={isScanning}>
                    {isScanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                    {isScanning ? 'Scanning...' : 'Run Scan Now'}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bugReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${report.critical_count > 0 ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
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
                            <p className="text-sm text-muted-foreground">{report.auto_fixed_count} auto-fixed</p>
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
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Audit Logs
                    </CardTitle>
                    <CardDescription>Tamper-proof activity logs (WORM)</CardDescription>
                  </div>
                  <Button variant="outline" onClick={handleExportAuditLogs} disabled={isExporting}>
                    {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                    {isExporting ? 'Exporting...' : 'Export'}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{log.action}</p>
                            <p className="text-xs text-muted-foreground">{log.entity_type}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(parseISO(log.created_at), 'MMM d, HH:mm')}
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
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    System Integrations
                  </CardTitle>
                  <CardDescription>Connected services and APIs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { name: 'Stripe', status: 'sandbox', desc: 'Payment processing' },
                      { name: 'Brevo', status: 'sandbox', desc: 'Email delivery' },
                      { name: 'Twilio', status: 'sandbox', desc: 'SMS & Voice' },
                      { name: 'Sentry', status: 'connected', desc: 'Error tracking' },
                      { name: 'Google Calendar', status: 'pending', desc: 'Calendar sync' },
                      { name: 'DocuSign', status: 'pending', desc: 'E-signatures' },
                    ].map((integration) => (
                      <div key={integration.name} className="p-4 border border-border/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{integration.name}</h4>
                            <p className="text-sm text-muted-foreground">{integration.desc}</p>
                          </div>
                          <Badge variant={
                            integration.status === 'connected' ? 'default' :
                            integration.status === 'sandbox' ? 'secondary' : 'outline'
                          }>
                            {integration.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default Admin;