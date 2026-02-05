import { useMemo, useState, useEffect } from 'react';
import type { Habit, HabitRecord } from '../backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { calculateReportStats } from '../utils/reportStats';
import { formatDuration } from '../utils/duration';
import { isTimeUnit } from '../utils/habitUnit';

interface ProgressChartsProps {
  habits: Habit[];
  records: HabitRecord[];
  selectedMonth: number;
  selectedYear: number;
}

export function ProgressCharts({
  habits,
  records,
  selectedMonth,
  selectedYear,
}: ProgressChartsProps) {
  const [selectedHabitForVolume, setSelectedHabitForVolume] = useState<string>('');

  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const stats = useMemo(() => {
    const startDay = 1;
    const endDay = daysInMonth;

    return calculateReportStats(
      habits,
      records,
      startDay,
      selectedMonth,
      selectedYear,
      endDay,
      selectedMonth,
      selectedYear
    );
  }, [habits, records, selectedMonth, selectedYear, daysInMonth]);

  // Filter habits to only those with completions in the selected month
  const habitsWithCompletions = useMemo(() => {
    return habits.filter((habit) => {
      return records.some(
        (record) =>
          record.habitId === habit.id &&
          record.completedAt !== undefined &&
          record.completedAt !== null
      );
    });
  }, [habits, records]);

  // Calculate total volume across all habits for empty state check
  const totalVolumeAllHabits = useMemo(() => {
    return stats.volumeStats.reduce((sum, vs) => sum + vs.totalVolume, 0);
  }, [stats.volumeStats]);

  // Auto-select first habit with completions, or clear if none available
  useEffect(() => {
    if (habitsWithCompletions.length > 0) {
      // If current selection is not in the filtered list, select the first one
      const isCurrentSelectionValid = habitsWithCompletions.some(
        (h) => h.id === selectedHabitForVolume
      );
      if (!isCurrentSelectionValid) {
        setSelectedHabitForVolume(habitsWithCompletions[0].id);
      }
    } else {
      // No habits with completions, clear selection
      setSelectedHabitForVolume('');
    }
  }, [habitsWithCompletions, selectedHabitForVolume]);

  const selectedVolumeStats = stats.volumeStats.find(
    (vs) => vs.habitId === selectedHabitForVolume
  );

  // Check if selected habit is a Time habit
  const selectedHabit = habits.find((h) => h.id === selectedHabitForVolume);
  const isTimeHabit = selectedHabit ? isTimeUnit(selectedHabit.unit) : false;

  const pieData = [
    { name: 'Completed', value: stats.overallPercentage },
    { name: 'Remaining', value: 100 - stats.overallPercentage },
  ];

  const COLORS = ['oklch(var(--chart-1))', 'oklch(var(--muted))'];

  const weeksInMonth = Math.ceil(daysInMonth / 7);

  return (
    <div className="space-y-6">
      {/* Overall Progress Circle */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Progress</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.overallPercentage}%</div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4 text-center">
            Based on weekly targets over {weeksInMonth} weeks
          </p>
        </CardContent>
      </Card>

      {/* Per-Habit Progress Bars */}
      {habits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Habit Progress (Frequency)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.habitStats.map((stat) => (
              <div key={stat.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{stat.name}</span>
                  <span className="text-muted-foreground">
                    {stat.completed}/{stat.expected} ({stat.percentage}%)
                  </span>
                </div>
                <Progress value={stat.percentage} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Target: {stat.weeklyTarget}x per week
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Daily Progress Line Chart */}
      {habits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Trends (Frequency)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                percentage: {
                  label: 'Completion %',
                  color: 'oklch(var(--chart-1))',
                },
              }}
              className="h-48"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.dailyStats}>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="percentage"
                    stroke="oklch(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: 'oklch(var(--chart-1))', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Volume Tracking */}
      <Card>
        <CardHeader>
          <CardTitle>Volume Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {totalVolumeAllHabits === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No volume recorded this month
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="habit-select">Select Habit</Label>
                <Select value={selectedHabitForVolume} onValueChange={setSelectedHabitForVolume}>
                  <SelectTrigger id="habit-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {habitsWithCompletions.map((habit) => (
                      <SelectItem key={habit.id} value={habit.id}>
                        {habit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedVolumeStats && (
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {isTimeHabit ? formatDuration(selectedVolumeStats.totalVolume) : selectedVolumeStats.totalVolume}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total {selectedVolumeStats.unit} this month
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
