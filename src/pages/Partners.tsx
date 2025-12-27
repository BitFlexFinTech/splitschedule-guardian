import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Building2, Users, Scale, Heart, Briefcase,
  ArrowRight, ArrowLeft, CheckCircle, Shield,
  Mail, Phone, Globe, FileCheck
} from 'lucide-react';

const partnerTypes = [
  { id: 'law_firm', label: 'Law Firm', icon: Scale, description: 'Family law attorneys and legal practices' },
  { id: 'mediation_center', label: 'Mediation Center', icon: Users, description: 'Professional mediators and dispute resolution' },
  { id: 'therapy_practice', label: 'Therapy Practice', icon: Heart, description: 'Family therapists and counselors' },
  { id: 'agency', label: 'Agency', icon: Building2, description: 'Social services and family agencies' },
  { id: 'other', label: 'Other', icon: Briefcase, description: 'Other family service providers' },
];

const Partners: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    organizationType: '',
    organizationName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    services: [] as string[],
    agreeTerms: false,
    agreePrivacy: false,
  });

  const handleTypeSelect = (type: string) => {
    setFormData({ ...formData, organizationType: type });
  };

  const handleServiceToggle = (service: string) => {
    const services = formData.services.includes(service)
      ? formData.services.filter(s => s !== service)
      : [...formData.services, service];
    setFormData({ ...formData, services });
  };

  const handleSubmit = async () => {
    if (!formData.agreeTerms || !formData.agreePrivacy) {
      toast.error('Please agree to the terms and privacy policy');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, this would create the partner application
      toast.success('Partner application submitted successfully! We will review and get back to you within 48 hours.');
      navigate('/login');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return !!formData.organizationType;
      case 2: return !!formData.organizationName && !!formData.email;
      case 3: return !!formData.contactName && !!formData.contactEmail;
      case 4: return formData.services.length > 0;
      case 5: return formData.agreeTerms && formData.agreePrivacy;
      default: return false;
    }
  };

  return (
    <>
      <Helmet>
        <title>Partner With Us | SplitSchedule</title>
        <meta name="description" content="Join our partner network and help families navigate co-parenting" />
      </Helmet>

      <div className="min-h-screen bg-gradient-hero">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <span className="font-bold text-xl">SplitSchedule</span>
              </div>
              <Button variant="outline" onClick={() => navigate('/login')}>
                Partner Login
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div key={s} className="flex items-center">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      s < step ? 'bg-primary text-primary-foreground' :
                      s === step ? 'bg-primary text-primary-foreground animate-pulse-soft' :
                      'bg-secondary text-muted-foreground'
                    }`}>
                      {s < step ? <CheckCircle className="h-5 w-5" /> : s}
                    </div>
                    {s < 5 && (
                      <div className={`h-1 w-12 md:w-20 mx-1 rounded transition-all ${
                        s < step ? 'bg-primary' : 'bg-secondary'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-1">
                  {step === 1 && 'Choose Your Organization Type'}
                  {step === 2 && 'Organization Details'}
                  {step === 3 && 'Primary Contact'}
                  {step === 4 && 'Services You Offer'}
                  {step === 5 && 'Review & Submit'}
                </h1>
                <p className="text-muted-foreground">Step {step} of 5</p>
              </div>
            </div>

            {/* Step Content */}
            <Card className="card-elevated">
              <CardContent className="p-6">
                {/* Step 1: Organization Type */}
                {step === 1 && (
                  <div className="grid gap-4">
                    {partnerTypes.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => handleTypeSelect(type.id)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                          formData.organizationType === type.id 
                            ? 'border-primary bg-primary/5 shadow-sm' 
                            : 'border-border'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                            formData.organizationType === type.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                          }`}>
                            <type.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-semibold">{type.label}</p>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                          </div>
                          {formData.organizationType === type.id && (
                            <CheckCircle className="h-5 w-5 text-primary ml-auto" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 2: Organization Details */}
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="orgName">Organization Name *</Label>
                      <Input
                        id="orgName"
                        value={formData.organizationName}
                        onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                        placeholder="e.g., Smith & Associates Family Law"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Business Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          className="pl-10"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="contact@yourfirm.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Business Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          className="pl-10"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="website"
                          className="pl-10"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://yourfirm.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="123 Main Street, City, State"
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Primary Contact */}
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="p-4 bg-secondary/50 rounded-lg mb-6">
                      <p className="text-sm text-muted-foreground">
                        This person will be the main point of contact for your partnership.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactName">Full Name *</Label>
                      <Input
                        id="contactName"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        placeholder="John Smith"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        placeholder="john@yourfirm.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone</Label>
                      <Input
                        id="contactPhone"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Services */}
                {step === 4 && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      Select the services you provide to co-parenting families:
                    </p>
                    {[
                      'Family Law Consultation',
                      'Custody Mediation',
                      'Document Preparation',
                      'Court Representation',
                      'Parenting Plan Development',
                      'Child Support Calculation',
                      'Family Therapy',
                      'Co-parenting Coaching',
                      'Conflict Resolution',
                      'Emergency Legal Support',
                    ].map((service) => (
                      <div
                        key={service}
                        onClick={() => handleServiceToggle(service)}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                          formData.services.includes(service)
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Checkbox checked={formData.services.includes(service)} />
                        <span>{service}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Step 5: Review */}
                {step === 5 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-secondary/50 rounded-lg">
                        <h3 className="font-semibold mb-2">Organization</h3>
                        <p>{formData.organizationName}</p>
                        <Badge className="mt-2">{partnerTypes.find(t => t.id === formData.organizationType)?.label}</Badge>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded-lg">
                        <h3 className="font-semibold mb-2">Contact</h3>
                        <p>{formData.contactName}</p>
                        <p className="text-sm text-muted-foreground">{formData.contactEmail}</p>
                      </div>
                      <div className="p-4 bg-secondary/50 rounded-lg">
                        <h3 className="font-semibold mb-2">Services ({formData.services.length})</h3>
                        <div className="flex flex-wrap gap-2">
                          {formData.services.map((service) => (
                            <Badge key={service} variant="outline">{service}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="terms"
                          checked={formData.agreeTerms}
                          onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                        />
                        <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                          I agree to the Partner Terms of Service and understand the responsibilities of being a SplitSchedule partner.
                        </Label>
                      </div>
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="privacy"
                          checked={formData.agreePrivacy}
                          onCheckedChange={(checked) => setFormData({ ...formData, agreePrivacy: checked as boolean })}
                        />
                        <Label htmlFor="privacy" className="text-sm leading-relaxed cursor-pointer">
                          I agree to the Privacy Policy and data handling requirements, including GDPR compliance for UK/EU clients.
                        </Label>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg">
                      <Shield className="h-5 w-5 text-primary" />
                      <p className="text-sm">Your application will be reviewed within 48 hours.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              {step < 5 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                >
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!canProceed() || isLoading}
                  className="bg-gradient-primary"
                >
                  {isLoading ? 'Submitting...' : 'Submit Application'}
                  <FileCheck className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Partners;