import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  CreditCard, Send, ArrowUpRight, ArrowDownLeft, 
  Clock, CheckCircle, DollarSign, Plus, Trash2,
  Lock, Unlock, ShoppingBag, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface IssuedCard {
  id: string;
  user_id: string;
  family_id: string;
  last_four: string | null;
  card_status: string;
  spending_limit: number;
  created_at: string;
}

interface Merchant {
  id: string;
  merchant_name: string;
  merchant_category: string | null;
  is_allowed: boolean;
  created_at: string;
}

const mockPayments = [
  { id: '1', type: 'sent', amount: 150, description: 'Child support - March', status: 'completed', date: new Date('2024-03-15') },
  { id: '2', type: 'received', amount: 75.50, description: 'School supplies reimbursement', status: 'completed', date: new Date('2024-03-10') },
  { id: '3', type: 'sent', amount: 200, description: 'Medical expenses split', status: 'pending', date: new Date('2024-03-08') },
];

const MERCHANT_CATEGORIES = [
  'Groceries',
  'Medical',
  'Education',
  'Clothing',
  'Entertainment',
  'Transportation',
  'Childcare',
  'Utilities',
  'Other',
];

const Payments: React.FC = () => {
  const { user, profile } = useAuth();
  const [isSendPaymentOpen, setIsSendPaymentOpen] = useState(false);
  const [isAddMerchantOpen, setIsAddMerchantOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({ amount: '', description: '' });
  const [card, setCard] = useState<IssuedCard | null>(null);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [newMerchant, setNewMerchant] = useState({ name: '', category: 'Other' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.family_id) {
      fetchCardAndMerchants();
    } else {
      setIsLoading(false);
    }
  }, [profile?.family_id]);

  const fetchCardAndMerchants = async () => {
    if (!profile?.family_id || !user) return;
    
    try {
      const [cardRes, merchantsRes] = await Promise.all([
        supabase.from('issued_cards').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('merchant_whitelist').select('*').eq('family_id', profile.family_id).order('merchant_name'),
      ]);

      setCard(cardRes.data);
      setMerchants(merchantsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCard = async () => {
    if (!user || !profile?.family_id) {
      toast.error('Please set up your family first');
      return;
    }

    try {
      const { error } = await supabase.from('issued_cards').insert({
        user_id: user.id,
        family_id: profile.family_id,
        last_four: Math.floor(1000 + Math.random() * 9000).toString(),
        card_status: 'active',
        spending_limit: 500,
      });

      if (error) throw error;
      toast.success('Card requested successfully (Mock Mode)');
      fetchCardAndMerchants();
    } catch (error) {
      console.error('Error requesting card:', error);
      toast.error('Failed to request card');
    }
  };

  const handleToggleCardStatus = async () => {
    if (!card) return;

    const newStatus = card.card_status === 'active' ? 'frozen' : 'active';
    try {
      const { error } = await supabase.from('issued_cards')
        .update({ card_status: newStatus })
        .eq('id', card.id);

      if (error) throw error;
      toast.success(`Card ${newStatus === 'frozen' ? 'frozen' : 'unfrozen'}`);
      fetchCardAndMerchants();
    } catch (error) {
      toast.error('Failed to update card status');
    }
  };

  const handleAddMerchant = async () => {
    if (!newMerchant.name.trim() || !profile?.family_id) {
      toast.error('Please enter a merchant name');
      return;
    }

    try {
      const { error } = await supabase.from('merchant_whitelist').insert({
        family_id: profile.family_id,
        merchant_name: newMerchant.name,
        merchant_category: newMerchant.category,
        is_allowed: true,
      });

      if (error) throw error;
      toast.success('Merchant added to whitelist');
      setIsAddMerchantOpen(false);
      setNewMerchant({ name: '', category: 'Other' });
      fetchCardAndMerchants();
    } catch (error) {
      toast.error('Failed to add merchant');
    }
  };

  const handleToggleMerchant = async (merchant: Merchant) => {
    try {
      const { error } = await supabase.from('merchant_whitelist')
        .update({ is_allowed: !merchant.is_allowed })
        .eq('id', merchant.id);

      if (error) throw error;
      fetchCardAndMerchants();
    } catch (error) {
      toast.error('Failed to update merchant');
    }
  };

  const handleDeleteMerchant = async (id: string) => {
    try {
      const { error } = await supabase.from('merchant_whitelist').delete().eq('id', id);
      if (error) throw error;
      toast.success('Merchant removed');
      fetchCardAndMerchants();
    } catch (error) {
      toast.error('Failed to delete merchant');
    }
  };

  const handleSendPayment = () => {
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    toast.success(`Payment of $${paymentData.amount} initiated (Sandbox Mode)`);
    setIsSendPaymentOpen(false);
    setPaymentData({ amount: '', description: '' });
  };

  if (!user) return null;

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
              <p className="text-muted-foreground">Send payments & manage your family card</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
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

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="card">Family Card</TabsTrigger>
              <TabsTrigger value="merchants">Merchant Whitelist</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="glass-card">
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
                <Card className="glass-card">
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
                <Card className="glass-card">
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
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>Recent transactions with your co-parent</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-full ${payment.type === 'sent' ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                            {payment.type === 'sent' ? (
                              <ArrowUpRight className="h-5 w-5 text-red-500" />
                            ) : (
                              <ArrowDownLeft className="h-5 w-5 text-green-500" />
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
                          <p className={`font-semibold ${payment.type === 'sent' ? 'text-red-500' : 'text-green-500'}`}>
                            {payment.type === 'sent' ? '-' : '+'}${payment.amount.toFixed(2)}
                          </p>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                            {payment.status === 'completed' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="card" className="space-y-6">
              {/* Restricted Debit Card */}
              <Card className="glass-card overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Family Restricted Card
                  </CardTitle>
                  <CardDescription>A debit card with merchant restrictions for child expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  {!profile?.family_id ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="font-medium">Set up your family first</p>
                      <p className="text-sm text-muted-foreground">Go to Settings to create or join a family</p>
                    </div>
                  ) : card ? (
                    <div className="space-y-6">
                      {/* Card Visual */}
                      <div className={`relative w-full max-w-md mx-auto aspect-[1.586/1] rounded-2xl p-6 text-white overflow-hidden ${
                        card.card_status === 'active' 
                          ? 'bg-gradient-to-br from-primary via-primary/80 to-accent' 
                          : 'bg-gradient-to-br from-gray-500 to-gray-700'
                      }`}>
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
                        <div className="relative z-10 h-full flex flex-col justify-between">
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold">SplitSchedule</div>
                            <Badge variant="secondary" className={card.card_status === 'active' ? 'bg-green-500/20' : 'bg-red-500/20'}>
                              {card.card_status === 'active' ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                              {card.card_status}
                            </Badge>
                          </div>
                          <div>
                            <div className="text-2xl font-mono tracking-wider mb-2">
                              •••• •••• •••• {card.last_four}
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs opacity-70">Card Holder</p>
                                <p className="font-medium">{profile?.full_name || 'Family Member'}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs opacity-70">Limit</p>
                                <p className="font-medium">${card.spending_limit}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="flex items-center justify-center gap-4">
                        <Button 
                          variant={card.card_status === 'active' ? 'destructive' : 'default'}
                          onClick={handleToggleCardStatus}
                        >
                          {card.card_status === 'active' ? (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              Freeze Card
                            </>
                          ) : (
                            <>
                              <Unlock className="h-4 w-4 mr-2" />
                              Unfreeze Card
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Card Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-border/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Spending Limit</p>
                          <p className="text-2xl font-bold">${card.spending_limit}</p>
                        </div>
                        <div className="p-4 border border-border/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Whitelisted Merchants</p>
                          <p className="text-2xl font-bold">{merchants.filter(m => m.is_allowed).length}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Card Issued</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Request a restricted debit card for child-related expenses
                      </p>
                      <Button onClick={handleRequestCard}>
                        <Plus className="h-4 w-4 mr-2" />
                        Request Card
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="merchants" className="space-y-6">
              {/* Merchant Whitelist */}
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5" />
                      Merchant Whitelist
                    </CardTitle>
                    <CardDescription>Control where the family card can be used</CardDescription>
                  </div>
                  <Dialog open={isAddMerchantOpen} onOpenChange={setIsAddMerchantOpen}>
                    <DialogTrigger asChild>
                      <Button disabled={!profile?.family_id}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Merchant
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Merchant</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Merchant Name</Label>
                          <Input
                            value={newMerchant.name}
                            onChange={(e) => setNewMerchant({ ...newMerchant, name: e.target.value })}
                            placeholder="e.g., Target, Walmart"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={newMerchant.category} onValueChange={(v) => setNewMerchant({ ...newMerchant, category: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MERCHANT_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddMerchantOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddMerchant}>Add Merchant</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {!profile?.family_id ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Set up your family to manage merchants</p>
                    </div>
                  ) : merchants.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No merchants added yet</p>
                      <p className="text-sm">Add merchants to control where the card can be used</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {merchants.map((merchant) => (
                        <div key={merchant.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${merchant.is_allowed ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                              <ShoppingBag className={`h-5 w-5 ${merchant.is_allowed ? 'text-green-500' : 'text-red-500'}`} />
                            </div>
                            <div>
                              <p className="font-medium">{merchant.merchant_name}</p>
                              <p className="text-sm text-muted-foreground">{merchant.merchant_category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {merchant.is_allowed ? 'Allowed' : 'Blocked'}
                              </span>
                              <Switch
                                checked={merchant.is_allowed}
                                onCheckedChange={() => handleToggleMerchant(merchant)}
                              />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteMerchant(merchant.id)}>
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </>
  );
};

export default Payments;