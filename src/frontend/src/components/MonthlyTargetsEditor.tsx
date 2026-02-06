import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { isTimeUnit } from '../utils/habitUnit';
import { formatDuration } from '../utils/duration';
import type { Habit, HabitRecord } from '../backend';

// Habits that should not show targets (non-applicable)
const NON_APPLICABLE_HABITS = ['16/8 fasting', 'run', 'squash'];

// Applicable habits that should show summed monthly totals
const APPLICABLE_HABITS = ['press-ups', 'push-ups', 'squats', 'plank'];

function normalizeHabitName(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function isHabitApplicable(habitName: string): boolean {
  const normalized = normalizeHabitName(habitName);
  
  // Check if it's in the non-applicable list
  if (NON_APPLICABLE_HABITS.some((na) => normalizeHabitName(na) === normalized)) {
    return false;
  }
  
  // Check if it's in the applicable list
  return APPLICABLE_HABITS.some((ah) => normalizeHabitName(ah) === normalized);
}

interface MonthlyTargetsEditorProps {
  selectedMonth: number;
  selectedYear: number;
  habits: Habit[];
  records: HabitRecord[];
}

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

export function MonthlyTargetsEditor({ 
  selectedMonth, 
  selectedYear, 
  habits, 
  records 
}: MonthlyTargetsEditorProps) {
  // Filter habits to only show applicable ones
  const applicableHabits = habits.filter((h) => isHabitApplicable(h.name));

  // Compute the monthly sum for a given habit from the records
  const computeMonthlySum = (habitId: string, habitUnit: Habit['unit']): number => {
    const habitRecords = records.filter(
      (r) => r.habitId === habitId && Number(r.month) === selectedMonth && Number(r.year) === selectedYear
    );

    let sum = 0;
    for (const record of habitRecords) {
      // Treat missing amount as 0
      const amount = record.amount !== undefined && record.amount !== null ? Number(record.amount) : 0;
      sum += amount;
    }

    return sum;
  };

  const getDisplayTarget = (habit: Habit): string => {
    const sum = computeMonthlySum(habit.id, habit.unit);
    
    if (isTimeUnit(habit.unit)) {
      return formatDuration(sum);
    } else {
      return String(sum);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Targets</CardTitle>
        <CardDescription>
          Showing totals for {MONTHS[selectedMonth - 1]} {selectedYear} based on completed daily entries.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {applicableHabits.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No applicable habits with targets. Create a habit (Press-ups, Squats, or Plank) to see monthly totals.
          </div>
        ) : (
          <div className="space-y-2">
            {applicableHabits.map((habit) => (
              <div
                key={habit.id}
                className="grid grid-cols-[1fr_auto] gap-2 items-center p-3 rounded-lg border bg-card min-h-[3.5rem]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                  <span className="font-medium truncate">{habit.name}</span>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    Total: {getDisplayTarget(habit)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
