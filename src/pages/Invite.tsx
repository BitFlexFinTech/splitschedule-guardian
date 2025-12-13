import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  UserPlus, Mail, Copy, Trash2, Clock, 
  CheckCircle, Users, Shield 
} from 'lucide-react';
import { format, parseISO, addDays } from 'date-fns';

interface Invite {
  id: string;
  email: string;
  role: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

const Invite: React.FC = () => {
  const { user, profile } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newInvite, setNewInvite] = useState<{
    email: string;
    role: 'parent' | 'lawyer';
  }>({
    email: '',
    role: 'parent',
  });

  const fetchInvites = async () => {
    if (!profile?.family_id) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error('Error fetching invites:', error);
      toast.error('Failed to load invites');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [profile?.family_id]);

  const generateToken = () => {
    return crypto.randomUUID().replace(/-/g, '');
  };

  const handleSendInvite = async () => {
    if (!newInvite.email || !profile?.family_id || !user) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      const token = generateToken();
      const expiresAt = addDays(new Date(), 7);

      const { error } = await supabase
        .from('invites')
        .insert({
          family_id: profile.family_id,
          invited_by: user.id,
          email: newInvite.email,
          role: newInvite.role,
          token,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      toast.success(`Invite sent to ${newInvite.email}`);
      setIsInviteOpen(false);
      setNewInvite({ email: '', role: 'parent' });
      fetchInvites();
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invite');
    }
  };

  const handleCopyLink = (token: string) => {
    const link = `${window.location.origin}/signup?invite=${token}`;
    navigator.clipboard.writeText(link);
    toast.success('Invite link copied to clipboard');
  };

  const handleDeleteInvite = async (id: string) => {
    try {
      const { error } = await supabase
        .from('invites')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Invite deleted');
      fetchInvites();
    } catch (error) {
      console.error('Error deleting invite:', error);
      toast.error('Failed to delete invite');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Invite | SplitSchedule</title>
        <meta name="description" content="Invite your co-parent or lawyer to join your family" />
      </Helmet>
      
      <DashboardLayout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Invite Members</h1>
              <p className="text-muted-foreground">Invite your co-parent or lawyer to join</p>
            </div>
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90" disabled={!profile?.family_id}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Send Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite to Family</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newInvite.email}
                      onChange={(e) => setNewInvite({ ...newInvite, email: e.target.value })}
                      placeholder="coparent@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newInvite.role}
                      onValueChange={(value: any) => setNewInvite({ ...newInvite, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="parent">Co-Parent</SelectItem>
                        <SelectItem value="lawyer">Lawyer (Read-Only)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {newInvite.role === 'lawyer'
                        ? 'Lawyers get read-only access to view incidents and documents'
                        : 'Co-parents can view and manage all family data'}
                    </p>
                  </div>
                  <Button onClick={handleSendInvite} className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invite
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Co-Parent Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Full access to calendar, expenses, messages, and documents. 
                      Can create events and log incidents.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Lawyer Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Read-only access to incident logs and documents. 
                      Cannot modify any data. Perfect for legal representation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Invites */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Invites</CardTitle>
              <CardDescription>Invitations waiting to be accepted</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : !profile?.family_id ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Create a family first to send invites</p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/settings'}>
                    Go to Settings
                  </Button>
                </div>
              ) : invites.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending invites</p>
                  <p className="text-sm">Send an invite to your co-parent or lawyer</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {invites.map((invite) => {
                    const isExpired = new Date(invite.expires_at) < new Date();
                    const isAccepted = !!invite.accepted_at;

                    return (
                      <div
                        key={invite.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          isExpired || isAccepted ? 'bg-muted/50' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            isAccepted ? 'bg-green-500/10' : isExpired ? 'bg-red-500/10' : 'bg-primary/10'
                          }`}>
                            {isAccepted ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <Mail className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{invite.email}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="outline" className="capitalize">
                                {invite.role}
                              </Badge>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {isExpired 
                                  ? 'Expired' 
                                  : isAccepted 
                                    ? `Accepted ${format(parseISO(invite.accepted_at!), 'MMM d')}`
                                    : `Expires ${format(parseISO(invite.expires_at), 'MMM d')}`
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isAccepted && !isExpired && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyLink(invite.token)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteInvite(invite.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Invite;
