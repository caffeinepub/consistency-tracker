import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit2, Trash2, TrendingUp } from 'lucide-react';
import { useUpdateInvestmentGoal, useDeleteInvestmentGoal } from '../hooks/useQueries';
import { toast } from 'sonner';
import { computeGoalProgressPercentage, formatQuantity } from '../utils/investments';
import type { InvestmentGoal } from '../backend';

interface InvestmentGoalCardProps {
  goal: InvestmentGoal;
}

export function InvestmentGoalCard({ goal }: InvestmentGoalCardProps) {
  const updateGoal = useUpdateInvestmentGoal();
  const deleteGoal = useDeleteInvestmentGoal();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCurrentlyHeld, setEditCurrentlyHeld] = useState(goal.currentlyHeld.toString());
  const [editTarget, setEditTarget] = useState(goal.target.toString());

  const progress = computeGoalProgressPercentage(Number(goal.currentlyHeld), Number(goal.target));
  const isComplete = progress >= 100;

  const resetEditForm = () => {
    setEditCurrentlyHeld(goal.currentlyHeld.toString());
    setEditTarget(goal.target.toString());
  };

  const handleUpdate = async () => {
    const currentlyHeld = parseFloat(editCurrentlyHeld);
    const target = parseFloat(editTarget);

    if (isNaN(currentlyHeld) || currentlyHeld < 0) {
      toast.error('Please enter a valid currently held amount');
      return;
    }

    if (isNaN(target) || target <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }

    try {
      await updateGoal.mutateAsync({
        goalId: goal.id,
        updates: {
          currentlyHeld: BigInt(Math.floor(currentlyHeld)),
          target: BigInt(Math.floor(target)),
        },
      });
      toast.success('Goal updated successfully');
      setEditDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update goal');
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteGoal.mutateAsync(goal.id);
      toast.success('Goal deleted successfully');
    } catch (error) {
      toast.error('Failed to delete goal');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg">{goal.asset}</CardTitle>
              {isComplete && (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                  <TrendingUp className="mr-1 h-3 w-3" />
                  Complete
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                Currently Held: <span className="font-semibold text-foreground">{formatQuantity(Number(goal.currentlyHeld))}</span>
              </span>
              <span>
                Target: <span className="font-semibold text-foreground">{formatQuantity(Number(goal.target))}</span>
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={editDialogOpen} onOpenChange={(open) => {
              setEditDialogOpen(open);
              if (open) resetEditForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Edit2 className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Goal: {goal.asset}</DialogTitle>
                  <DialogDescription>
                    Update your progress and target
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-currently-held">Currently Held (shares/tokens)</Label>
                    <Input
                      id="edit-currently-held"
                      type="number"
                      step="1"
                      min="0"
                      value={editCurrentlyHeld}
                      onChange={(e) => setEditCurrentlyHeld(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-target">Target (shares/tokens)</Label>
                    <Input
                      id="edit-target"
                      type="number"
                      step="1"
                      min="1"
                      value={editTarget}
                      onChange={(e) => setEditTarget(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdate} 
                    disabled={updateGoal.isPending}
                  >
                    {updateGoal.isPending ? 'Updating...' : 'Update Goal'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Goal</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the goal for {goal.asset}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleteGoal.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteGoal.isPending ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{progress.toFixed(1)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}
