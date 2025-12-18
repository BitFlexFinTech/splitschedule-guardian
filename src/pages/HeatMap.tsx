import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Map, Users, TrendingUp, RefreshCw, ArrowLeft, Loader2 } from 'lucide-react';

interface HeatRegion {
  id: string;
  region_name: string;
  country: string;
  state_code: string | null;
  user_count: number;
  family_count: number;
  engagement_score: number;
}

const HeatMap: React.FC = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [regions, setRegions] = useState<HeatRegion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }

    if (isAdmin) {
      fetchRegions();
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('heat_regions')
        .select('*')
        .order('user_count', { ascending: false });

      if (error) throw error;
      setRegions(data || []);
    } catch (error) {
      console.error('Error fetching regions:', error);
      toast.error('Failed to load heat map data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchRegions();
    setIsRefreshing(false);
    toast.success('Heat map data refreshed');
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

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Market Heat Map | SplitSchedule Admin</title>
        <meta name="description" content="View user distribution and market engagement by region" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <Map className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">Market Heat Map</h1>
                  <p className="text-sm text-muted-foreground">User distribution by region</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10">
                  Admin Only
                </Badge>
                <Button onClick={handleRefresh} disabled={isRefreshing}>
                  {isRefreshing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
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
            <Card>
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
            <Card>
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

          {/* Heat Map Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Regional Distribution</CardTitle>
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
                    <div key={region.id} className="p-4 border rounded-lg">
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
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Engagement Score</span>
                          <Badge className={getEngagementColor(Number(region.engagement_score))}>
                            {Number(region.engagement_score).toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Launch Campaign CTA */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-between py-6">
              <div>
                <h3 className="font-semibold text-lg">Ready to launch a regional campaign?</h3>
                <p className="text-sm text-muted-foreground">
                  Target high-engagement regions with tailored marketing
                </p>
              </div>
              <Button onClick={() => navigate('/admin')}>
                Go to Campaign Manager
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default HeatMap;
