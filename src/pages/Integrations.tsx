import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { APP_CONFIG } from '@/lib/config';
import { 
  Database, CreditCard, Mail, Cloud, Lock, 
  Calendar, Shield, ExternalLink, Check, Clock,
  Cpu, Bell, AlertTriangle
} from 'lucide-react';

interface Integration {
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'connected' | 'sandbox' | 'draft';
  phase: 1 | 2;
  isLovableCloud?: boolean;
}

const integrations: Integration[] = [
  {
    name: 'Lovable Cloud (Database)',
    description: 'PostgreSQL database with real-time subscriptions',
    icon: Database,
    status: 'connected',
    phase: 1,
    isLovableCloud: true,
  },
  {
    name: 'Lovable Cloud (Auth)',
    description: 'User authentication and session management',
    icon: Shield,
    status: 'connected',
    phase: 1,
    isLovableCloud: true,
  },
  {
    name: 'Lovable Cloud (Storage)',
    description: 'File storage for documents and avatars',
    icon: Cloud,
    status: 'connected',
    phase: 1,
    isLovableCloud: true,
  },
  {
    name: 'Lovable AI (Tone Analyzer)',
    description: 'AI-powered message tone analysis',
    icon: Cpu,
    status: 'connected',
    phase: 1,
    isLovableCloud: true,
  },
  {
    name: 'Stripe Payments',
    description: 'Subscription billing and payments',
    icon: CreditCard,
    status: 'sandbox',
    phase: 1,
  },
  {
    name: 'Stripe Issuing',
    description: 'Restricted debit cards for child expenses',
    icon: CreditCard,
    status: 'sandbox',
    phase: 1,
  },
  {
    name: 'Email Notifications',
    description: 'Transactional email service',
    icon: Mail,
    status: 'sandbox',
    phase: 1,
  },
  {
    name: 'Push Notifications',
    description: 'Real-time push notifications',
    icon: Bell,
    status: 'sandbox',
    phase: 1,
  },
  {
    name: 'Google Calendar',
    description: 'Two-way calendar sync',
    icon: Calendar,
    status: 'draft',
    phase: 2,
  },
  {
    name: 'OpenTimestamps',
    description: 'Blockchain timestamp anchoring for legal proof',
    icon: Shield,
    status: 'draft',
    phase: 2,
  },
];

const statusColors: Record<string, string> = {
  connected: 'bg-green-500',
  sandbox: 'bg-yellow-500',
  draft: 'bg-muted',
};

const statusLabels: Record<string, string> = {
  connected: 'Connected',
  sandbox: 'Sandbox',
  draft: 'Not Connected',
};

const Integrations: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [connecting, setConnecting] = useState<string | null>(null);

  const handleConnect = async (integration: Integration) => {
    if (integration.isLovableCloud) {
      toast.info(`${integration.name} is automatically connected via Lovable Cloud`);
      return;
    }

    if (integration.status === 'connected') {
      toast.info(`${integration.name} is already connected`);
      return;
    }

    setConnecting(integration.name);
    
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (APP_CONFIG.MOCK_MODE) {
      toast.success(`${integration.name} connected (Sandbox Mode)`);
    } else {
      toast.info(`${integration.name} requires API key configuration`);
    }
    
    setConnecting(null);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Integrations | SplitSchedule</title>
        <meta name="description" content="Manage third-party integrations" />
      </Helmet>
      
      <DashboardLayout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
            <p className="text-muted-foreground">Connect third-party services to enhance your experience</p>
          </div>

          {/* Mock Mode Banner */}
          {APP_CONFIG.MOCK_MODE && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-yellow-600">Demo Mode Active</p>
                <p className="text-sm text-yellow-600/80">
                  All integrations are simulated. No real API keys are required.
                </p>
              </div>
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                Mock Mode
              </Badge>
            </div>
          )}

          {/* Lovable Cloud Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">Lovable Cloud</h2>
              <Badge className="bg-green-500">Auto-Connected</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              These services are automatically configured and managed by Lovable Cloud.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.filter(i => i.isLovableCloud).map((integration) => (
                <Card key={integration.name} className="border-green-500/20 bg-green-500/5">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-green-500/10">
                          <integration.icon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                          <Badge className="mt-2 bg-green-500 text-white">
                            <Check className="h-3 w-3 mr-1" />
                            {statusLabels[integration.status]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Phase 1 Integrations */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              Phase 1 - Available Now
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.filter(i => i.phase === 1 && !i.isLovableCloud).map((integration) => (
                <Card key={integration.name}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-primary/10">
                          <integration.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                          <Badge 
                            variant="secondary" 
                            className={`mt-2 ${statusColors[integration.status]} text-white`}
                          >
                            {statusLabels[integration.status]}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant={integration.status === 'connected' ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleConnect(integration)}
                        disabled={connecting === integration.name}
                      >
                        {connecting === integration.name 
                          ? 'Connecting...' 
                          : integration.status === 'connected' 
                            ? 'Configure' 
                            : 'Connect'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Phase 2 Integrations */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Phase 2 - Coming Soon
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.filter(i => i.phase === 2).map((integration) => (
                <Card key={integration.name} className="opacity-60">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-muted">
                          <integration.icon className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{integration.name}</h3>
                          <p className="text-sm text-muted-foreground">{integration.description}</p>
                          <Badge variant="outline" className="mt-2">
                            Phase 2
                          </Badge>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" disabled>
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Admin Note */}
          {isAdmin && (
            <Card className="border-primary bg-primary/5">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Admin Mode</p>
                    <p className="text-sm text-muted-foreground">
                      All integrations require manual connection and approval. No auto-starts are enabled.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* API Documentation Link */}
          <Card>
            <CardContent className="py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Developer API</h3>
                  <p className="text-sm text-muted-foreground">
                    Build custom integrations with our REST API (Pro plan required)
                  </p>
                </div>
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Docs
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Integrations;
