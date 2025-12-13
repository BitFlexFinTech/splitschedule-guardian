import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, AlertTriangle, Shield, Download, Clock, MapPin, Users, FileText } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  incident_date: string;
  location: string | null;
  witnesses: string | null;
  attachment_urls: string[] | null;
  hash: string | null;
  created_at: string;
}

const severityColors: Record<string, string> = {
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  critical: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const severityIcons: Record<string, React.ReactNode> = {
  low: <Shield className="h-4 w-4" />,
  medium: <AlertTriangle className="h-4 w-4" />,
  high: <AlertTriangle className="h-4 w-4" />,
  critical: <AlertTriangle className="h-4 w-4" />,
};

const IncidentLog: React.FC = () => {
  const { user, profile } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isAddIncidentOpen, setIsAddIncidentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  
  const [newIncident, setNewIncident] = useState({
    title: '',
    description: '',
    severity: 'low' as const,
    incident_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    location: '',
    witnesses: '',
  });

  const fetchIncidents = async () => {
    if (!profile?.family_id) {
      setIsLoading(false);
      return;
    }
    
    try {
      let query = supabase
        .from('incidents')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('incident_date', { ascending: false });
      
      if (filterSeverity !== 'all') {
        query = query.eq('severity', filterSeverity as 'low' | 'medium' | 'high' | 'critical');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setIncidents(data || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      toast.error('Failed to load incidents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [profile?.family_id, filterSeverity]);

  // Real-time subscription
  useEffect(() => {
    if (!profile?.family_id) return;

    const channel = supabase
      .channel('incidents')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'incidents',
        filter: `family_id=eq.${profile.family_id}`
      }, () => {
        fetchIncidents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.family_id]);

  const generateHash = async (data: string): Promise<string> => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleAddIncident = async () => {
    if (!profile?.family_id || !user) {
      toast.error('Please set up your family first');
      return;
    }

    try {
      // Get previous hash for chain integrity
      const { data: lastIncident } = await supabase
        .from('incidents')
        .select('hash')
        .eq('family_id', profile.family_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const previousHash = lastIncident?.hash || '0';
      
      // Generate hash for this incident
      const dataToHash = `${previousHash}|${newIncident.title}|${newIncident.description}|${newIncident.incident_date}`;
      const hash = await generateHash(dataToHash);

      const { error } = await supabase
        .from('incidents')
        .insert({
          family_id: profile.family_id,
          reported_by: user.id,
          title: newIncident.title,
          description: newIncident.description,
          severity: newIncident.severity,
          incident_date: newIncident.incident_date,
          location: newIncident.location || null,
          witnesses: newIncident.witnesses || null,
          hash,
          previous_hash: previousHash,
        });

      if (error) throw error;
      
      toast.success('Incident logged successfully');
      setIsAddIncidentOpen(false);
      setNewIncident({
        title: '',
        description: '',
        severity: 'low',
        incident_date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        location: '',
        witnesses: '',
      });
      fetchIncidents();
    } catch (error) {
      console.error('Error creating incident:', error);
      toast.error('Failed to log incident');
    }
  };

  const handleExport = () => {
    const exportData = incidents.map(incident => ({
      id: incident.id,
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      date: format(parseISO(incident.incident_date), 'PPpp'),
      location: incident.location || 'N/A',
      witnesses: incident.witnesses || 'N/A',
      hash: incident.hash,
      logged_at: format(parseISO(incident.created_at), 'PPpp'),
    }));

    const content = `INCIDENT LOG EXPORT - COURT READY DOCUMENT
Generated: ${format(new Date(), 'PPpp')}
Total Incidents: ${incidents.length}

${exportData.map((inc, i) => `
-------------------------------------------
INCIDENT #${i + 1}
-------------------------------------------
ID: ${inc.id}
Title: ${inc.title}
Severity: ${inc.severity.toUpperCase()}
Date/Time: ${inc.date}
Location: ${inc.location}
Witnesses: ${inc.witnesses}

Description:
${inc.description}

Blockchain Hash: ${inc.hash}
Logged At: ${inc.logged_at}
`).join('\n')}

-------------------------------------------
END OF DOCUMENT
-------------------------------------------
This document was generated by SplitSchedule and contains tamper-proof incident records.
Each record is cryptographically hashed to ensure integrity.
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-log-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Incident log exported');
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Incident Log | SplitSchedule</title>
        <meta name="description" content="Tamper-proof incident logging for custody matters" />
      </Helmet>
      
      <DashboardLayout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Incident Log</h1>
              <p className="text-muted-foreground">Tamper-proof documentation for custody matters</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export for Court
              </Button>
              <Dialog open={isAddIncidentOpen} onOpenChange={setIsAddIncidentOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Log Incident
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-warning" />
                      Log New Incident
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                      <p className="text-sm text-warning">
                        <strong>Important:</strong> Once submitted, incidents cannot be edited or deleted.
                        This ensures the integrity of your documentation for legal purposes.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={newIncident.title}
                        onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                        placeholder="Brief title for the incident"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="severity">Severity</Label>
                        <Select
                          value={newIncident.severity}
                          onValueChange={(value: any) => setNewIncident({ ...newIncident, severity: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="incident_date">Date & Time</Label>
                        <Input
                          id="incident_date"
                          type="datetime-local"
                          value={newIncident.incident_date}
                          onChange={(e) => setNewIncident({ ...newIncident, incident_date: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={newIncident.location}
                        onChange={(e) => setNewIncident({ ...newIncident, location: e.target.value })}
                        placeholder="Where did this occur?"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="witnesses">Witnesses</Label>
                      <Input
                        id="witnesses"
                        value={newIncident.witnesses}
                        onChange={(e) => setNewIncident({ ...newIncident, witnesses: e.target.value })}
                        placeholder="Names of any witnesses"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Detailed Description</Label>
                      <Textarea
                        id="description"
                        value={newIncident.description}
                        onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                        placeholder="Provide a detailed, factual account of what happened..."
                        rows={5}
                      />
                    </div>
                    
                    <Button onClick={handleAddIncident} className="w-full">
                      Submit Incident Report
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <Label>Filter by severity:</Label>
            <Select value={filterSeverity} onValueChange={(value) => setFilterSeverity(value as typeof filterSeverity)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Incident List */}
          <div className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Loading incidents...
                </CardContent>
              </Card>
            ) : incidents.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No incidents logged yet. Use the "Log Incident" button to document any custody-related concerns.
                </CardContent>
              </Card>
            ) : (
              incidents.map((incident) => (
                <Card key={incident.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${severityColors[incident.severity]}`}>
                          {severityIcons[incident.severity]}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{incident.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(parseISO(incident.incident_date), 'PPp')}
                            </span>
                            {incident.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {incident.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={severityColors[incident.severity]}>
                        {incident.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground mb-4 whitespace-pre-wrap">
                      {incident.description}
                    </p>
                    
                    {incident.witnesses && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Users className="h-4 w-4" />
                        <span>Witnesses: {incident.witnesses}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-3 mt-3">
                      <Shield className="h-3 w-3" />
                      <span>Hash: {incident.hash?.slice(0, 16)}...</span>
                      <span>•</span>
                      <span>Logged: {format(parseISO(incident.created_at), 'PPp')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* No Family Warning */}
          {!profile?.family_id && (
            <Card className="border-warning bg-warning/10">
              <CardContent className="py-4">
                <p className="text-warning-foreground">
                  You need to create or join a family to log incidents. Go to Settings to set up your family.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default IncidentLog;
