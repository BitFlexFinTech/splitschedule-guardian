import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  User, Users, Calendar, Baby, CheckCircle, ArrowRight, ArrowLeft,
  Shield, Scale, HeadphonesIcon, Sparkles, Globe, Bell
} from 'lucide-react';

interface OnboardingWizardProps {
  userId: string;
  userRole: 'parent' | 'lawyer' | 'support_agent' | 'superadmin';
  onComplete: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ userId, userRole, onComplete }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notificationEmail: true,
    notificationPush: true,
    familyName: '',
    inviteCode: '',
    childName: '',
    childDob: '',
    custodyTemplate: '',
  });

  const totalSteps = userRole === 'parent' ? 5 : 3;
  const progress = (step / totalSteps) * 100;

  const roleInfo = {
    parent: { icon: Users, color: 'text-primary', title: 'Parent Dashboard' },
    lawyer: { icon: Scale, color: 'text-indigo-500', title: 'Legal Professional' },
    support_agent: { icon: HeadphonesIcon, color: 'text-blue-500', title: 'Support Agent' },
    superadmin: { icon: Shield, color: 'text-red-500', title: 'Administrator' },
  };

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Update profile with onboarding data
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName || undefined,
          phone: formData.phone || undefined,
          timezone: formData.timezone,
          notification_email: formData.notificationEmail,
          notification_push: formData.notificationPush,
          onboarding_completed: true,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('Welcome to SplitSchedule! 🎉');
      onComplete();
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Failed to complete onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const RoleIcon = roleInfo[userRole].icon;

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className={`p-4 rounded-2xl bg-gradient-primary shadow-glow`}>
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome to SplitSchedule</CardTitle>
          <CardDescription>Let's get you set up in just a few steps</CardDescription>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-muted-foreground mt-2">Step {step} of {totalSteps}</p>
        </CardHeader>

        <CardContent className="p-6">
          {/* Step 1: Welcome & Role Confirmation */}
          {step === 1 && (
            <div className="space-y-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                <RoleIcon className={`h-5 w-5 ${roleInfo[userRole].color}`} />
                <span className="font-medium">{roleInfo[userRole].title}</span>
              </div>
              
              <h3 className="text-xl font-semibold">
                {userRole === 'parent' && 'Start your co-parenting journey'}
                {userRole === 'lawyer' && 'Access case files securely'}
                {userRole === 'support_agent' && 'Help families succeed'}
                {userRole === 'superadmin' && 'Manage the platform'}
              </h3>
              
              <p className="text-muted-foreground max-w-md mx-auto">
                {userRole === 'parent' && 'We\'ll help you set up your family profile, add your children, and configure your custody schedule.'}
                {userRole === 'lawyer' && 'You\'ll have read-only access to your assigned family cases with court-ready export capabilities.'}
                {userRole === 'support_agent' && 'You\'ll be able to view user tickets and help resolve issues.'}
                {userRole === 'superadmin' && 'Full platform access to manage users, integrations, and system settings.'}
              </p>

              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { icon: Shield, label: 'Bank-level Security' },
                  { icon: Globe, label: 'US, UK & EU Ready' },
                  { icon: Bell, label: 'Smart Notifications' },
                ].map((feature, i) => (
                  <div key={i} className="p-4 rounded-lg bg-muted/50 text-center">
                    <feature.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <span className="text-sm">{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Profile Setup */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <User className="h-12 w-12 mx-auto mb-2 text-primary" />
                <h3 className="text-xl font-semibold">Your Profile</h3>
                <p className="text-muted-foreground">Tell us a bit about yourself</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notificationEmail}
                      onChange={(e) => setFormData({ ...formData, notificationEmail: e.target.checked })}
                      className="rounded border-border"
                    />
                    <span className="text-sm">Email notifications</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notificationPush}
                      onChange={(e) => setFormData({ ...formData, notificationPush: e.target.checked })}
                      className="rounded border-border"
                    />
                    <span className="text-sm">Push notifications</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 (Parent): Family Connection */}
          {step === 3 && userRole === 'parent' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Users className="h-12 w-12 mx-auto mb-2 text-primary" />
                <h3 className="text-xl font-semibold">Connect Your Family</h3>
                <p className="text-muted-foreground">Create a new family or join an existing one</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-2"
                  onClick={() => setFormData({ ...formData, inviteCode: '' })}
                >
                  <Users className="h-8 w-8 text-primary" />
                  <span className="font-medium">Create New Family</span>
                  <span className="text-xs text-muted-foreground">Start fresh</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-6 flex flex-col items-center gap-2"
                  onClick={() => toast.info('Enter invite code from your co-parent')}
                >
                  <ArrowRight className="h-8 w-8 text-primary" />
                  <span className="font-medium">Join Family</span>
                  <span className="text-xs text-muted-foreground">Have an invite?</span>
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyName">Family Name (optional)</Label>
                <Input
                  id="familyName"
                  value={formData.familyName}
                  onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                  placeholder="The Smith Family"
                />
              </div>
            </div>
          )}

          {/* Step 4 (Parent): Child Profile */}
          {step === 4 && userRole === 'parent' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Baby className="h-12 w-12 mx-auto mb-2 text-primary" />
                <h3 className="text-xl font-semibold">Add Your Child</h3>
                <p className="text-muted-foreground">You can add more children later</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="childName">Child's Name</Label>
                  <Input
                    id="childName"
                    value={formData.childName}
                    onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                    placeholder="Child's first name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childDob">Date of Birth (optional)</Label>
                  <Input
                    id="childDob"
                    type="date"
                    value={formData.childDob}
                    onChange={(e) => setFormData({ ...formData, childDob: e.target.value })}
                  />
                </div>
              </div>

              <Button variant="ghost" className="w-full" onClick={() => toast.info('Skip for now - add children later in Info Bank')}>
                Skip for now
              </Button>
            </div>
          )}

          {/* Step 5 (Parent) / Step 3 (Others): Calendar Setup */}
          {((step === 5 && userRole === 'parent') || (step === 3 && userRole !== 'parent')) && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-primary" />
                <h3 className="text-xl font-semibold">
                  {userRole === 'parent' ? 'Choose Custody Schedule' : 'All Set!'}
                </h3>
                <p className="text-muted-foreground">
                  {userRole === 'parent' ? 'Select a template or customize later' : 'You\'re ready to start using SplitSchedule'}
                </p>
              </div>

              {userRole === 'parent' && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: '50-50', label: '50/50 Split', desc: 'Week on/week off' },
                    { id: '60-40', label: '60/40 Split', desc: 'Primary + weekends' },
                    { id: '2-2-3', label: '2-2-3 Rotation', desc: 'Flexible rotation' },
                    { id: 'custom', label: 'Custom', desc: 'Build your own' },
                  ].map((template) => (
                    <Button
                      key={template.id}
                      variant={formData.custodyTemplate === template.id ? 'default' : 'outline'}
                      className="h-auto p-4 flex flex-col items-start text-left"
                      onClick={() => setFormData({ ...formData, custodyTemplate: template.id })}
                    >
                      <span className="font-medium">{template.label}</span>
                      <span className="text-xs text-muted-foreground">{template.desc}</span>
                    </Button>
                  ))}
                </div>
              )}

              {userRole !== 'parent' && (
                <div className="bg-muted/50 rounded-lg p-6 text-center">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <p className="font-medium">Your account is ready!</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {userRole === 'lawyer' && 'You\'ll be able to access assigned cases once invited by a family.'}
                    {userRole === 'support_agent' && 'Start helping families with their questions and issues.'}
                    {userRole === 'superadmin' && 'Access all platform features and administrative controls.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === 1}
              className={step === 1 ? 'invisible' : ''}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={isLoading} className="bg-gradient-primary">
                {isLoading ? 'Setting up...' : 'Complete Setup'}
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingWizard;
