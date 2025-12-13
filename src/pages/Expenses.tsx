import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Receipt, DollarSign, TrendingUp, Filter, Upload, Check, X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface Expense {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  category: string;
  receipt_url: string | null;
  expense_date: string;
  split_percentage: number;
  is_settled: boolean;
  created_by: string;
  created_at: string;
}

const categoryColors: Record<string, string> = {
  medical: 'bg-red-500',
  education: 'bg-blue-500',
  clothing: 'bg-purple-500',
  activities: 'bg-green-500',
  food: 'bg-orange-500',
  transportation: 'bg-yellow-500',
  childcare: 'bg-pink-500',
  entertainment: 'bg-indigo-500',
  other: 'bg-gray-500',
};

const Expenses: React.FC = () => {
  const { user, profile } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<'all' | 'activities' | 'childcare' | 'clothing' | 'education' | 'entertainment' | 'food' | 'medical' | 'other' | 'transportation'>('all');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  
  const [newExpense, setNewExpense] = useState({
    title: '',
    description: '',
    amount: '',
    category: 'other' as const,
    expense_date: format(new Date(), 'yyyy-MM-dd'),
    split_percentage: '50',
  });

  const fetchExpenses = async () => {
    if (!profile?.family_id) {
      setIsLoading(false);
      return;
    }
    
    try {
      let query = supabase
        .from('expenses')
        .select('*')
        .eq('family_id', profile.family_id)
        .order('expense_date', { ascending: false });
      
      if (filterCategory !== 'all') {
        query = query.eq('category', filterCategory as 'activities' | 'childcare' | 'clothing' | 'education' | 'entertainment' | 'food' | 'medical' | 'other' | 'transportation');
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [profile?.family_id, filterCategory]);

  // Real-time subscription
  useEffect(() => {
    if (!profile?.family_id) return;

    const channel = supabase
      .channel('expenses')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'expenses',
        filter: `family_id=eq.${profile.family_id}`
      }, () => {
        fetchExpenses();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.family_id]);

  const handleAddExpense = async () => {
    if (!profile?.family_id || !user) {
      toast.error('Please set up your family first');
      return;
    }

    try {
      let receiptUrl = null;
      
      if (receiptFile) {
        const fileExt = receiptFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('receipts')
          .upload(filePath, receiptFile);
        
        if (uploadError) throw uploadError;
        
        const { data: urlData } = supabase.storage
          .from('receipts')
          .getPublicUrl(filePath);
        
        receiptUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from('expenses')
        .insert({
          family_id: profile.family_id,
          created_by: user.id,
          title: newExpense.title,
          description: newExpense.description || null,
          amount: parseFloat(newExpense.amount),
          category: newExpense.category,
          expense_date: newExpense.expense_date,
          split_percentage: parseFloat(newExpense.split_percentage),
          receipt_url: receiptUrl,
        });

      if (error) throw error;
      
      toast.success('Expense added successfully');
      setIsAddExpenseOpen(false);
      setNewExpense({
        title: '',
        description: '',
        amount: '',
        category: 'other',
        expense_date: format(new Date(), 'yyyy-MM-dd'),
        split_percentage: '50',
      });
      setReceiptFile(null);
      fetchExpenses();
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Failed to add expense');
    }
  };

  const handleSettleExpense = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({ 
          is_settled: true, 
          settled_at: new Date().toISOString(),
          settled_by: user?.id 
        })
        .eq('id', expenseId);

      if (error) throw error;
      toast.success('Expense marked as settled');
      fetchExpenses();
    } catch (error) {
      console.error('Error settling expense:', error);
      toast.error('Failed to settle expense');
    }
  };

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const unsettledExpenses = expenses.filter(e => !e.is_settled);
  const unsettledTotal = unsettledExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const yourShare = unsettledTotal * 0.5;

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Expense Tracker | SplitSchedule</title>
        <meta name="description" content="Track and split shared expenses with your co-parent" />
      </Helmet>
      
      <DashboardLayout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Expense Tracker</h1>
              <p className="text-muted-foreground">Track and split shared expenses</p>
            </div>
            <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newExpense.title}
                      onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                      placeholder="Expense title"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount ($)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={newExpense.category}
                        onValueChange={(value: any) => setNewExpense({ ...newExpense, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="clothing">Clothing</SelectItem>
                          <SelectItem value="activities">Activities</SelectItem>
                          <SelectItem value="food">Food</SelectItem>
                          <SelectItem value="transportation">Transportation</SelectItem>
                          <SelectItem value="childcare">Childcare</SelectItem>
                          <SelectItem value="entertainment">Entertainment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expense_date">Date</Label>
                      <Input
                        id="expense_date"
                        type="date"
                        value={newExpense.expense_date}
                        onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="split_percentage">Your Split (%)</Label>
                      <Input
                        id="split_percentage"
                        type="number"
                        min="0"
                        max="100"
                        value={newExpense.split_percentage}
                        onChange={(e) => setNewExpense({ ...newExpense, split_percentage: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receipt">Receipt (optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="receipt"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                        className="flex-1"
                      />
                      {receiptFile && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Upload className="h-3 w-3" />
                          {receiptFile.name.slice(0, 15)}...
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                      placeholder="Optional description"
                    />
                  </div>
                  <Button onClick={handleAddExpense} className="w-full">
                    Add Expense
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Expenses</p>
                    <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unsettled</p>
                    <p className="text-2xl font-bold">${unsettledTotal.toFixed(2)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Share</p>
                    <p className="text-2xl font-bold">${yourShare.toFixed(2)}</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as typeof filterCategory)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="activities">Activities</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="childcare">Childcare</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Expense List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading expenses...</div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No expenses yet. Add your first expense to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        expense.is_settled ? 'bg-muted/50' : 'bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-2 h-12 rounded ${categoryColors[expense.category]}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{expense.title}</p>
                            <Badge variant="outline" className="capitalize text-xs">
                              {expense.category}
                            </Badge>
                            {expense.is_settled && (
                              <Badge variant="secondary" className="text-xs">
                                <Check className="h-3 w-3 mr-1" />
                                Settled
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(expense.expense_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">${Number(expense.amount).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            Your share: ${(Number(expense.amount) * Number(expense.split_percentage) / 100).toFixed(2)}
                          </p>
                        </div>
                        {!expense.is_settled && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSettleExpense(expense.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* No Family Warning */}
          {!profile?.family_id && (
            <Card className="border-warning bg-warning/10">
              <CardContent className="py-4">
                <p className="text-warning-foreground">
                  You need to create or join a family to track expenses. Go to Settings to set up your family.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default Expenses;
