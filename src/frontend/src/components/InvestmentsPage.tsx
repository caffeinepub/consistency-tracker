import { useState } from 'react';
import { useGetInvestmentGoals, useCreateInvestmentGoal } from '../hooks/useQueries';
import { InvestmentGoalCard } from './InvestmentGoalCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, TrendingUp } from 'lucide-react';

export function InvestmentsPage() {
  const { data: goals = [], isLoading } = useGetInvestmentGoals();
  const createGoal = useCreateInvestmentGoal();

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    targetShares: '',
    currentBalance: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetShares = parseFloat(formData.targetShares);
    const currentBalance = parseFloat(formData.currentBalance);

    if (!formData.name.trim() || !formData.ticker.trim()) {
      return;
    }

    if (isNaN(targetShares) || targetShares < 0) {
      return;
    }

    if (isNaN(currentBalance) || currentBalance < 0) {
      return;
    }

    try {
      await createGoal.mutateAsync({
        name: formData.name.trim(),
        ticker: formData.ticker.trim().toUpperCase(),
        targetShares,
        currentBalance,
      });

      setFormData({ name: '', ticker: '', targetShares: '', currentBalance: '' });
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to create investment goal:', error);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', ticker: '', targetShares: '', currentBalance: '' });
    setIsCreating(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading investment goals...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investment Goals</h2>
          <p className="text-muted-foreground">Track your progress toward investment targets</p>
        </div>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Goal
          </Button>
        )}
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create Investment Goal</CardTitle>
            <CardDescription>
              Set a target for shares or tokens you want to accumulate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Goal Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Retirement Fund"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticker">Ticker / Token Symbol</Label>
                  <Input
                    id="ticker"
                    placeholder="e.g., AAPL, BTC, ETH"
                    value={formData.ticker}
                    onChange={(e) => setFormData({ ...formData, ticker: e.target.value.toUpperCase() })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetShares">Target Shares / Tokens</Label>
                  <Input
                    id="targetShares"
                    type="number"
                    step="0.00000001"
                    min="0"
                    placeholder="e.g., 100"
                    value={formData.targetShares}
                    onChange={(e) => setFormData({ ...formData, targetShares: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentBalance">Current Balance</Label>
                  <Input
                    id="currentBalance"
                    type="number"
                    step="0.00000001"
                    min="0"
                    placeholder="e.g., 25"
                    value={formData.currentBalance}
                    onChange={(e) => setFormData({ ...formData, currentBalance: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createGoal.isPending}>
                  {createGoal.isPending ? 'Creating...' : 'Create Goal'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {goals.length === 0 && !isCreating ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No investment goals yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start tracking your investment progress by creating your first goal
            </p>
            <Button onClick={() => setIsCreating(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal) => (
            <InvestmentGoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
