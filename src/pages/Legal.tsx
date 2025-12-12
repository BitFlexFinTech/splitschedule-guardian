import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Shield, FileText, Lock } from 'lucide-react';

const Legal: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Legal | SplitSchedule</title>
        <meta name="description" content="Terms of Service and Privacy Policy for SplitSchedule" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Legal</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Tabs defaultValue="terms" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="terms">Terms of Service</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Policy</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="terms">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Terms of Service
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="text-muted-foreground">Last updated: March 2024</p>
                  
                  <h3>1. Acceptance of Terms</h3>
                  <p>
                    By accessing or using SplitSchedule ("the Service"), you agree to be bound by these 
                    Terms of Service. If you do not agree to these terms, please do not use the Service.
                  </p>

                  <h3>2. Description of Service</h3>
                  <p>
                    SplitSchedule is a co-parenting platform that provides tools for custody scheduling, 
                    expense tracking, secure communication, and document management.
                  </p>

                  <h3>3. User Responsibilities</h3>
                  <ul>
                    <li>Maintain accurate account information</li>
                    <li>Keep your login credentials secure</li>
                    <li>Use the Service in compliance with all applicable laws</li>
                    <li>Provide truthful information in incident reports</li>
                    <li>Respect the rights and privacy of other users</li>
                  </ul>

                  <h3>4. Prohibited Uses</h3>
                  <ul>
                    <li>Harassment or abuse of other users</li>
                    <li>Filing false incident reports</li>
                    <li>Unauthorized access to other accounts</li>
                    <li>Distribution of malware or harmful content</li>
                    <li>Any illegal activities</li>
                  </ul>

                  <h3>5. Subscription and Payments</h3>
                  <p>
                    Some features require a paid subscription. Prices are as listed on our pricing page. 
                    Subscriptions renew automatically unless cancelled.
                  </p>

                  <h3>6. Limitation of Liability</h3>
                  <p>
                    SplitSchedule is provided "as is" without warranties. We are not liable for any 
                    damages arising from use of the Service. The Service is not a substitute for legal advice.
                  </p>

                  <h3>7. Termination</h3>
                  <p>
                    We reserve the right to terminate accounts that violate these terms. Users may 
                    terminate their account at any time through Settings.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Privacy Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="text-muted-foreground">Last updated: March 2024</p>

                  <h3>1. Information We Collect</h3>
                  <p>We collect information you provide directly:</p>
                  <ul>
                    <li>Account information (email, name, phone)</li>
                    <li>Family and custody scheduling data</li>
                    <li>Messages and communication logs</li>
                    <li>Expense records and receipts</li>
                    <li>Incident reports and documentation</li>
                    <li>Uploaded files and documents</li>
                  </ul>

                  <h3>2. How We Use Your Information</h3>
                  <ul>
                    <li>Provide and improve the Service</li>
                    <li>Facilitate communication between co-parents</li>
                    <li>Generate reports and analytics for your use</li>
                    <li>Send service-related notifications</li>
                    <li>Ensure security and prevent fraud</li>
                  </ul>

                  <h3>3. Data Sharing</h3>
                  <p>
                    We do not sell your personal information. Data is shared only with:
                  </p>
                  <ul>
                    <li>Your designated co-parent (as configured)</li>
                    <li>Lawyers you invite (read-only access)</li>
                    <li>Service providers (hosting, payments)</li>
                    <li>Law enforcement (when legally required)</li>
                  </ul>

                  <h3>4. Data Security</h3>
                  <p>
                    We implement industry-standard security measures including:
                  </p>
                  <ul>
                    <li>End-to-end encryption for messages</li>
                    <li>Encrypted data storage</li>
                    <li>Secure authentication</li>
                    <li>Regular security audits</li>
                  </ul>

                  <h3>5. Data Retention</h3>
                  <p>
                    We retain your data as long as your account is active. Upon account deletion, 
                    most data is removed within 30 days. Some data may be retained for legal compliance.
                  </p>

                  <h3>6. Your Rights</h3>
                  <ul>
                    <li>Access your personal data</li>
                    <li>Request data correction</li>
                    <li>Export your data</li>
                    <li>Delete your account</li>
                    <li>Opt out of marketing communications</li>
                  </ul>

                  <h3>7. Contact</h3>
                  <p>
                    For privacy-related inquiries: privacy@splitschedule.com
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Security Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="text-muted-foreground">Our commitment to protecting your data</p>

                  <h3>Encryption</h3>
                  <p>
                    All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. 
                    Messages between co-parents use end-to-end encryption.
                  </p>

                  <h3>Authentication</h3>
                  <p>
                    We support secure password requirements and session management. 
                    Account access is protected against brute force attacks.
                  </p>

                  <h3>Tamper-Proof Logging</h3>
                  <p>
                    Incident logs use a blockchain-inspired approach with cryptographic hashing 
                    to ensure records cannot be modified after creation.
                  </p>

                  <h3>Access Controls</h3>
                  <p>
                    Role-based access ensures users only see data they're authorized to view. 
                    Lawyers receive read-only access and cannot modify any records.
                  </p>

                  <h3>Infrastructure</h3>
                  <ul>
                    <li>Hosted on secure, SOC 2 compliant infrastructure</li>
                    <li>Regular security audits and penetration testing</li>
                    <li>Automated vulnerability scanning</li>
                    <li>24/7 infrastructure monitoring</li>
                  </ul>

                  <h3>Reporting Vulnerabilities</h3>
                  <p>
                    If you discover a security vulnerability, please report it to: security@splitschedule.com
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
};

export default Legal;
