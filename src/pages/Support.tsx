import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from 'sonner';
import { 
  HelpCircle, MessageSquare, Mail, Book, 
  ChevronRight, Search, Send 
} from 'lucide-react';

const faqs = [
  {
    question: "How do I invite my co-parent?",
    answer: "Go to the Invite page from the dashboard sidebar. Enter your co-parent's email address and select their role. They'll receive an invitation link that expires in 7 days."
  },
  {
    question: "Is my data secure?",
    answer: "Yes! We use end-to-end encryption for messaging, secure storage for documents, and tamper-proof logging for incidents. All data is encrypted at rest and in transit."
  },
  {
    question: "Can I export my incident log for court?",
    answer: "Absolutely. The incident log includes a court-ready export feature that generates a formatted document with all incidents, timestamps, and cryptographic hashes for authenticity verification."
  },
  {
    question: "How does the expense splitting work?",
    answer: "When you log an expense, you can set the split percentage (default is 50/50). The system automatically calculates each parent's share and tracks settlements."
  },
  {
    question: "What access does a lawyer have?",
    answer: "Lawyers receive read-only access. They can view incident logs and documents but cannot create, edit, or delete any data. This ensures they can review case materials without risk of modification."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "Go to Settings > Subscription and click 'Manage Subscription'. You can cancel anytime and continue using the service until your billing period ends."
  },
];

const Support: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
  });

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitContact = () => {
    if (!contactForm.subject || !contactForm.message) {
      toast.error('Please fill in all fields');
      return;
    }

    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setContactForm({ subject: '', message: '' });
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Support | SplitSchedule</title>
        <meta name="description" content="Get help with SplitSchedule" />
      </Helmet>
      
      <DashboardLayout user={user}>
        <div className="space-y-6 max-w-4xl">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Help & Support</h1>
            <p className="text-muted-foreground">Find answers or contact our support team</p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6 text-center">
                <Book className="h-10 w-10 mx-auto text-primary mb-3" />
                <h3 className="font-semibold">Documentation</h3>
                <p className="text-sm text-muted-foreground">Browse our guides</p>
              </CardContent>
            </Card>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6 text-center">
                <MessageSquare className="h-10 w-10 mx-auto text-primary mb-3" />
                <h3 className="font-semibold">Live Chat</h3>
                <p className="text-sm text-muted-foreground">Chat with support</p>
              </CardContent>
            </Card>
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="pt-6 text-center">
                <Mail className="h-10 w-10 mx-auto text-primary mb-3" />
                <h3 className="font-semibold">Email Support</h3>
                <p className="text-sm text-muted-foreground">support@splitschedule.com</p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Frequently Asked Questions
              </CardTitle>
              <CardDescription>Search for answers to common questions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search FAQs..."
                  className="pl-10"
                />
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {filteredFaqs.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No FAQs match your search. Try different keywords or contact support.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Support
              </CardTitle>
              <CardDescription>Can't find what you're looking for? Send us a message.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="What do you need help with?"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Describe your issue in detail..."
                  rows={5}
                />
              </div>
              <Button onClick={handleSubmitContact}>
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </CardContent>
          </Card>

          {/* Emergency Notice */}
          <Card className="border-destructive bg-destructive/5">
            <CardContent className="py-4">
              <p className="text-sm">
                <strong>Emergency?</strong> If you or your children are in immediate danger, 
                please call emergency services (911) or contact local authorities immediately.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Support;
