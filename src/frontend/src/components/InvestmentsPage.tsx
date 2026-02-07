import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, TrendingUp } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useGetInvestmentGoals, useCreateInvestmentGoal } from '../hooks/useQueries';
import { InvestmentGoalCard } from './InvestmentGoalCard';
import { toast } from 'sonner';

export function InvestmentsPage() {
  const { data: goals = [], isLoading } = useGetInvestmentGoals();
  const createGoal = useCreateInvestmentGoal();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newAsset, setNewAsset] = useState('');
  const [newCurrentlyHeld, setNewCurrentlyHeld] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const resetCreateForm = () => {
    setNewAsset('');
    setNewCurrentlyHeld('');
    setNewTarget('');
  };

  const handleCreate = async () => {
    if (!newAsset.trim()) {
      toast.error('Please enter an asset name');
      return;
    }

    const currentlyHeld = parseFloat(newCurrentlyHeld);
    const target = parseFloat(newTarget);

    if (isNaN(currentlyHeld) || currentlyHeld < 0) {
      toast.error('Please enter a valid currently held amount');
      return;
    }

    if (isNaN(target) || target <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }

    try {
      await createGoal.mutateAsync({
        asset: newAsset.trim(),
        currentlyHeld: BigInt(Math.floor(currentlyHeld)),
        target: BigInt(Math.floor(target)),
      });
      toast.success('Goal created successfully');
      setCreateDialogOpen(false);
      resetCreateForm();
    } catch (error) {
      toast.error('Failed to create goal');
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading investment goals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investment Goals</h2>
          <p className="text-muted-foreground">Track your investment targets</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (open) resetCreateForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Investment Goal</DialogTitle>
              <DialogDescription>
                Set a target for your investment asset
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="asset">Asset Name</Label>
                <Input
                  id="asset"
                  placeholder="e.g., Bitcoin, Apple Stock, S&P 500"
                  value={newAsset}
                  onChange={(e) => setNewAsset(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currently-held">Currently Held (shares/tokens)</Label>
                <Input
                  id="currently-held"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={newCurrentlyHeld}
                  onChange={(e) => setNewCurrentlyHeld(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Target (shares/tokens)</Label>
                <Input
                  id="target"
                  type="number"
                  step="1"
                  min="1"
                  placeholder="100"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreate} 
                disabled={createGoal.isPending}
              >
                {createGoal.isPending ? 'Creating...' : 'Create Goal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Investment Goals Yet</h3>
            <p className="text-muted-foreground text-center mb-4 max-w-sm">
              Start tracking your investment progress by creating your first goal
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <InvestmentGoalCard key={Number(goal.id)} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
