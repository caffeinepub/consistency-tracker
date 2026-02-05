import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetHabits, useGetMultipleMonthlyTargets, useUpdateMonthlyTarget } from '../hooks/useQueries';
import { isTimeUnit } from '../utils/habitUnit';
import { parseDuration, formatDuration } from '../utils/duration';
import { toast } from 'sonner';
import type { Habit } from '../backend';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

// Auto-plan defaults based on "The Steady Climb" plan
const AUTO_PLAN_DEFAULTS: Record<string, number[]> = {
  'press-ups': [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
  'push-ups': [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
  'squats': [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
  'plank': [60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 240], // in seconds
};

// Habits that should not show targets
const NON_APPLICABLE_HABITS = ['16/8 fasting', 'run', 'squash'];

function normalizeHabitName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function isHabitApplicable(habitName: string): boolean {
  const normalized = normalizeHabitName(habitName);
  return !NON_APPLICABLE_HABITS.some((na) => normalizeHabitName(na) === normalized);
}

function getAutoPlanDefault(habitName: string, month: number): number | null {
  const normalized = normalizeHabitName(habitName);
  
  // Check all plan keys for a match
  for (const [planKey, values] of Object.entries(AUTO_PLAN_DEFAULTS)) {
    if (normalizeHabitName(planKey) === normalized) {
      if (month >= 1 && month <= 12) {
        return values[month - 1];
      }
    }
  }
  
  return null;
}

export function MonthlyTargetsEditor() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const { data: habits = [] } = useGetHabits();
  const habitIds = habits.map((h) => h.id);
  const { targetsMap, isLoading: targetsLoading } = useGetMultipleMonthlyTargets(habitIds);
  const updateMonthlyTarget = useUpdateMonthlyTarget();

  // Generate year options (current year ± 2)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);

  const getPersistedTarget = (habitId: string): number | null => {
    const key = `${habitId}_${selectedMonth}_${selectedYear}`;
    const target = targetsMap.get(key);
    return target ? Number(target.amount) : null;
  };

  const startEditing = (habit: Habit) => {
    setEditingHabitId(habit.id);
    
    // Check for persisted override first
    const persisted = getPersistedTarget(habit.id);
    
    if (persisted !== null) {
      // Use persisted value
      if (isTimeUnit(habit.unit)) {
        setEditValue(formatDuration(persisted));
      } else {
        setEditValue(String(persisted));
      }
    } else {
      // Fall back to auto-plan default
      const autoPlan = getAutoPlanDefault(habit.name, selectedMonth);
      
      if (autoPlan !== null) {
        if (isTimeUnit(habit.unit)) {
          setEditValue(formatDuration(autoPlan));
        } else {
          setEditValue(String(autoPlan));
        }
      } else {
        setEditValue('');
      }
    }
  };

  const cancelEditing = () => {
    setEditingHabitId(null);
    setEditValue('');
  };

  const handleSave = async (habit: Habit) => {
    if (!editValue.trim()) {
      toast.error('Please enter a target value');
      return;
    }

    let amountValue: number;

    if (isTimeUnit(habit.unit)) {
      const parsed = parseDuration(editValue);
      if (parsed === null || parsed < 0) {
        toast.error('Invalid duration format. Try "1 min 15 sec", "75 sec", or "1:15"');
        return;
      }
      amountValue = parsed;
    } else {
      const parsed = parseInt(editValue);
      if (isNaN(parsed) || parsed < 0) {
        toast.error('Target must be a non-negative number');
        return;
      }
      amountValue = parsed;
    }

    try {
      await updateMonthlyTarget.mutateAsync({
        habitId: habit.id,
        amount: amountValue,
        month: selectedMonth,
        year: selectedYear,
      });
      toast.success(`Monthly target updated for ${habit.name}`);
      setEditingHabitId(null);
      setEditValue('');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to update monthly target';
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const getDisplayTarget = (habit: Habit): string => {
    // Check for persisted override first
    const persisted = getPersistedTarget(habit.id);
    
    if (persisted !== null) {
      if (isTimeUnit(habit.unit)) {
        return formatDuration(persisted);
      } else {
        return String(persisted);
      }
    }
    
    // Fall back to auto-plan default
    const autoPlan = getAutoPlanDefault(habit.name, selectedMonth);
    
    if (autoPlan !== null) {
      if (isTimeUnit(habit.unit)) {
        return formatDuration(autoPlan);
      } else {
        return String(autoPlan);
      }
    }
    
    return '—';
  };

  // Filter habits to only show applicable ones
  const applicableHabits = habits.filter((h) => isHabitApplicable(h.name));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Targets</CardTitle>
        <CardDescription>
          Set or adjust monthly targets for each habit. Defaults are based on "The Steady Climb" plan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="target-month">Month</Label>
            <Select
              value={String(selectedMonth)}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger id="target-month">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((month, index) => (
                  <SelectItem key={index + 1} value={String(index + 1)}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-year">Year</Label>
            <Select
              value={String(selectedYear)}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger id="target-year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {applicableHabits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No habits with targets. Create a habit to set monthly targets.
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              Targets for {MONTHS[selectedMonth - 1]} {selectedYear}
            </p>
            <div className="space-y-2">
              {applicableHabits.map((habit) => (
                <div
                  key={habit.id}
                  className="grid grid-cols-[1fr_auto] sm:grid-cols-[minmax(0,1fr)_auto_auto] gap-2 items-center p-3 rounded-lg border bg-card min-h-[3.5rem]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                    <span className="font-medium truncate">{habit.name}</span>
                    {editingHabitId !== habit.id && (
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Target: {getDisplayTarget(habit)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 col-span-2 sm:col-span-1 justify-end">
                    {editingHabitId === habit.id ? (
                      <>
                        <Input
                          type={isTimeUnit(habit.unit) ? 'text' : 'number'}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder={isTimeUnit(habit.unit) ? 'e.g., 1:15' : 'e.g., 20'}
                          className="h-9 w-28 sm:w-32"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSave(habit)}
                          disabled={updateMonthlyTarget.isPending}
                          className="h-9 px-3"
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                          disabled={updateMonthlyTarget.isPending}
                          className="h-9 px-3"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => startEditing(habit)}
                        className="h-9 px-4"
                      >
                        Edit
                      </Button>
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
