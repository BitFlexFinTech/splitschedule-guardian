import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Download, FileText, Calendar, DollarSign, 
  AlertTriangle, BarChart3, Loader2 
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const Reports: React.FC = () => {
  const { user, profile } = useAuth();
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('last-month');

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'last-month':
        return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
      case 'last-3-months':
        return { start: startOfMonth(subMonths(now, 3)), end: now };
      case 'last-6-months':
        return { start: startOfMonth(subMonths(now, 6)), end: now };
      case 'last-year':
        return { start: startOfMonth(subMonths(now, 12)), end: now };
      default:
        return { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
    }
  };

  const generateCalendarReport = async () => {
    if (!profile?.family_id) {
      toast.error('No family connected');
      return;
    }

    setIsGenerating('calendar');
    try {
      const { start, end } = getDateRange();
      
      const { data: events, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('family_id', profile.family_id)
        .gte('start_time', start.toISOString())
        .lte('end_time', end.toISOString())
        .order('start_time');

      if (error) throw error;

      const content = `CUSTODY CALENDAR REPORT
Generated: ${format(new Date(), 'PPpp')}
Period: ${format(start, 'PP')} - ${format(end, 'PP')}
Total Events: ${events?.length || 0}

${events?.map(event => `
Date: ${format(new Date(event.start_time), 'PPp')}
Title: ${event.title}
Type: ${event.event_type}
Location: ${event.location || 'Not specified'}
---`).join('\n') || 'No events in this period'}`;

      downloadFile(content, `calendar-report-${format(new Date(), 'yyyy-MM-dd')}.txt`);
      toast.success('Calendar report generated');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(null);
    }
  };

  const generateExpenseReport = async () => {
    if (!profile?.family_id) {
      toast.error('No family connected');
      return;
    }

    setIsGenerating('expenses');
    try {
      const { start, end } = getDateRange();
      
      const { data: expenses, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('family_id', profile.family_id)
        .gte('expense_date', format(start, 'yyyy-MM-dd'))
        .lte('expense_date', format(end, 'yyyy-MM-dd'))
        .order('expense_date');

      if (error) throw error;

      const total = expenses?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const settled = expenses?.filter(e => e.is_settled).reduce((sum, e) => sum + Number(e.amount), 0) || 0;

      const content = `EXPENSE REPORT
Generated: ${format(new Date(), 'PPpp')}
Period: ${format(start, 'PP')} - ${format(end, 'PP')}
Total Expenses: $${total.toFixed(2)}
Settled: $${settled.toFixed(2)}
Outstanding: $${(total - settled).toFixed(2)}

EXPENSE DETAILS:
${expenses?.map(expense => `
Date: ${expense.expense_date}
Title: ${expense.title}
Amount: $${Number(expense.amount).toFixed(2)}
Category: ${expense.category}
Status: ${expense.is_settled ? 'Settled' : 'Pending'}
---`).join('\n') || 'No expenses in this period'}`;

      downloadFile(content, `expense-report-${format(new Date(), 'yyyy-MM-dd')}.txt`);
      toast.success('Expense report generated');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(null);
    }
  };

  const generateIncidentReport = async () => {
    if (!profile?.family_id) {
      toast.error('No family connected');
      return;
    }

    setIsGenerating('incidents');
    try {
      const { start, end } = getDateRange();
      
      const { data: incidents, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('family_id', profile.family_id)
        .gte('incident_date', start.toISOString())
        .lte('incident_date', end.toISOString())
        .order('incident_date');

      if (error) throw error;

      const content = `INCIDENT LOG REPORT - COURT READY DOCUMENT
Generated: ${format(new Date(), 'PPpp')}
Period: ${format(start, 'PP')} - ${format(end, 'PP')}
Total Incidents: ${incidents?.length || 0}

THIS DOCUMENT CONTAINS TAMPER-PROOF RECORDS
Each incident is cryptographically hashed for authenticity verification.

${incidents?.map((incident, i) => `
-------------------------------------------
INCIDENT #${i + 1}
-------------------------------------------
Date/Time: ${format(new Date(incident.incident_date), 'PPpp')}
Title: ${incident.title}
Severity: ${incident.severity.toUpperCase()}
Location: ${incident.location || 'Not specified'}
Witnesses: ${incident.witnesses || 'None listed'}

Description:
${incident.description}

Integrity Hash: ${incident.hash}
Logged At: ${format(new Date(incident.created_at), 'PPpp')}
`).join('\n') || 'No incidents in this period'}

-------------------------------------------
END OF DOCUMENT
-------------------------------------------
This document was generated by SplitSchedule.
Records are cryptographically hashed to ensure integrity.`;

      downloadFile(content, `incident-report-${format(new Date(), 'yyyy-MM-dd')}.txt`);
      toast.success('Incident report generated');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setIsGenerating(null);
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Reports | SplitSchedule</title>
        <meta name="description" content="Generate and download reports" />
      </Helmet>
      
      <DashboardLayout user={user}>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">Generate and export your data</p>
          </div>

          {/* Date Range Selector */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Label>Report Period:</Label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-month">Last Month</SelectItem>
                    <SelectItem value="last-3-months">Last 3 Months</SelectItem>
                    <SelectItem value="last-6-months">Last 6 Months</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Calendar Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Calendar Report
                </CardTitle>
                <CardDescription>
                  Export custody schedule and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Includes all custody events, appointments, and activities for the selected period.
                </p>
                <Button 
                  onClick={generateCalendarReport} 
                  disabled={isGenerating === 'calendar' || !profile?.family_id}
                  className="w-full"
                >
                  {isGenerating === 'calendar' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            {/* Expense Report */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Expense Report
                </CardTitle>
                <CardDescription>
                  Export expense tracking data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Complete breakdown of shared expenses, categories, and settlement status.
                </p>
                <Button 
                  onClick={generateExpenseReport} 
                  disabled={isGenerating === 'expenses' || !profile?.family_id}
                  className="w-full"
                >
                  {isGenerating === 'expenses' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Generate Report
                </Button>
              </CardContent>
            </Card>

            {/* Incident Report */}
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Incident Report
                </CardTitle>
                <CardDescription>
                  Court-ready documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Tamper-proof incident log with cryptographic hashes for legal use.
                </p>
                <Button 
                  onClick={generateIncidentReport} 
                  disabled={isGenerating === 'incidents' || !profile?.family_id}
                  className="w-full"
                  variant="destructive"
                >
                  {isGenerating === 'incidents' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Generate Court Document
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* No Family Warning */}
          {!profile?.family_id && (
            <Card className="border-warning bg-warning/10">
              <CardContent className="py-4">
                <p className="text-warning-foreground">
                  You need to create or join a family to generate reports. Go to Settings to set up your family.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </>
  );
};

export default Reports;
