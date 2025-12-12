import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  CreditCard, Send, ArrowUpRight, ArrowDownLeft, 
  Clock, CheckCircle, AlertCircle, DollarSign 
} from 'lucide-react';
import { format } from 'date-fns';

// Mock data for sandbox
const mockPayments = [
  { id: '1', type: 'sent', amount: 150, description: 'Child support - March', status: 'completed', date: new Date('2024-03-15') },
  { id: '2', type: 'received', amount: 75.50, description: 'School supplies reimbursement', status: 'completed', date: new Date('2024-03-10') },
  { id: '3', type: 'sent', amount: 200, description: 'Medical expenses split', status: 'pending', date: new Date('2024-03-08') },
];

const Payments: React.FC = () => {
  const { user, profile } = useAuth();
  const [isSendPaymentOpen, setIsSendPaymentOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    description: '',
  });

  const handleSendPayment = () => {
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Sandbox mode - just show toast
    toast.success(`Payment of $${paymentData.amount} initiated (Sandbox Mode)`);
    setIsSendPaymentOpen(false);
    setPaymentData({ amount: '', description: '' });
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Payments | SplitSchedule</title>
        <meta name="description" content="Send and receive payments with your co-parent" />
      </Helmet>
      
      <DashboardLayout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Payments</h1>
              <p className="text-muted-foreground">Send and track payments</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600">
                Sandbox Mode
              </Badge>
              <Dialog open={isSendPaymentOpen} onOpenChange={setIsSendPaymentOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Send className="h-4 w-4 mr-2" />
                    Send Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Payment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                      <p className="text-sm text-yellow-600">
                        This is sandbox mode. No real payments will be processed.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={paymentData.description}
                        onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                        placeholder="What is this payment for?"
                      />
                    </div>
                    <Button onClick={handleSendPayment} className="w-full">
                      Send Payment
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sent</p>
                    <p className="text-2xl font-bold">$350.00</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
                    <ArrowUpRight className="h-6 w-6 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Received</p>
                    <p className="text-2xl font-bold">$75.50</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <ArrowDownLeft className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">$200.00</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Recent transactions with your co-parent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        payment.type === 'sent' ? 'bg-red-500/10' : 'bg-green-500/10'
                      }`}>
                        {payment.type === 'sent' ? (
                          <ArrowUpRight className={`h-5 w-5 text-red-500`} />
                        ) : (
                          <ArrowDownLeft className={`h-5 w-5 text-green-500`} />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(payment.date, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className={`font-semibold ${
                          payment.type === 'sent' ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {payment.type === 'sent' ? '-' : '+'}${payment.amount.toFixed(2)}
                        </p>
                      </div>
                      <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                        {payment.status === 'completed' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stripe Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Setup
              </CardTitle>
              <CardDescription>Connect your payment method</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-6 text-center">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="font-medium mb-2">Stripe Integration (Sandbox)</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your bank account or card to send and receive real payments
                </p>
                <Button variant="outline">
                  Connect Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Payments;
