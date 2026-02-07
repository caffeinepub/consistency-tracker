import { useMemo, useState, useEffect, useRef } from 'react';
import type { Habit, HabitRecord, HabitUnit } from '../backend';
import { useToggleHabitCompletion } from '../hooks/useQueries';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { getHabitUnitShortLabel, isNoUnit, isTimeUnit } from '../utils/habitUnit';
import { parseDuration, formatDuration } from '../utils/duration';
import { toast } from 'sonner';
import { usePreserveHorizontalScroll } from '../hooks/usePreserveHorizontalScroll';

interface HabitGridProps {
  habits: Habit[];
  records: HabitRecord[];
  selectedMonth: number;
  selectedYear: number;
  isLoading: boolean;
}

interface RecordData {
  isCompleted: boolean;
  amount?: number;
  unit: HabitUnit;
}

export function HabitGrid({
  habits,
  records,
  selectedMonth,
  selectedYear,
  isLoading,
}: HabitGridProps) {
  const toggleCompletion = useToggleHabitCompletion();
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const { setScrollElement, restoreScrollPosition } = usePreserveHorizontalScroll();
  const scrollViewportRef = useRef<HTMLDivElement | null>(null);

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Filter records to only include those matching the selected month/year
  const filteredRecords = useMemo(() => {
    return records.filter(
      (record) =>
        Number(record.month) === selectedMonth && Number(record.year) === selectedYear
    );
  }, [records, selectedMonth, selectedYear]);

  // Build record map with month/year-scoped keys
  const recordMap = useMemo(() => {
    const map = new Map<string, RecordData>();
    filteredRecords.forEach((record) => {
      const key = `${record.habitId}-${record.day}-${record.month}-${record.year}`;
      map.set(key, {
        isCompleted: !!record.completedAt,
        amount: record.amount ? Number(record.amount) : undefined,
        unit: record.unit,
      });
    });
    return map;
  }, [filteredRecords]);

  // Restore scroll position after data updates
  useEffect(() => {
    restoreScrollPosition();
  }, [recordMap, restoreScrollPosition]);

  // Attach scroll element ref to the ScrollArea viewport
  useEffect(() => {
    if (scrollViewportRef.current) {
      const viewport = scrollViewportRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (viewport) {
        setScrollElement(viewport);
      }
    }
  }, [setScrollElement]);

  const handleToggle = async (habitId: string, day: number, currentlyCompleted: boolean) => {
    try {
      if (currentlyCompleted) {
        // Toggling off: clear amount
        await toggleCompletion.mutateAsync({
          habitId,
          day: BigInt(day),
          month: BigInt(selectedMonth),
          year: BigInt(selectedYear),
          amount: null,
        });
      } else {
        // Toggling on: mark as done without amount
        await toggleCompletion.mutateAsync({
          habitId,
          day: BigInt(day),
          month: BigInt(selectedMonth),
          year: BigInt(selectedYear),
          amount: null,
        });
      }
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    }
  };

  const handleAmountSave = async (habitId: string, day: number, isTime: boolean) => {
    const trimmedInput = editAmount.trim();
    let amount: bigint | null = null;

    if (trimmedInput !== '') {
      if (isTime) {
        // Parse duration for Time habits
        const parsedSeconds = parseDuration(trimmedInput);
        if (parsedSeconds === null || parsedSeconds < 0) {
          toast.error('Invalid duration format. Try "1 min 15 sec", "75 sec", or "1:15"');
          return;
        }
        amount = BigInt(parsedSeconds);
      } else {
        // Parse as integer for non-Time habits (reps, km)
        const parsedAmount = parseInt(trimmedInput);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
          toast.error('Amount must be a non-negative number');
          return;
        }
        amount = BigInt(parsedAmount);
      }
    }

    try {
      await toggleCompletion.mutateAsync({
        habitId,
        day: BigInt(day),
        month: BigInt(selectedMonth),
        year: BigInt(selectedYear),
        amount,
      });
      setEditingCell(null);
      setEditAmount('');
    } catch (error) {
      console.error('Failed to save amount:', error);
      toast.error('Failed to save amount');
    }
  };

  const openAmountEditor = (habitId: string, day: number, currentAmount?: number, isTime?: boolean) => {
    const key = `${habitId}-${day}-${selectedMonth}-${selectedYear}`;
    setEditingCell(key);
    if (currentAmount !== undefined) {
      if (isTime) {
        setEditAmount(formatDuration(currentAmount));
      } else {
        setEditAmount(currentAmount.toString());
      }
    } else {
      setEditAmount('');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
            <p className="text-muted-foreground">Loading habits...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (habits.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No habits yet. Create your first habit to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="habit-grid-card">
      <CardHeader>
        <CardTitle>Daily Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto" ref={scrollViewportRef}>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 bg-card border-b border-r p-2 text-left font-medium min-w-[120px]">
                  Habit
                </th>
                {days.map((day) => (
                  <th key={day} className="border-b p-2 text-center font-medium min-w-[40px]">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => {
                const habitIsTime = isTimeUnit(habit.unit);
                const habitIsNoUnit = isNoUnit(habit.unit);
                const unitLabel = getHabitUnitShortLabel(habit.unit);

                return (
                  <tr key={habit.id} data-habit-id={habit.id}>
                    <td className="sticky left-0 z-10 bg-card border-b border-r p-2 font-medium min-w-[120px]">
                      <div className="flex flex-col">
                        <span className="text-sm">{habit.name}</span>
                        {unitLabel && (
                          <span className="text-xs text-muted-foreground">{unitLabel}</span>
                        )}
                      </div>
                    </td>
                    {days.map((day) => {
                      const key = `${habit.id}-${day}-${selectedMonth}-${selectedYear}`;
                      const recordData = recordMap.get(key);
                      const isCompleted = recordData?.isCompleted ?? false;
                      const amount = recordData?.amount;

                      return (
                        <td key={day} className="border-b p-2 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() => handleToggle(habit.id, day, isCompleted)}
                              disabled={toggleCompletion.isPending}
                            />
                            {isCompleted && !habitIsNoUnit && (
                              <Popover
                                open={editingCell === key}
                                onOpenChange={(open) => {
                                  if (!open) {
                                    setEditingCell(null);
                                    setEditAmount('');
                                  }
                                }}
                              >
                                <PopoverTrigger asChild>
                                  <button
                                    className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                                    onClick={() => openAmountEditor(habit.id, day, amount, habitIsTime)}
                                  >
                                    {amount !== undefined
                                      ? habitIsTime
                                        ? formatDuration(amount)
                                        : amount.toString()
                                      : '+'}
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-64">
                                  <div className="space-y-3">
                                    <Label htmlFor={`amount-${key}`}>
                                      {habitIsTime ? 'Duration' : 'Amount'}
                                    </Label>
                                    <Input
                                      id={`amount-${key}`}
                                      value={editAmount}
                                      onChange={(e) => setEditAmount(e.target.value)}
                                      placeholder={
                                        habitIsTime
                                          ? 'e.g., 1 min 15 sec'
                                          : 'Enter amount'
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          handleAmountSave(habit.id, day, habitIsTime);
                                        }
                                      }}
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleAmountSave(habit.id, day, habitIsTime)}
                                        disabled={toggleCompletion.isPending}
                                      >
                                        Save
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setEditingCell(null);
                                          setEditAmount('');
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
