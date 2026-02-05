import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGetHabits, useGetMonthlyTargets, useUpdateMonthlyTarget } from '../hooks/useQueries';
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
  'push-ups': [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
  'squats': [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75],
  'plank': [60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 240], // in seconds
};

function getAutoPlanDefault(habitName: string, month: number): number | null {
  const normalizedName = habitName.toLowerCase().trim();
  const plan = AUTO_PLAN_DEFAULTS[normalizedName];
  if (plan && month >= 1 && month <= 12) {
    return plan[month - 1];
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
  const updateMonthlyTarget = useUpdateMonthlyTarget();

  // Generate year options (current year ± 2)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - 2 + i);

  const startEditing = (habit: Habit) => {
    setEditingHabitId(habit.id);
    
    // Fetch existing targets for this habit
    const existingTargets = habit.id ? [] : []; // We'll use the query below
    
    // Check if there's a manual override for this month/year
    const targetKey = `${habit.id}_${selectedMonth}_${selectedYear}`;
    
    // For now, we'll compute the default or show blank
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
    // Check for auto-plan default
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

        {habits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No habits yet. Create a habit to set monthly targets.
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium">
              Targets for {MONTHS[selectedMonth - 1]} {selectedYear}
            </p>
            <div className="space-y-2">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="flex-1">
                    <span className="font-medium">{habit.name}</span>
                    {editingHabitId !== habit.id && (
                      <span className="text-sm text-muted-foreground ml-2">
                        Target: {getDisplayTarget(habit)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {editingHabitId === habit.id ? (
                      <>
                        <Input
                          type={isTimeUnit(habit.unit) ? 'text' : 'number'}
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder={isTimeUnit(habit.unit) ? 'e.g., 1:15' : 'e.g., 20'}
                          className="h-8 w-32"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSave(habit)}
                          disabled={updateMonthlyTarget.isPending}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={cancelEditing}
                          disabled={updateMonthlyTarget.isPending}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => startEditing(habit)}>
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
