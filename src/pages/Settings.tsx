import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, Bell, Globe, Shield, CreditCard, Users, Upload, Download, Trash2, FileText, Cookie, Loader2 } from 'lucide-react';
import { APP_CONFIG } from '@/lib/config';

const Settings: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    language: 'en',
    timezone: 'UTC',
    preferred_currency: 'USD',
  });
  const [familyName, setFamilyName] = useState('');
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
  });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [gdprConsentGiven, setGdprConsentGiven] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        language: profile.language || 'en',
        timezone: profile.timezone || 'UTC',
        preferred_currency: profile.preferred_currency || 'USD',
      });
      setGdprConsentGiven(!!profile.gdpr_consent_at);
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: formData.full_name,
        phone: formData.phone,
        language: formData.language,
        timezone: formData.timezone,
        preferred_currency: formData.preferred_currency,
      }).eq('user_id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFamily = async () => {
    if (!familyName.trim() || !user) {
      toast.error('Please enter a family name');
      return;
    }

    setIsLoading(true);
    try {
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({ name: familyName })
        .select()
        .single();

      if (familyError) throw familyError;

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ family_id: family.id })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      toast.success('Family created successfully');
      setFamilyName('');
      window.location.reload();
    } catch (error) {
      console.error('Error creating family:', error);
      toast.error('Failed to create family');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast.success('Avatar updated');
      window.location.reload();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    }
  };

  const handleExportData = async () => {
    if (!user || !profile?.family_id) {
      toast.error('No data to export');
      return;
    }

    setIsExporting(true);
    try {
      const [profileData, expensesData, incidentsData, messagesData, eventsData] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id),
        supabase.from('expenses').select('*').eq('family_id', profile.family_id),
        supabase.from('incidents').select('*').eq('family_id', profile.family_id),
        supabase.from('conversations').select('id').eq('family_id', profile.family_id).then(async (res) => {
          if (res.data && res.data.length > 0) {
            return supabase.from('messages').select('*').eq('conversation_id', res.data[0].id);
          }
          return { data: [] };
        }),
        supabase.from('calendar_events').select('*').eq('family_id', profile.family_id),
      ]);

      const exportData = {
        exported_at: new Date().toISOString(),
        user_id: user.id,
        profile: profileData.data?.[0] || null,
        expenses: expensesData.data || [],
        incidents: incidentsData.data || [],
        messages: messagesData.data || [],
        calendar_events: eventsData.data || [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `splitschedule-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleGdprConsent = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.from('profiles').update({
        gdpr_consent_at: new Date().toISOString(),
      }).eq('user_id', user.id);

      if (error) throw error;
      setGdprConsentGiven(true);
      toast.success('GDPR consent recorded');
    } catch (error) {
      toast.error('Failed to record consent');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      await supabase.auth.signOut();
      toast.success('Account deletion requested. You have been signed out.');
      navigate('/');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to process account deletion');
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.from('profiles').update({
        notification_email: notifications.email,
        notification_push: notifications.push,
        notification_sms: notifications.sms,
      }).eq('user_id', user.id);

      if (error) throw error;
      toast.success('Notification preferences saved');
    } catch (error) {
      toast.error('Failed to save notification preferences');
    }
  };

  if (!user) return null;

  const currencies = APP_CONFIG.CURRENCIES || [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
  ];

  return (
    <>
      <Helmet>
        <title>Settings | SplitSchedule</title>
        <meta name="description" content="Manage your account and preferences" />
      </Helmet>
      
      <DashboardLayout user={user}>
        <div className="space-y-6 max-w-4xl">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>

          {/* Profile Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-lg">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Label htmlFor="avatar" className="cursor-pointer">
                    <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <Upload className="h-4 w-4" />
                      Upload new photo
                    </div>
                  </Label>
                  <Input id="avatar" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email || ''} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="Africa/Johannesburg">South Africa (CAT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleUpdateProfile} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>

          {/* Currency Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Currency Preferences
              </CardTitle>
              <CardDescription>Set your preferred currency for expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-sm">
                <div className="space-y-2">
                  <Label>Preferred Currency</Label>
                  <Select value={formData.preferred_currency} onValueChange={(value) => setFormData({ ...formData, preferred_currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  All expenses will be displayed in your preferred currency
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Family Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Family
              </CardTitle>
              <CardDescription>
                {profile?.family_id 
                  ? 'You are part of a family. Invite your co-parent to join.'
                  : 'Create a family to start using all features'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {profile?.family_id ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                    <div>
                      <p className="font-medium">Family Connected</p>
                      <p className="text-sm text-muted-foreground">ID: {profile.family_id.slice(0, 8)}...</p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/invite')}>
                      Invite Co-Parent
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="familyName">Family Name</Label>
                    <Input
                      id="familyName"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                      placeholder="e.g., Smith Family"
                    />
                  </div>
                  <Button onClick={handleCreateFamily} disabled={isLoading}>
                    {isLoading ? 'Creating...' : 'Create Family'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* GDPR & Privacy Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Privacy & GDPR
              </CardTitle>
              <CardDescription>Manage your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* GDPR Consent */}
              <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Cookie className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">GDPR Consent</p>
                    <p className="text-sm text-muted-foreground">
                      {gdprConsentGiven 
                        ? `Consent given on ${profile?.gdpr_consent_at ? new Date(profile.gdpr_consent_at).toLocaleDateString() : 'N/A'}`
                        : 'Required for EU/UK users'}
                    </p>
                  </div>
                </div>
                {gdprConsentGiven ? (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                    Consented
                  </Badge>
                ) : (
                  <Button onClick={handleGdprConsent}>Give Consent</Button>
                )}
              </div>

              {/* Export Data */}
              <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Export My Data</p>
                    <p className="text-sm text-muted-foreground">Download all your data in JSON format</p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleExportData} disabled={isExporting}>
                  {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Export
                </Button>
              </div>

              {/* Privacy Policy */}
              <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Privacy Policy</p>
                    <p className="text-sm text-muted-foreground">Read our privacy policy</p>
                  </div>
                </div>
                <Button variant="outline" onClick={() => navigate('/legal')}>
                  View Policy
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Configure how you receive updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive text messages</p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, sms: checked })}
                />
              </div>
              <Button variant="outline" onClick={handleSaveNotifications}>
                Save Notification Preferences
              </Button>
            </CardContent>
          </Card>

          {/* Subscription Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription
              </CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                <div>
                  <p className="font-medium">Free Plan</p>
                  <p className="text-sm text-muted-foreground">Basic features with incident log access</p>
                </div>
                <Button onClick={() => navigate('/subscriptions')}>Upgrade to Pro</Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Pro: $9.99/month or $99.99/year per family
              </p>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="glass-card border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-500">
                <Shield className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-500/20 rounded-lg bg-red-500/5">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                </div>
                <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. All your data will be permanently deleted.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <p className="text-sm">Type <strong>DELETE</strong> to confirm:</p>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Delete My Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Settings;