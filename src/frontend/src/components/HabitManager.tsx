import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Habit, HabitUnit } from '../backend';
import { useCreateHabit, useDeleteHabit, useUpdateHabitName, useUpdateHabitWeeklyTarget, useUpdateHabitUnit, useUpdateHabitDefaultAmount } from '../hooks/useQueries';
import { createHabitUnit, getHabitUnitLabel, isTimeUnit } from '../utils/habitUnit';
import { parseDuration, formatDuration } from '../utils/duration';

interface HabitManagerProps {
  habits: Habit[];
}

type UnitSelection = 'none' | 'reps' | 'time' | 'km';

export function HabitManager({ habits }: HabitManagerProps) {
  const [newHabitName, setNewHabitName] = useState('');
  const [weeklyTarget, setWeeklyTarget] = useState('7');
  const [selectedUnit, setSelectedUnit] = useState<UnitSelection>('none');
  const [defaultAmount, setDefaultAmount] = useState('');
  const [habitToDelete, setHabitToDelete] = useState<string | null>(null);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingTarget, setEditingTarget] = useState('');
  const [editingUnit, setEditingUnit] = useState<UnitSelection>('none');
  const [editingDefaultAmount, setEditingDefaultAmount] = useState('');

  const createHabit = useCreateHabit();
  const deleteHabit = useDeleteHabit();
  const updateName = useUpdateHabitName();
  const updateWeeklyTarget = useUpdateHabitWeeklyTarget();
  const updateUnit = useUpdateHabitUnit();
  const updateDefaultAmount = useUpdateHabitDefaultAmount();

  const handleCreateHabit = async () => {
    if (!newHabitName.trim()) {
      toast.error('Please enter a habit name');
      return;
    }

    const target = parseInt(weeklyTarget);
    if (isNaN(target) || target < 1 || target > 7) {
      toast.error('Weekly target must be between 1 and 7');
      return;
    }

    const unit = createHabitUnit(selectedUnit);

    let amountValue: bigint | null = null;
    if (defaultAmount.trim() !== '') {
      if (selectedUnit === 'time') {
        const parsedSeconds = parseDuration(defaultAmount.trim());
        if (parsedSeconds === null || parsedSeconds < 0) {
          toast.error('Invalid duration format. Try "1 min 15 sec", "75 sec", or "1:15"');
          return;
        }
        amountValue = BigInt(parsedSeconds);
      } else if (selectedUnit !== 'none') {
        const parsedAmount = parseInt(defaultAmount.trim());
        if (isNaN(parsedAmount) || parsedAmount < 0) {
          toast.error('Default amount must be a non-negative number');
          return;
        }
        amountValue = BigInt(parsedAmount);
      }
    }

    try {
      await createHabit.mutateAsync({ name: newHabitName.trim(), weeklyTarget: BigInt(target), unit, defaultAmount: amountValue });
      setNewHabitName('');
      setWeeklyTarget('7');
      setSelectedUnit('none');
      setDefaultAmount('');
      toast.success('Habit created successfully');
    } catch (error) {
      console.error('Failed to create habit:', error);
      toast.error('Failed to create habit');
    }
  };

  const handleDeleteHabit = async () => {
    if (!habitToDelete) return;

    try {
      await deleteHabit.mutateAsync(habitToDelete);
      setHabitToDelete(null);
      toast.success('Habit deleted successfully');
    } catch (error) {
      console.error('Failed to delete habit:', error);
      toast.error('Failed to delete habit');
    }
  };

  const startEditing = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setEditingName(habit.name);
    setEditingTarget(habit.weeklyTarget.toString());
    
    // Determine unit selection
    if (habit.unit.__kind__ === 'none') {
      setEditingUnit('none');
    } else if (habit.unit.__kind__ === 'reps') {
      setEditingUnit('reps');
    } else if (habit.unit.__kind__ === 'time') {
      setEditingUnit('time');
    } else if (habit.unit.__kind__ === 'custom' && habit.unit.custom === 'km') {
      setEditingUnit('km');
    } else {
      setEditingUnit('none');
    }

    // Set default amount
    if (habit.defaultAmount !== null) {
      if (isTimeUnit(habit.unit)) {
        setEditingDefaultAmount(formatDuration(Number(habit.defaultAmount)));
      } else {
        setEditingDefaultAmount(habit.defaultAmount.toString());
      }
    } else {
      setEditingDefaultAmount('');
    }
  };

  const cancelEditing = () => {
    setEditingHabitId(null);
    setEditingName('');
    setEditingTarget('');
    setEditingUnit('none');
    setEditingDefaultAmount('');
  };

  const saveEditing = async (habitId: string) => {
    try {
      // Update name if changed
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      if (editingName.trim() !== habit.name) {
        await updateName.mutateAsync({ habitId, newName: editingName.trim() });
      }

      // Update weekly target if changed
      const target = parseInt(editingTarget);
      if (!isNaN(target) && target >= 1 && target <= 7 && BigInt(target) !== habit.weeklyTarget) {
        await updateWeeklyTarget.mutateAsync({ habitId, newWeeklyTarget: BigInt(target) });
      }

      // Update unit if changed
      const newUnit = createHabitUnit(editingUnit);
      const currentUnitKind = habit.unit.__kind__;
      const newUnitKind = newUnit.__kind__;
      
      let unitsMatch = currentUnitKind === newUnitKind;
      if (unitsMatch && currentUnitKind === 'custom' && newUnitKind === 'custom') {
        // Both are custom, check the custom value
        unitsMatch = habit.unit.custom === newUnit.custom;
      }
      
      if (!unitsMatch) {
        await updateUnit.mutateAsync({ habitId, newUnit });
      }

      // Update default amount if changed
      if (editingDefaultAmount.trim() !== '') {
        let finalAmount: bigint | null = null;
        if (editingUnit === 'time') {
          const parsedSeconds = parseDuration(editingDefaultAmount.trim());
          if (parsedSeconds !== null && parsedSeconds >= 0) {
            finalAmount = BigInt(parsedSeconds);
          }
        } else if (editingUnit !== 'none') {
          const parsedAmount = parseInt(editingDefaultAmount.trim());
          if (!isNaN(parsedAmount) && parsedAmount >= 0) {
            finalAmount = BigInt(parsedAmount);
          }
        }
        
        if (finalAmount !== habit.defaultAmount) {
          await updateDefaultAmount.mutateAsync({ habitId, newDefaultAmount: finalAmount });
        }
      } else if (habit.defaultAmount !== null) {
        // Clear default amount if now empty
        await updateDefaultAmount.mutateAsync({ habitId, newDefaultAmount: null });
      }

      cancelEditing();
      toast.success('Habit updated successfully');
    } catch (error) {
      console.error('Failed to update habit:', error);
      toast.error('Failed to update habit');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Habits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Create New Habit Form */}
        <div className="space-y-4 p-4 border rounded-lg">
          <h3 className="font-medium">Add New Habit</h3>
          
          <div className="space-y-2">
            <Label htmlFor="habit-name">Habit Name</Label>
            <Input
              id="habit-name"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="e.g., Morning Run"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weekly-target">Weekly Target (1-7 days)</Label>
            <Input
              id="weekly-target"
              type="number"
              min="1"
              max="7"
              value={weeklyTarget}
              onChange={(e) => setWeeklyTarget(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select value={selectedUnit} onValueChange={(value) => setSelectedUnit(value as UnitSelection)}>
              <SelectTrigger id="unit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Done/Not Done)</SelectItem>
                <SelectItem value="reps">Reps</SelectItem>
                <SelectItem value="time">Time</SelectItem>
                <SelectItem value="km">Kilometers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedUnit !== 'none' && (
            <div className="space-y-2">
              <Label htmlFor="default-amount">
                Default Amount (optional)
                {selectedUnit === 'time' && <span className="text-xs text-muted-foreground ml-2">e.g., "1 min 30 sec"</span>}
              </Label>
              <Input
                id="default-amount"
                value={defaultAmount}
                onChange={(e) => setDefaultAmount(e.target.value)}
                placeholder={selectedUnit === 'time' ? 'e.g., 1 min 30 sec' : 'Enter amount'}
              />
            </div>
          )}

          <Button onClick={handleCreateHabit} disabled={createHabit.isPending} className="w-full">
            {createHabit.isPending ? 'Creating...' : 'Create Habit'}
          </Button>
        </div>

        {/* Existing Habits List */}
        {habits.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Your Habits</h3>
            <div className="space-y-2">
              {habits.map((habit) => (
                <div key={habit.id} className="flex items-center gap-2 p-3 border rounded-lg">
                  {editingHabitId === habit.id ? (
                    <div className="flex-1 space-y-3">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="Habit name"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Weekly Target</Label>
                          <Input
                            type="number"
                            min="1"
                            max="7"
                            value={editingTarget}
                            onChange={(e) => setEditingTarget(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Unit</Label>
                          <Select value={editingUnit} onValueChange={(value) => setEditingUnit(value as UnitSelection)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">None</SelectItem>
                              <SelectItem value="reps">Reps</SelectItem>
                              <SelectItem value="time">Time</SelectItem>
                              <SelectItem value="km">Kilometers</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {editingUnit !== 'none' && (
                        <div>
                          <Label className="text-xs">Default Amount</Label>
                          <Input
                            value={editingDefaultAmount}
                            onChange={(e) => setEditingDefaultAmount(e.target.value)}
                            placeholder={editingUnit === 'time' ? 'e.g., 1 min 30 sec' : 'Enter amount'}
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => saveEditing(habit.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditing}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="font-medium">{habit.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {habit.weeklyTarget.toString()}× per week • {getHabitUnitLabel(habit.unit)}
                          {habit.defaultAmount !== null && (
                            <span>
                              {' '}• Default: {isTimeUnit(habit.unit) ? formatDuration(Number(habit.defaultAmount)) : habit.defaultAmount.toString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditing(habit)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setHabitToDelete(habit.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!habitToDelete} onOpenChange={(open) => !open && setHabitToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Habit</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this habit? This action cannot be undone and will remove all associated records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteHabit}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
