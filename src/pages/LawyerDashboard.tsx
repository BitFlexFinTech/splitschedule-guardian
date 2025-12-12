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
  FileText, Download, AlertTriangle, Clock, 
  Shield, Eye, Calendar, Users, LogOut
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: string;
  incident_date: string;
  created_at: string;
}

interface FileRecord {
  id: string;
  file_name: string;
  file_type: string;
  created_at: string;
}

const LawyerDashboard: React.FC = () => {
  const { user, profile, hasRole, signOut } = useAuth();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasRole('lawyer')) {
      toast.error('Access denied. Lawyer privileges required.');
      navigate('/dashboard');
      return;
    }

    fetchLawyerData();
  }, [hasRole, navigate]);

  const fetchLawyerData = async () => {
    if (!profile?.family_id) {
      setIsLoading(false);
      return;
    }

    try {
      // Fetch incidents
      const { data: incidentsData } = await supabase
        .from('incidents')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('incident_date', { ascending: false });

      setIncidents(incidentsData || []);

      // Fetch files
      const { data: filesData } = await supabase
        .from('files')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('created_at', { ascending: false });

      setFiles(filesData || []);
    } catch (error) {
      console.error('Error fetching lawyer data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportIncidents = () => {
    const content = incidents.map(inc => 
      `---\nTitle: ${inc.title}\nSeverity: ${inc.severity}\nDate: ${format(parseISO(inc.incident_date), 'PPpp')}\nDescription:\n${inc.description}\n`
    ).join('\n');

    const blob = new Blob([`INCIDENT LOG EXPORT\nGenerated: ${format(new Date(), 'PPpp')}\n\n${content}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-log-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Incidents exported');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Lawyer Dashboard | SplitSchedule</title>
        <meta name="description" content="Read-only access for legal professionals" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">Lawyer Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Read-only case access</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-accent/10">
                  <Eye className="h-3 w-3 mr-1" />
                  Read Only
                </Badge>
                <Button variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Incidents</p>
                    <p className="text-3xl font-bold">{incidents.length}</p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Documents</p>
                    <p className="text-3xl font-bold">{files.length}</p>
                  </div>
                  <FileText className="h-10 w-10 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Critical Incidents</p>
                    <p className="text-3xl font-bold">
                      {incidents.filter(i => i.severity === 'critical').length}
                    </p>
                  </div>
                  <Shield className="h-10 w-10 text-primary/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="incidents" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="incidents">Incident Log</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              <Button variant="outline" onClick={handleExportIncidents}>
                <Download className="h-4 w-4 mr-2" />
                Export for Court
              </Button>
            </div>

            <TabsContent value="incidents" className="space-y-4">
              {incidents.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No incidents logged</p>
                  </CardContent>
                </Card>
              ) : (
                incidents.map((incident) => (
                  <Card key={incident.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{incident.title}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(incident.incident_date), 'PPp')}
                          </CardDescription>
                        </div>
                        <Badge variant={incident.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {incident.severity}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm whitespace-pre-wrap">{incident.description}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              {files.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents available</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-primary" />
                            <div>
                              <p className="font-medium">{file.file_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(parseISO(file.created_at), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* No Family Warning */}
          {!profile?.family_id && (
            <Card className="mt-6 border-warning bg-warning/10">
              <CardContent className="py-4">
                <p className="text-warning-foreground">
                  You are not connected to a family case yet. Ask the family to invite you.
                </p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  );
};

export default LawyerDashboard;
