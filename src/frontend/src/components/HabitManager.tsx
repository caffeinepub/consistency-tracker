import { useState } from 'react';
import { useCreateHabit, useDeleteHabit, useGetHabits, useUpdateHabitWeeklyTarget, useUpdateHabitUnit } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';
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
} from '@/components/ui/alert-dialog';
import { createHabitUnit, getHabitUnitLabel } from '../utils/habitUnit';
import type { HabitUnit } from '../backend';

export function HabitManager() {
  const [newHabitName, setNewHabitName] = useState('');
  const [weeklyTarget, setWeeklyTarget] = useState('7');
  const [selectedUnit, setSelectedUnit] = useState<'reps' | 'time'>('reps');
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingWeeklyTarget, setEditingWeeklyTarget] = useState('');
  
  const { data: habits = [] } = useGetHabits();
  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();
  const updateWeeklyTarget = useUpdateHabitWeeklyTarget();

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) {
      toast.error('Please enter a habit name');
      return;
    }

    const target = parseInt(weeklyTarget);
    if (isNaN(target) || target < 1 || target > 7) {
      toast.error('Weekly target must be between 1 and 7');
      return;
    }

    try {
      const unit = createHabitUnit(selectedUnit);
      await createHabit.mutateAsync({ name: newHabitName.trim(), weeklyTarget: target, unit });
      setNewHabitName('');
      setWeeklyTarget('7');
      setSelectedUnit('reps');
      toast.success('Habit created successfully!');
    } catch (error) {
      toast.error('Failed to create habit');
      console.error(error);
    }
  };

  const handleDeleteHabit = async (habitId: string, habitName: string) => {
    try {
      await deleteHabit.mutateAsync(habitId);
      toast.success(`"${habitName}" deleted`);
    } catch (error) {
      toast.error('Failed to delete habit');
      console.error(error);
    }
  };

  const startEditing = (habitId: string, currentTarget: bigint) => {
    setEditingHabitId(habitId);
    setEditingWeeklyTarget(String(Number(currentTarget)));
  };

  const cancelEditing = () => {
    setEditingHabitId(null);
    setEditingWeeklyTarget('');
  };

  const handleUpdateWeeklyTarget = async (habitId: string, habitName: string) => {
    const target = parseInt(editingWeeklyTarget);
    if (isNaN(target) || target < 1 || target > 7) {
      toast.error('Weekly target must be between 1 and 7');
      return;
    }

    try {
      await updateWeeklyTarget.mutateAsync({ habitId, newWeeklyTarget: target });
      setEditingHabitId(null);
      setEditingWeeklyTarget('');
      toast.success(`"${habitName}" weekly target updated to ${target}x per week`);
    } catch (error) {
      toast.error('Failed to update weekly target');
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Habits</CardTitle>
        <CardDescription>Add or remove habits to track with weekly targets and units</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleCreateHabit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Habit Name</Label>
            <Input
              id="habit-name"
              placeholder="e.g., Press-ups, Running, Reading"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weekly-target">Weekly Target</Label>
              <Input
                id="weekly-target"
                type="number"
                min="1"
                max="7"
                value={weeklyTarget}
                onChange={(e) => setWeeklyTarget(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Times per week</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={selectedUnit} onValueChange={(value) => setSelectedUnit(value as 'reps' | 'time')}>
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reps">Reps</SelectItem>
                  <SelectItem value="time">Time (minutes)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={createHabit.isPending} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Habit
          </Button>
        </form>

        {habits.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Your Habits ({habits.length})</p>
            <div className="space-y-2">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{habit.name}</span>
                    {editingHabitId === habit.id ? (
                      <div className="flex items-center gap-2 mt-2">
                        <Input
                          type="number"
                          min="1"
                          max="7"
                          value={editingWeeklyTarget}
                          onChange={(e) => setEditingWeeklyTarget(e.target.value)}
                          className="h-8 w-20"
                          autoFocus
                        />
                        <span className="text-xs text-muted-foreground">times/week</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Target: {Number(habit.weeklyTarget)}x per week · Unit: {getHabitUnitLabel(habit.unit)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {editingHabitId === habit.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateWeeklyTarget(habit.id, habit.name)}
                          disabled={updateWeeklyTarget.isPending}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={cancelEditing}
                          disabled={updateWeeklyTarget.isPending}
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEditing(habit.id, habit.weeklyTarget)}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Habit</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{habit.name}"? This will remove all
                                associated tracking data and cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteHabit(habit.id, habit.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
