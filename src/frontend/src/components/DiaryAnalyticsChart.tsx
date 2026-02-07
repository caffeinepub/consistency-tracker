import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { Habit } from '../backend';
import { useGetMonthlyRecords } from '../hooks/useQueries';
import { calculateDailyConsistency } from '../utils/diaryAnalytics';
import { parseYYYYMMDD } from '../utils/diaryDates';

interface DiaryAnalyticsChartProps {
  habits: Habit[];
  diaryEntries: Array<[string, { title: string; content: string }]>;
}

export function DiaryAnalyticsChart({ habits, diaryEntries }: DiaryAnalyticsChartProps) {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  const { data: records = [] } = useGetMonthlyRecords(currentMonth, currentYear);

  const chartData = useMemo(() => {
    if (diaryEntries.length === 0 || habits.length === 0) {
      return [];
    }

    // Parse diary entries to extract energy levels and dates
    const energyByDate = new Map<string, number>();
    diaryEntries.forEach(([dateKey, entry]) => {
      const energyMatch = entry.title.match(/Energy:\s*(\d+)/);
      if (energyMatch) {
        energyByDate.set(dateKey, parseInt(energyMatch[1], 10));
      }
    });

    // Calculate daily consistency from habit records
    const consistencyByDate = calculateDailyConsistency(habits, records);

    // Combine data for dates where both energy and consistency exist
    const combined: Array<{ date: string; energy: number; consistency: number; day: number }> = [];
    energyByDate.forEach((energy, dateKey) => {
      const consistency = consistencyByDate.get(dateKey);
      if (consistency !== undefined) {
        const parsedDate = parseYYYYMMDD(dateKey);
        if (parsedDate) {
          combined.push({
            date: dateKey,
            energy,
            consistency,
            day: parsedDate.getDate(),
          });
        }
      }
    });

    // Sort by date
    combined.sort((a, b) => a.date.localeCompare(b.date));

    return combined;
  }, [diaryEntries, habits, records]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Energy vs Habit Consistency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Add a few diary entries to see trends
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy vs Habit Consistency</CardTitle>
        <p className="text-sm text-muted-foreground">
          Track how your energy levels correlate with habit completion
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            energy: {
              label: 'Energy Level',
              color: 'oklch(var(--chart-1))',
            },
            consistency: {
              label: 'Habit Consistency %',
              color: 'oklch(var(--chart-2))',
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" />
              <XAxis
                dataKey="day"
                stroke="oklch(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                yAxisId="left"
                stroke="oklch(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 5]}
                label={{ value: 'Energy (1-5)', angle: -90, position: 'insideLeft' }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="oklch(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                label={{ value: 'Consistency %', angle: 90, position: 'insideRight' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="energy"
                stroke="oklch(var(--chart-1))"
                strokeWidth={2}
                dot={{ fill: 'oklch(var(--chart-1))' }}
                name="Energy Level"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="consistency"
                stroke="oklch(var(--chart-2))"
                strokeWidth={2}
                dot={{ fill: 'oklch(var(--chart-2))' }}
                name="Habit Consistency %"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
