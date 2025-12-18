import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Shield, Calendar, Clock, AlertTriangle, CheckCircle, ArrowRight, Lock } from 'lucide-react';
import { format } from 'date-fns';

interface FreeIncident {
  id: string;
  title: string;
  description: string;
  date: Date;
  severity: 'low' | 'medium' | 'high';
}

const FreeLog: React.FC = () => {
  const [incidents, setIncidents] = useState<FreeIncident[]>([]);
  const [newIncident, setNewIncident] = useState<{
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>({
    title: '',
    description: '',
    severity: 'low',
  });

  const handleAddIncident = () => {
    if (!newIncident.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    const incident: FreeIncident = {
      id: crypto.randomUUID(),
      title: newIncident.title,
      description: newIncident.description,
      date: new Date(),
      severity: newIncident.severity,
    };

    setIncidents([incident, ...incidents]);
    setNewIncident({ title: '', description: '', severity: 'low' });
    toast.success('Incident logged (local only - not saved)');
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-destructive/10 text-destructive';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <Helmet>
        <title>Free Incident Log | SplitSchedule</title>
        <meta name="description" content="Try our free incident logging tool - no account required" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">SplitSchedule</span>
              </Link>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-green-500/10 text-green-600">
                  Free Tool
                </Badge>
                <Button asChild>
                  <Link to="/signup">
                    Sign Up for Full Features
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Hero */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">Free Incident Log</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Document co-parenting incidents for free. No account required. 
                <span className="text-yellow-600"> Note: Data is stored locally and not saved to cloud.</span>
              </p>
            </div>

            {/* Upgrade Banner */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Want tamper-proof, court-ready logs?</p>
                    <p className="text-sm text-muted-foreground">Sign up for encrypted, timestamped incident records</p>
                  </div>
                </div>
                <Button asChild variant="default">
                  <Link to="/signup">Upgrade Now</Link>
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Incident Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Log New Incident
                  </CardTitle>
                  <CardDescription>Document what happened for your records</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newIncident.title}
                      onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                      placeholder="Brief description of the incident"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Details</Label>
                    <Textarea
                      id="description"
                      value={newIncident.description}
                      onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                      placeholder="Provide detailed account of what happened..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as const).map((sev) => (
                        <Button
                          key={sev}
                          type="button"
                          variant={newIncident.severity === sev ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setNewIncident({ ...newIncident, severity: sev })}
                          className="capitalize"
                        >
                          {sev}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleAddIncident} className="w-full">
                    Log Incident
                  </Button>
                </CardContent>
              </Card>

              {/* Incident List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Your Logged Incidents
                  </CardTitle>
                  <CardDescription>
                    {incidents.length} incident{incidents.length !== 1 ? 's' : ''} logged this session
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {incidents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No incidents logged yet</p>
                      <p className="text-sm">Use the form to document an incident</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {incidents.map((incident) => (
                        <div key={incident.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <h4 className="font-medium">{incident.title}</h4>
                              {incident.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {incident.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">
                                  {format(incident.date, 'MMM d, yyyy HH:mm')}
                                </span>
                              </div>
                            </div>
                            <Badge className={getSeverityColor(incident.severity)}>
                              {incident.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Features Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Free vs Full Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Badge variant="outline">Free</Badge>
                      Basic Logging
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Log incidents locally
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        No account required
                      </li>
                      <li className="flex items-center gap-2 opacity-50">
                        <AlertTriangle className="h-4 w-4" />
                        Data not saved to cloud
                      </li>
                      <li className="flex items-center gap-2 opacity-50">
                        <AlertTriangle className="h-4 w-4" />
                        Not court-admissible
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Badge className="bg-primary">Premium</Badge>
                      Full Protection
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Tamper-proof blockchain anchoring
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Court-ready PDF exports
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        File attachments & photos
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Secure cloud backup
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </>
  );
};

export default FreeLog;
