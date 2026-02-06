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
          day,
          month: selectedMonth,
          year: selectedYear,
          amount: null,
        });
      } else {
        // Toggling on: mark as done without amount
        await toggleCompletion.mutateAsync({
          habitId,
          day,
          month: selectedMonth,
          year: selectedYear,
          amount: null,
        });
      }
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    }
  };

  const handleAmountSave = async (habitId: string, day: number, isTime: boolean) => {
    const trimmedInput = editAmount.trim();
    let amount: number | null = null;

    if (trimmedInput !== '') {
      if (isTime) {
        // Parse duration for Time habits
        const parsedSeconds = parseDuration(trimmedInput);
        if (parsedSeconds === null || parsedSeconds < 0) {
          toast.error('Invalid duration format. Try "1 min 15 sec", "75 sec", or "1:15"');
          return;
        }
        amount = parsedSeconds;
      } else {
        // Parse as integer for non-Time habits (reps, km)
        const parsedAmount = parseInt(trimmedInput);
        if (isNaN(parsedAmount) || parsedAmount < 0) {
          toast.error('Amount must be a non-negative number');
          return;
        }
        amount = parsedAmount;
      }
    }

    try {
      await toggleCompletion.mutateAsync({
        habitId,
        day,
        month: selectedMonth,
        year: selectedYear,
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
      // Format Time amounts as duration, others as plain number
      setEditAmount(isTime ? formatDuration(currentAmount) : String(currentAmount));
    } else {
      setEditAmount('');
    }
  };

  // Show loading only for month switching, not for background refetches
  if (isLoading && habits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (habits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Habits Yet</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Add your first habit above to start tracking!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full" ref={scrollViewportRef}>
          <div className="min-w-max">
            <div className="grid gap-2" style={{ gridTemplateColumns: `200px repeat(${daysInMonth}, 40px)` }}>
              {/* Header Row */}
              <div className="font-semibold text-sm sticky left-0 bg-card z-10 p-2">Habit</div>
              {days.map((day) => (
                <div key={day} className="text-center text-sm font-medium p-2">
                  {day}
                </div>
              ))}

              {/* Habit Rows */}
              {habits.map((habit) => {
                const habitHasNoUnit = isNoUnit(habit.unit);
                const habitIsTime = isTimeUnit(habit.unit);
                
                return (
                  <div key={habit.id} style={{ display: 'contents' }}>
                    <div
                      className="font-medium text-sm sticky left-0 bg-card z-10 p-2 border-r flex flex-col justify-center"
                    >
                      <div>{habit.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {Number(habit.weeklyTarget)}x/week
                        {!habitHasNoUnit && ` · ${getHabitUnitShortLabel(habit.unit)}`}
                      </div>
                    </div>
                    {days.map((day) => {
                      const key = `${habit.id}-${day}-${selectedMonth}-${selectedYear}`;
                      const recordData = recordMap.get(key);
                      const isCompleted = recordData?.isCompleted || false;
                      const amount = recordData?.amount;
                      const recordUnit = recordData?.unit || habit.unit;
                      const recordHasNoUnit = isNoUnit(recordUnit);
                      const recordIsTime = isTimeUnit(recordUnit);
                      const isEditing = editingCell === key;

                      return (
                        <div
                          key={`${habit.id}-${day}`}
                          className="flex items-center justify-center p-2 border-l border-b hover:bg-accent/5 transition-colors"
                        >
                          {isCompleted ? (
                            recordHasNoUnit ? (
                              // No-unit habit: just show checkbox, no popover
                              <Checkbox
                                checked={true}
                                onCheckedChange={() => handleToggle(habit.id, day, true)}
                                className="h-5 w-5"
                              />
                            ) : (
                              // Has unit: show popover for amount editing
                              <Popover open={isEditing} onOpenChange={(open) => {
                                if (!open) {
                                  setEditingCell(null);
                                  setEditAmount('');
                                }
                              }}>
                                <PopoverTrigger asChild>
                                  <button
                                    className="flex flex-col items-center gap-0.5 cursor-pointer"
                                    onClick={() => openAmountEditor(habit.id, day, amount, recordIsTime)}
                                  >
                                    <Checkbox
                                      checked={true}
                                      onCheckedChange={() => handleToggle(habit.id, day, true)}
                                      className="h-5 w-5"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    {amount !== undefined && (
                                      <span className="text-[10px] text-muted-foreground font-medium">
                                        {recordIsTime ? formatDuration(amount) : amount}
                                      </span>
                                    )}
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48" align="center">
                                  <div className="space-y-3">
                                    <div className="space-y-2">
                                      <Label htmlFor={`amount-${key}`} className="text-xs">
                                        {recordIsTime ? 'Duration' : `Amount (${getHabitUnitShortLabel(recordUnit)})`}
                                      </Label>
                                      <Input
                                        id={`amount-${key}`}
                                        type="text"
                                        placeholder={recordIsTime ? 'e.g., 1:15' : 'Optional'}
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        className="h-8"
                                        autoFocus
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            handleAmountSave(habit.id, day, recordIsTime);
                                          }
                                        }}
                                      />
                                      {recordIsTime && (
                                        <p className="text-[10px] text-muted-foreground">
                                          e.g., "1 min 15 sec", "75 sec", "1:15"
                                        </p>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      className="w-full"
                                      onClick={() => handleAmountSave(habit.id, day, recordIsTime)}
                                    >
                                      Save
                                    </Button>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            )
                          ) : (
                            <Checkbox
                              checked={false}
                              onCheckedChange={() => handleToggle(habit.id, day, false)}
                              className="h-5 w-5"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
