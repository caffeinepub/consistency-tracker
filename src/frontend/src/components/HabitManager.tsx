import { useState } from 'react';
import { useCreateHabit, useDeleteHabit, useGetHabits, useUpdateHabitName, useUpdateHabitWeeklyTarget, useUpdateHabitUnit, useUpdateHabitDefaultAmount } from '../hooks/useQueries';
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
import { createHabitUnit, getHabitUnitLabel, isNoUnit, habitUnitToSelectValue, isTimeUnit } from '../utils/habitUnit';
import { parseDuration, formatDuration } from '../utils/duration';
import type { HabitUnit } from '../backend';

export function HabitManager() {
  const [newHabitName, setNewHabitName] = useState('');
  const [weeklyTarget, setWeeklyTarget] = useState('7');
  const [selectedUnit, setSelectedUnit] = useState<'reps' | 'time' | 'km' | 'none'>('reps');
  const [defaultAmount, setDefaultAmount] = useState('');
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingWeeklyTarget, setEditingWeeklyTarget] = useState('');
  const [editingUnit, setEditingUnit] = useState<'reps' | 'time' | 'km' | 'none'>('reps');
  const [editingDefaultAmount, setEditingDefaultAmount] = useState('');
  
  const { data: habits = [] } = useGetHabits();
  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();
  const updateName = useUpdateHabitName();
  const updateWeeklyTarget = useUpdateHabitWeeklyTarget();
  const updateUnit = useUpdateHabitUnit();
  const updateDefaultAmount = useUpdateHabitDefaultAmount();

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

    // Validate default amount if provided and unit is not 'none'
    let amountValue: number | null = null;
    if (selectedUnit !== 'none' && defaultAmount.trim() !== '') {
      if (selectedUnit === 'time') {
        // Parse duration for Time habits
        const parsedSeconds = parseDuration(defaultAmount);
        if (parsedSeconds === null || parsedSeconds < 0) {
          toast.error('Invalid duration format. Try "1 min 15 sec", "75 sec", or "1:15"');
          return;
        }
        amountValue = parsedSeconds;
      } else {
        // Parse as integer for non-Time habits (reps, km)
        const parsedAmount = parseInt(defaultAmount);
        if (isNaN(parsedAmount) || parsedAmount < 0 || !Number.isInteger(parsedAmount)) {
          toast.error('Default amount must be a non-negative integer');
          return;
        }
        amountValue = parsedAmount;
      }
    }

    try {
      const unit = createHabitUnit(selectedUnit);
      await createHabit.mutateAsync({ name: newHabitName.trim(), weeklyTarget: target, unit, defaultAmount: amountValue });
      setNewHabitName('');
      setWeeklyTarget('7');
      setSelectedUnit('reps');
      setDefaultAmount('');
      toast.success('Habit created successfully!');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to create habit';
      toast.error(errorMessage);
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

  const startEditing = (habitId: string, currentName: string, currentTarget: bigint, currentUnit: HabitUnit, currentDefaultAmount: bigint | null) => {
    setEditingHabitId(habitId);
    setEditingName(currentName);
    setEditingWeeklyTarget(String(Number(currentTarget)));
    
    // Convert HabitUnit to UI selection value
    setEditingUnit(habitUnitToSelectValue(currentUnit));

    // Set default amount (empty string if null or unit is none)
    // For Time habits, format seconds as duration
    if (currentDefaultAmount !== null && currentUnit.__kind__ !== 'none') {
      const amountNum = Number(currentDefaultAmount);
      if (isTimeUnit(currentUnit)) {
        setEditingDefaultAmount(formatDuration(amountNum));
      } else {
        setEditingDefaultAmount(String(amountNum));
      }
    } else {
      setEditingDefaultAmount('');
    }
  };

  const cancelEditing = () => {
    setEditingHabitId(null);
    setEditingName('');
    setEditingWeeklyTarget('');
    setEditingUnit('reps');
    setEditingDefaultAmount('');
  };

  const handleUpdateHabit = async (habitId: string, currentName: string, currentUnit: HabitUnit, currentDefaultAmount: bigint | null) => {
    if (!editingName.trim()) {
      toast.error('Habit name cannot be empty');
      return;
    }

    const target = parseInt(editingWeeklyTarget);
    if (isNaN(target) || target < 1 || target > 7) {
      toast.error('Weekly target must be between 1 and 7');
      return;
    }

    // Validate default amount if provided and unit is not 'none'
    let newAmountValue: number | null = null;
    if (editingUnit !== 'none' && editingDefaultAmount.trim() !== '') {
      if (editingUnit === 'time') {
        // Parse duration for Time habits
        const parsedSeconds = parseDuration(editingDefaultAmount);
        if (parsedSeconds === null || parsedSeconds < 0) {
          toast.error('Invalid duration format. Try "1 min 15 sec", "75 sec", or "1:15"');
          return;
        }
        newAmountValue = parsedSeconds;
      } else {
        // Parse as integer for non-Time habits (reps, km)
        const parsedAmount = parseInt(editingDefaultAmount);
        if (isNaN(parsedAmount) || parsedAmount < 0 || !Number.isInteger(parsedAmount)) {
          toast.error('Default amount must be a non-negative integer');
          return;
        }
        newAmountValue = parsedAmount;
      }
    }

    try {
      // Check if name changed
      const nameChanged = currentName !== editingName.trim();

      // Check if unit changed
      const currentUnitType = habitUnitToSelectValue(currentUnit);
      const unitChanged = currentUnitType !== editingUnit;

      // Check if default amount changed
      const currentAmountValue = currentDefaultAmount !== null ? Number(currentDefaultAmount) : null;
      const defaultAmountChanged = currentAmountValue !== newAmountValue;

      // Update name if changed
      if (nameChanged) {
        await updateName.mutateAsync({ habitId, newName: editingName.trim() });
      }

      // Update weekly target
      await updateWeeklyTarget.mutateAsync({ habitId, newWeeklyTarget: target });

      // Update unit if changed
      if (unitChanged) {
        const newUnit = createHabitUnit(editingUnit);
        await updateUnit.mutateAsync({ habitId, newUnit });
      }

      // Update default amount if changed or if switching to/from no-unit
      if (defaultAmountChanged || (unitChanged && (editingUnit === 'none' || currentUnitType === 'none'))) {
        // Clear default amount when switching to no-unit
        const finalAmount = editingUnit === 'none' ? null : newAmountValue;
        await updateDefaultAmount.mutateAsync({ habitId, newDefaultAmount: finalAmount });
      }

      setEditingHabitId(null);
      setEditingName('');
      setEditingWeeklyTarget('');
      setEditingUnit('reps');
      setEditingDefaultAmount('');

      const changes: string[] = [];
      if (nameChanged) {
        changes.push(`renamed to "${editingName.trim()}"`);
      }
      changes.push(`${target}x per week`);
      if (unitChanged) {
        changes.push(`unit changed to ${editingUnit === 'none' ? 'done/not-done' : editingUnit}`);
      }
      if (defaultAmountChanged && editingUnit !== 'none') {
        if (newAmountValue !== null) {
          const displayValue = editingUnit === 'time' ? formatDuration(newAmountValue) : newAmountValue;
          changes.push(`default amount set to ${displayValue}`);
        } else {
          changes.push('default amount cleared');
        }
      }

      toast.success(`Habit updated: ${changes.join(', ')}`);
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update habit';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const isUnitNone = selectedUnit === 'none';
  const isEditingUnitNone = editingUnit === 'none';
  const isUnitTime = selectedUnit === 'time';
  const isEditingUnitTime = editingUnit === 'time';

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
              <Select value={selectedUnit} onValueChange={(value) => {
                setSelectedUnit(value as 'reps' | 'time' | 'km' | 'none');
                if (value === 'none') {
                  setDefaultAmount('');
                }
              }}>
                <SelectTrigger id="unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reps">Reps</SelectItem>
                  <SelectItem value="time">Time</SelectItem>
                  <SelectItem value="km">km</SelectItem>
                  <SelectItem value="none">No unit (done/not-done)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {!isUnitNone && (
            <div className="space-y-2">
              <Label htmlFor="default-amount">Default Amount (optional)</Label>
              <Input
                id="default-amount"
                type={isUnitTime ? 'text' : 'number'}
                min={isUnitTime ? undefined : '0'}
                placeholder={isUnitTime ? 'e.g., 1 min 15 sec, 75 sec, 1:15' : 'Leave blank if not applicable'}
                value={defaultAmount}
                onChange={(e) => setDefaultAmount(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {isUnitTime ? 'Enter duration in any format (e.g., "1 min 15 sec", "75 sec", "1:15")' : 'Optional default value when marking complete'}
              </p>
            </div>
          )}
          <Button type="submit" disabled={createHabit.isPending} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Habit
          </Button>
        </form>

        {habits.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Your Habits ({habits.length})</p>
            <div className="space-y-2">
              {habits.map((habit) => {
                const habitIsNoUnit = isNoUnit(habit.unit);
                const habitIsTime = isTimeUnit(habit.unit);
                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex flex-col flex-1">
                      {editingHabitId === habit.id ? (
                        <Input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="font-medium mb-2"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium">{habit.name}</span>
                      )}
                      {editingHabitId === habit.id ? (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              max="7"
                              value={editingWeeklyTarget}
                              onChange={(e) => setEditingWeeklyTarget(e.target.value)}
                              className="h-8 w-16"
                            />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">times/week</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select value={editingUnit} onValueChange={(value) => {
                              setEditingUnit(value as 'reps' | 'time' | 'km' | 'none');
                              if (value === 'none') {
                                setEditingDefaultAmount('');
                              }
                            }}>
                              <SelectTrigger className="h-8 w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="reps">Reps</SelectItem>
                                <SelectItem value="time">Time</SelectItem>
                                <SelectItem value="km">km</SelectItem>
                                <SelectItem value="none">Done/not-done</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {!isEditingUnitNone && (
                            <div className="flex items-center gap-2">
                              <Input
                                type={isEditingUnitTime ? 'text' : 'number'}
                                min={isEditingUnitTime ? undefined : '0'}
                                placeholder={isEditingUnitTime ? 'e.g., 1:15' : 'Default'}
                                value={editingDefaultAmount}
                                onChange={(e) => setEditingDefaultAmount(e.target.value)}
                                className="h-8 w-24"
                              />
                              <span className="text-xs text-muted-foreground whitespace-nowrap">default</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Target: {Number(habit.weeklyTarget)}x per week
                          {!habitIsNoUnit && ` · Unit: ${getHabitUnitLabel(habit.unit)}`}
                          {!habitIsNoUnit && habit.defaultAmount !== null && (
                            ` · Default: ${habitIsTime ? formatDuration(Number(habit.defaultAmount)) : Number(habit.defaultAmount)}`
                          )}
                          {habitIsNoUnit && ' · Done/not-done'}
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
                            onClick={() => handleUpdateHabit(habit.id, habit.name, habit.unit, habit.defaultAmount)}
                            disabled={updateName.isPending || updateWeeklyTarget.isPending || updateUnit.isPending || updateDefaultAmount.isPending}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={cancelEditing}
                            disabled={updateName.isPending || updateWeeklyTarget.isPending || updateUnit.isPending || updateDefaultAmount.isPending}
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
                            onClick={() => startEditing(habit.id, habit.name, habit.weeklyTarget, habit.unit, habit.defaultAmount)}
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
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
