import { useState } from 'react';
import type { InvestmentGoal } from '../backend';
import { useUpdateInvestmentGoal, useDeleteInvestmentGoal } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit2, Plus, Trash2 } from 'lucide-react';

interface InvestmentGoalCardProps {
  goal: InvestmentGoal;
}

export function InvestmentGoalCard({ goal }: InvestmentGoalCardProps) {
  const updateGoal = useUpdateInvestmentGoal();
  const deleteGoal = useDeleteInvestmentGoal();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isContributionDialogOpen, setIsContributionDialogOpen] = useState(false);

  const [editFormData, setEditFormData] = useState({
    name: goal.name,
    ticker: goal.ticker,
    targetShares: Number(goal.targetShares).toString(),
    currentBalance: Number(goal.currentBalance).toString(),
  });

  const [contributionAmount, setContributionAmount] = useState('');

  const currentBalance = Number(goal.currentBalance);
  const targetShares = Number(goal.targetShares);
  const progressPercentage = targetShares > 0 ? Math.min((currentBalance / targetShares) * 100, 100) : 0;

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetSharesNum = parseFloat(editFormData.targetShares);
    const currentBalanceNum = parseFloat(editFormData.currentBalance);

    if (!editFormData.name.trim() || !editFormData.ticker.trim()) {
      return;
    }

    if (isNaN(targetSharesNum) || targetSharesNum < 0) {
      return;
    }

    if (isNaN(currentBalanceNum) || currentBalanceNum < 0) {
      return;
    }

    try {
      await updateGoal.mutateAsync({
        goalId: goal.id,
        name: editFormData.name.trim(),
        ticker: editFormData.ticker.trim().toUpperCase(),
        targetShares: targetSharesNum,
        currentBalance: currentBalanceNum,
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Failed to update investment goal:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGoal.mutateAsync(goal.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete investment goal:', error);
    }
  };

  const handleContribution = async (e: React.FormEvent) => {
    e.preventDefault();

    const contribution = parseFloat(contributionAmount);

    if (isNaN(contribution) || contribution < 0) {
      return;
    }

    const newBalance = currentBalance + contribution;

    try {
      await updateGoal.mutateAsync({
        goalId: goal.id,
        name: goal.name,
        ticker: goal.ticker,
        targetShares,
        currentBalance: newBalance,
      });
      setContributionAmount('');
      setIsContributionDialogOpen(false);
    } catch (error) {
      console.error('Failed to log contribution:', error);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{goal.name}</CardTitle>
              <p className="text-sm text-muted-foreground font-mono">{goal.ticker}</p>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setEditFormData({
                    name: goal.name,
                    ticker: goal.ticker,
                    targetShares: Number(goal.targetShares).toString(),
                    currentBalance: Number(goal.currentBalance).toString(),
                  });
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Current Balance</p>
              <p className="font-semibold text-lg">{currentBalance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Target</p>
              <p className="font-semibold text-lg">{targetShares.toLocaleString()}</p>
            </div>
          </div>

          <Button
            className="w-full gap-2"
            variant="outline"
            onClick={() => setIsContributionDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Log Contribution
          </Button>
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Investment Goal</DialogTitle>
            <DialogDescription>Update your investment goal details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Goal Name</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ticker">Ticker / Token Symbol</Label>
              <Input
                id="edit-ticker"
                value={editFormData.ticker}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, ticker: e.target.value.toUpperCase() })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-targetShares">Target Shares / Tokens</Label>
              <Input
                id="edit-targetShares"
                type="number"
                step="0.00000001"
                min="0"
                value={editFormData.targetShares}
                onChange={(e) => setEditFormData({ ...editFormData, targetShares: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-currentBalance">Current Balance</Label>
              <Input
                id="edit-currentBalance"
                type="number"
                step="0.00000001"
                min="0"
                value={editFormData.currentBalance}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, currentBalance: e.target.value })
                }
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateGoal.isPending}>
                {updateGoal.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isContributionDialogOpen} onOpenChange={setIsContributionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Contribution</DialogTitle>
            <DialogDescription>
              Add shares/tokens to your current balance for {goal.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleContribution} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contribution">Amount to Add</Label>
              <Input
                id="contribution"
                type="number"
                step="0.00000001"
                min="0"
                placeholder="e.g., 5"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                required
              />
              <p className="text-sm text-muted-foreground">
                New balance will be: {(currentBalance + (parseFloat(contributionAmount) || 0)).toLocaleString()}
              </p>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setContributionAmount('');
                  setIsContributionDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateGoal.isPending}>
                {updateGoal.isPending ? 'Logging...' : 'Log Contribution'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Investment Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this investment goal?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteGoal.isPending}
            >
              {deleteGoal.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
