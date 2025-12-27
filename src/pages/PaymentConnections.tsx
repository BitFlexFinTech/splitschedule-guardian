import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  CreditCard, 
  Wallet, 
  Trash2, 
  Star, 
  Plus,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Smartphone
} from "lucide-react";
import { mockPaymentProviders, type PaymentMethod } from "@/lib/mock-payment-providers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const providerConfig = {
  plaid: {
    name: 'Bank Account',
    description: 'Connect via Plaid for secure bank linking',
    icon: Building2,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    iconBg: 'bg-emerald-100',
  },
  paypal: {
    name: 'PayPal',
    description: 'Link your PayPal account',
    icon: Wallet,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    iconBg: 'bg-blue-100',
  },
  stripe: {
    name: 'Debit/Credit Card',
    description: 'Add a card via Stripe',
    icon: CreditCard,
    color: 'bg-violet-50 text-violet-600 border-violet-200',
    iconBg: 'bg-violet-100',
  },
  apple_pay: {
    name: 'Apple Pay',
    description: 'Set up Apple Pay',
    icon: Smartphone,
    color: 'bg-gray-50 text-gray-800 border-gray-200',
    iconBg: 'bg-gray-100',
  },
  google_pay: {
    name: 'Google Pay',
    description: 'Set up Google Pay',
    icon: Smartphone,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
    iconBg: 'bg-blue-100',
  },
  klarna: {
    name: 'Klarna',
    description: 'Buy now, pay later',
    icon: CreditCard,
    color: 'bg-pink-50 text-pink-600 border-pink-200',
    iconBg: 'bg-pink-100',
  },
  sepa: {
    name: 'SEPA Direct Debit',
    description: 'European bank transfers',
    icon: Building2,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    iconBg: 'bg-indigo-100',
  },
};

