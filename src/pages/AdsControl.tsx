import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { 
  Megaphone, Plus, ArrowLeft, Loader2, 
  CheckCircle, Clock, AlertTriangle, DollarSign,
  Eye, Trash2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface AdDraft {
  id: string;
  name: string;
  platform: string;
  ad_content: unknown;
  budget: number | null;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

const AdsControl: React.FC = () => {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [ads, setAds] = useState<AdDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAd, setNewAd] = useState({
    name: '',
    platform: 'google',
    headline: '',
    description: '',
    budget: '',
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return;
    }

    if (isAdmin) {
      fetchAds();
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_drafts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
      toast.error('Failed to load ads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAd = async () => {
    if (!newAd.name.trim()) {
      toast.error('Please enter an ad name');
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase.from('ad_drafts').insert({
        name: newAd.name,
        platform: newAd.platform,
        ad_content: {
          headline: newAd.headline,
          description: newAd.description,
        },
        budget: newAd.budget ? parseFloat(newAd.budget) : null,
        status: 'draft',
      });

      if (error) throw error;

      toast.success('Ad draft created');
      setShowCreateDialog(false);
      setNewAd({ name: '', platform: 'google', headline: '', description: '', budget: '' });
      fetchAds();
    } catch (error) {
      console.error('Error creating ad:', error);
      toast.error('Failed to create ad draft');
    } finally {
      setIsCreating(false);
    }
  };

  const handleApproveAd = async (adId: string) => {
    try {
      const { error } = await supabase
        .from('ad_drafts')
        .update({
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', adId);

      if (error) throw error;

      toast.success('Ad approved (sandbox mode - not actually launched)');
      fetchAds();
    } catch (error) {
      console.error('Error approving ad:', error);
      toast.error('Failed to approve ad');
    }
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      const { error } = await supabase
        .from('ad_drafts')
        .delete()
        .eq('id', adId);

      if (error) throw error;

      toast.success('Ad draft deleted');
      fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast.error('Failed to delete ad');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'running':
        return <Badge className="bg-blue-500"><Eye className="h-3 w-3 mr-1" />Running</Badge>;
      case 'paused':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Paused</Badge>;
      default:
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
    }
  };

  const getPlatformBadge = (platform: string) => {
    const colors: Record<string, string> = {
      google: 'bg-blue-500/10 text-blue-600',
      facebook: 'bg-indigo-500/10 text-indigo-600',
      instagram: 'bg-pink-500/10 text-pink-600',
      twitter: 'bg-sky-500/10 text-sky-600',
    };
    return <Badge variant="outline" className={colors[platform] || ''}>{platform}</Badge>;
  };

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
        <title>Ads Control | SplitSchedule Admin</title>
        <meta name="description" content="Manage advertising campaigns and drafts" />
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
                <Megaphone className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">Ads Control</h1>
                  <p className="text-sm text-muted-foreground">Manage advertising campaigns</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                  Sandbox Mode
                </Badge>
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Ad Draft
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Ad Draft</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-yellow-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-medium">Draft Only</span>
                        </div>
                        <p className="text-xs text-yellow-600/80 mt-1">
                          Ads require manual approval before going live. No ads auto-start.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>Ad Name</Label>
                        <Input
                          value={newAd.name}
                          onChange={(e) => setNewAd({ ...newAd, name: e.target.value })}
                          placeholder="Summer Campaign 2024"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Platform</Label>
                        <Select
                          value={newAd.platform}
                          onValueChange={(value) => setNewAd({ ...newAd, platform: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="google">Google Ads</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="twitter">Twitter/X</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Headline</Label>
                        <Input
                          value={newAd.headline}
                          onChange={(e) => setNewAd({ ...newAd, headline: e.target.value })}
                          placeholder="Co-parenting made simple"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={newAd.description}
                          onChange={(e) => setNewAd({ ...newAd, description: e.target.value })}
                          placeholder="Manage custody schedules, track expenses, and communicate securely..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Daily Budget ($)</Label>
                        <Input
                          type="number"
                          value={newAd.budget}
                          onChange={(e) => setNewAd({ ...newAd, budget: e.target.value })}
                          placeholder="50.00"
                        />
                      </div>
                      <Button onClick={handleCreateAd} disabled={isCreating} className="w-full">
                        {isCreating ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : null}
                        Create Draft
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Drafts</p>
                    <p className="text-2xl font-bold">{ads.length}</p>
                  </div>
                  <Megaphone className="h-8 w-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Approval</p>
                    <p className="text-2xl font-bold">{ads.filter(a => a.status === 'draft').length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold">{ads.filter(a => a.status === 'approved').length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500/20" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Budget</p>
                    <p className="text-2xl font-bold">
                      ${ads.reduce((sum, a) => sum + (Number(a.budget) || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ads List */}
          <Card>
            <CardHeader>
              <CardTitle>Ad Drafts</CardTitle>
              <CardDescription>All advertising campaigns and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {ads.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Megaphone className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>No ad drafts yet</p>
                  <p className="text-sm">Create your first ad campaign draft</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ads.map((ad) => {
                    const content = ad.ad_content as { headline?: string; description?: string } | null;
                    return (
                      <div key={ad.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{ad.name}</h4>
                              {getPlatformBadge(ad.platform)}
                              {getStatusBadge(ad.status)}
                            </div>
                            {content?.headline && (
                              <p className="text-sm font-medium text-foreground">{content.headline}</p>
                            )}
                            {content?.description && (
                              <p className="text-sm text-muted-foreground mt-1">{content.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>Budget: ${Number(ad.budget || 0).toFixed(2)}/day</span>
                              <span>Created: {format(parseISO(ad.created_at), 'MMM d, yyyy')}</span>
                              {ad.approved_at && (
                                <span>Approved: {format(parseISO(ad.approved_at), 'MMM d, yyyy')}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {ad.status === 'draft' && (
                              <Button size="sm" onClick={() => handleApproveAd(ad.id)}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteAd(ad.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default AdsControl;
