import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, TrendingUp, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useGetDiaryEntries, useAddDiaryEntry, useAddInvestmentGoal } from '../hooks/useQueries';
import { formatDate, formatAmount, parseDate } from '../utils/investments';
import { toast } from 'sonner';

export function InvestmentsPage() {
  const { data: diaryEntries = [], isLoading: entriesLoading } = useGetDiaryEntries();
  const addDiaryEntry = useAddDiaryEntry();
  const addInvestmentGoal = useAddInvestmentGoal();

  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);

  // Entry form state
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [entryAsset, setEntryAsset] = useState('');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryNotes, setEntryNotes] = useState('');

  // Goal form state
  const [goalAsset, setGoalAsset] = useState('');
  const [goalTarget, setGoalTarget] = useState('');

  const resetEntryForm = () => {
    setEntryDate(new Date().toISOString().split('T')[0]);
    setEntryAsset('');
    setEntryAmount('');
    setEntryNotes('');
  };

  const resetGoalForm = () => {
    setGoalAsset('');
    setGoalTarget('');
  };

  const handleAddEntry = async () => {
    if (!entryAsset.trim() || !entryAmount.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(entryAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await addDiaryEntry.mutateAsync({
        date: parseDate(entryDate),
        asset: entryAsset.trim(),
        amount,
        notes: entryNotes.trim(),
      });
      toast.success('Entry added successfully');
      setEntryDialogOpen(false);
      resetEntryForm();
    } catch (error) {
      toast.error('Failed to save entry');
      console.error(error);
    }
  };

  const handleAddGoal = async () => {
    if (!goalAsset.trim() || !goalTarget.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const target = parseFloat(goalTarget);
    if (isNaN(target) || target <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }

    try {
      await addInvestmentGoal.mutateAsync({
        asset: goalAsset.trim(),
        targetAmount: target,
      });
      toast.success('Goal created successfully');
      setGoalDialogOpen(false);
      resetGoalForm();
    } catch (error) {
      toast.error('Failed to create goal');
      console.error(error);
    }
  };

  if (entriesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading your investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Investment Goals Feature</AlertTitle>
        <AlertDescription>
          The Investment Goals tracking feature is currently in development. You can add diary entries now, and goal tracking will be available soon.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="diary" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="diary">Diary Entries</TabsTrigger>
          <TabsTrigger value="goals" disabled>Investment Goals (Coming Soon)</TabsTrigger>
        </TabsList>

        <TabsContent value="diary" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Investment Diary</h2>
              <p className="text-muted-foreground">Record your investment transactions</p>
            </div>
            <Dialog open={entryDialogOpen} onOpenChange={(open) => {
              setEntryDialogOpen(open);
              if (!open) resetEntryForm();
            }}>
              <DialogTrigger asChild>
                <Button onClick={resetEntryForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Diary Entry</DialogTitle>
                  <DialogDescription>
                    Record details about your investment transaction
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="entry-date">Date</Label>
                    <Input
                      id="entry-date"
                      type="date"
                      value={entryDate}
                      onChange={(e) => setEntryDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entry-asset">Asset Name / Ticker</Label>
                    <Input
                      id="entry-asset"
                      placeholder="e.g., BTC, AAPL, Index Fund"
                      value={entryAsset}
                      onChange={(e) => setEntryAsset(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entry-amount">Amount Invested</Label>
                    <Input
                      id="entry-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="e.g., 100.00"
                      value={entryAmount}
                      onChange={(e) => setEntryAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entry-notes">Notes</Label>
                    <Textarea
                      id="entry-notes"
                      placeholder="Rationale behind this trade..."
                      value={entryNotes}
                      onChange={(e) => setEntryNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setEntryDialogOpen(false);
                    resetEntryForm();
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAddEntry} 
                    disabled={addDiaryEntry.isPending}
                  >
                    {addDiaryEntry.isPending ? 'Saving...' : 'Add Entry'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {diaryEntries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No diary entries yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Start recording your investment transactions
                </p>
                <Button onClick={() => setEntryDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Entry
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {diaryEntries
                .slice()
                .sort((a, b) => Number(b.date - a.date))
                .map((entry) => (
                  <Card key={entry.id.toString()}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{entry.asset}</CardTitle>
                          <CardDescription>{formatDate(entry.date)}</CardDescription>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${formatAmount(entry.amount).toFixed(2)}</p>
                        </div>
                      </div>
                    </CardHeader>
                    {entry.notes && (
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{entry.notes}</p>
                      </CardContent>
                    )}
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-full bg-primary/10 p-4 mb-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Investment Goals Coming Soon</h3>
              <p className="text-muted-foreground text-center">
                Goal tracking and progress monitoring will be available in the next update
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