const PaymentConnections = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [showPayPalDialog, setShowPayPalDialog] = useState(false);
  const [showSEPADialog, setShowSEPADialog] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [sepaIban, setSepaIban] = useState('');

  useEffect(() => {
    // Load mock saved payment methods from localStorage for demo
    const saved = localStorage.getItem('payment_methods');
    if (saved) {
      setPaymentMethods(JSON.parse(saved));
    }
  }, []);

  const savePaymentMethods = (methods: PaymentMethod[]) => {
    localStorage.setItem('payment_methods', JSON.stringify(methods));
    setPaymentMethods(methods);
  };

  const handleConnect = async (provider: keyof typeof providerConfig) => {
    if (provider === 'paypal') {
      setShowPayPalDialog(true);
      return;
    }
    if (provider === 'sepa') {
      setShowSEPADialog(true);
      return;
    }

    setConnectingProvider(provider);
    try {
      let method: PaymentMethod;
      
      switch (provider) {
        case 'plaid':
          method = await mockPaymentProviders.connectPlaidBank();
          break;
        case 'stripe':
          method = await mockPaymentProviders.connectStripe();
          break;
        case 'apple_pay':
          method = await mockPaymentProviders.setupApplePay();
          break;
        case 'google_pay':
          method = await mockPaymentProviders.setupGooglePay();
          break;
        case 'klarna':
          method = await mockPaymentProviders.connectKlarna();
          break;
        default:
          throw new Error('Unknown provider');
      }

      const isPrimary = paymentMethods.length === 0;
      method.is_primary = isPrimary;
      
      savePaymentMethods([...paymentMethods, method]);
      
      toast({
        title: "Payment method connected",
        description: `${providerConfig[provider].name} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Unable to connect payment method. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleConnectPayPal = async () => {
    if (!paypalEmail) return;
    
    setShowPayPalDialog(false);
    setConnectingProvider('paypal');
    
    try {
      const method = await mockPaymentProviders.connectPayPal(paypalEmail);
      method.is_primary = paymentMethods.length === 0;
      
      savePaymentMethods([...paymentMethods, method]);
      setPaypalEmail('');
      
      toast({
        title: "PayPal connected",
        description: "Your PayPal account has been linked successfully.",
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Unable to connect PayPal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleConnectSEPA = async () => {
    if (!sepaIban) return;
    
    setShowSEPADialog(false);
    setConnectingProvider('sepa');
    
    try {
      const method = await mockPaymentProviders.connectSEPA(sepaIban);
      method.is_primary = paymentMethods.length === 0;
      
      savePaymentMethods([...paymentMethods, method]);
      setSepaIban('');
      
      toast({
        title: "SEPA connected",
        description: "Your SEPA bank account has been linked successfully.",
      });
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Unable to connect SEPA account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setConnectingProvider(null);
    }
  };

  const handleRemove = async (methodId: string) => {
    await mockPaymentProviders.removePaymentMethod(methodId);
    const updated = paymentMethods.filter(m => m.id !== methodId);
    
    // If removed was primary, make first remaining one primary
    if (updated.length > 0 && !updated.some(m => m.is_primary)) {
      updated[0].is_primary = true;
    }
    
    savePaymentMethods(updated);
    toast({
      title: "Payment method removed",
      description: "The payment method has been removed from your account.",
    });
  };

  const handleSetPrimary = async (methodId: string) => {
    await mockPaymentProviders.setPrimary(methodId);
    const updated = paymentMethods.map(m => ({
      ...m,
      is_primary: m.id === methodId
    }));
    savePaymentMethods(updated);
    toast({
      title: "Primary method updated",
      description: "Your primary payment method has been changed.",
    });
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const availableProviders = Object.entries(providerConfig).filter(
    ([key]) => !paymentMethods.some(m => m.provider === key)
  );

  return (
    <>
      <Helmet>
        <title>Payment Methods | SplitSchedule</title>
        <meta name="description" content="Connect your bank accounts, PayPal, and digital wallets to send and receive payments." />
      </Helmet>

      <DashboardLayout user={user}>
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-light tracking-tight text-foreground">Payment Methods</h1>
            <p className="text-muted-foreground font-light mt-1">
              Connect your accounts to send and receive payments securely
            </p>
          </div>

          {/* Connected Methods */}
          {paymentMethods.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Connected Accounts
              </h2>
              <div className="grid gap-3">
                {paymentMethods.map((method) => {
                  const config = providerConfig[method.provider];
                  const Icon = config.icon;
                  
                  return (
                    <Card key={method.id} className="bg-white border border-border/30 hover:border-border/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg ${config.iconBg} flex items-center justify-center`}>
                              <Icon className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{method.account_name}</span>
                                {method.is_verified && (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
                                )}
                                {method.is_primary && (
                                  <Badge variant="secondary" className="text-xs font-light">
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground font-light">
                                •••• {method.account_last_four}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {!method.is_primary && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSetPrimary(method.id)}
                                className="text-muted-foreground hover:text-foreground font-light"
                              >
                                <Star className="w-4 h-4 mr-1" strokeWidth={1.5} />
                                Set Primary
                              </Button>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                                  <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="font-medium">Remove payment method?</AlertDialogTitle>
                                  <AlertDialogDescription className="font-light">
                                    This will disconnect {method.account_name} from your account.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="font-light">Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleRemove(method.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add New Methods */}
          {availableProviders.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Add Payment Method
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {availableProviders.map(([key, config]) => {
                  const Icon = config.icon;
                  const isConnecting = connectingProvider === key;
                  
                  return (
                    <Card 
                      key={key} 
                      className="bg-white border border-border/30 hover:border-border/50 transition-all hover:shadow-sm cursor-pointer group"
                      onClick={() => !isConnecting && handleConnect(key as keyof typeof providerConfig)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`w-11 h-11 rounded-xl ${config.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                              <Icon className="w-5 h-5" strokeWidth={1.5} />
                            </div>
                            <div>
                              <h3 className="font-medium text-foreground">{config.name}</h3>
                              <p className="text-sm text-muted-foreground font-light mt-0.5">
                                {config.description}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            disabled={isConnecting}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {isConnecting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" strokeWidth={1.5} />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info Card */}
          <Card className="bg-secondary/30 border-border/30">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">Secure Connections</h4>
                  <p className="text-sm text-muted-foreground font-light mt-1">
                    All payment connections are secured with bank-level encryption. We never store your credentials directly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* PayPal Dialog */}
        <Dialog open={showPayPalDialog} onOpenChange={setShowPayPalDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-medium">Connect PayPal</DialogTitle>
              <DialogDescription className="font-light">
                Enter your PayPal email address to link your account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="paypal-email" className="font-light">PayPal Email</Label>
                <Input
                  id="paypal-email"
                  type="email"
                  placeholder="you@example.com"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  className="font-light"
                />
              </div>
              <Button 
                onClick={handleConnectPayPal} 
                className="w-full font-light"
                disabled={!paypalEmail}
              >
                Connect PayPal
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* SEPA Dialog */}
        <Dialog open={showSEPADialog} onOpenChange={setShowSEPADialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-medium">Connect SEPA Direct Debit</DialogTitle>
              <DialogDescription className="font-light">
                Enter your IBAN to set up SEPA Direct Debit.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="sepa-iban" className="font-light">IBAN</Label>
                <Input
                  id="sepa-iban"
                  placeholder="DE89 3704 0044 0532 0130 00"
                  value={sepaIban}
                  onChange={(e) => setSepaIban(e.target.value)}
                  className="font-light uppercase"
                />
              </div>
              <Button 
                onClick={handleConnectSEPA} 
                className="w-full font-light"
                disabled={!sepaIban}
              >
                Connect SEPA
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
};

export default PaymentConnections;
