import type { Habit, HabitRecord } from '../backend';
import { getHabitUnitLabel } from './habitUnit';

export interface HabitStats {
  name: string;
  percentage: number;
  completed: number;
  expected: number;
  weeklyTarget: number;
}

export interface DailyStats {
  day: number;
  percentage: number;
  completed: number;
}

export interface VolumeStats {
  habitId: string;
  habitName: string;
  unit: string;
  dailyVolumes: { day: number; volume: number }[];
  totalVolume: number;
}

export interface ReportStats {
  overallPercentage: number;
  habitStats: HabitStats[];
  dailyStats: DailyStats[];
  volumeStats: VolumeStats[];
  totalCompleted: number;
  totalExpected: number;
  dateRange: {
    startDay: number;
    startMonth: number;
    startYear: number;
    endDay: number;
    endMonth: number;
    endYear: number;
  };
}

export function calculateReportStats(
  habits: Habit[],
  records: HabitRecord[],
  startDay: number,
  startMonth: number,
  startYear: number,
  endDay: number,
  endMonth: number,
  endYear: number
): ReportStats {
  const startDate = new Date(Date.UTC(startYear, startMonth - 1, startDay));
  const endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay));
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const weeksInRange = daysDiff / 7;

  let totalExpected = 0;
  let totalCompleted = 0;

  const habitStats: HabitStats[] = habits.map((habit) => {
    const habitRecords = records.filter((r) => r.habitId === habit.id);
    const completed = habitRecords.filter((r) => r.completedAt).length;
    const weeklyTarget = Number(habit.weeklyTarget);
    const expected = Math.ceil(weeklyTarget * weeksInRange);

    totalExpected += expected;
    totalCompleted += completed;

    const percentage = expected > 0 ? Math.min((completed / expected) * 100, 100) : 0;

    return {
      name: habit.name,
      percentage: Math.round(percentage),
      completed,
      expected,
      weeklyTarget,
    };
  });

  const overallPercentage = totalExpected > 0 ? Math.min((totalCompleted / totalExpected) * 100, 100) : 0;

  const dailyStatsMap = new Map<string, number>();
  records.forEach((record) => {
    if (record.completedAt) {
      const key = `${record.year}-${record.month}-${record.day}`;
      dailyStatsMap.set(key, (dailyStatsMap.get(key) || 0) + 1);
    }
  });

  const dailyStats: DailyStats[] = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const day = currentDate.getUTCDate();
    const month = currentDate.getUTCMonth() + 1;
    const year = currentDate.getUTCFullYear();
    const key = `${year}-${month}-${day}`;
    const completed = dailyStatsMap.get(key) || 0;

    const expectedForDay = habits.reduce((sum, habit) => {
      return sum + Number(habit.weeklyTarget) / 7;
    }, 0);

    const percentage = expectedForDay > 0 ? Math.min((completed / expectedForDay) * 100, 100) : 0;

    dailyStats.push({
      day: dailyStats.length + 1,
      percentage: Math.round(percentage),
      completed,
    });

    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  // Calculate volume statistics
  const volumeStats: VolumeStats[] = habits.map((habit) => {
    const habitRecords = records.filter((r) => r.habitId === habit.id && r.completedAt);
    const unit = getHabitUnitLabel(habit.unit);

    const dailyVolumeMap = new Map<number, number>();
    habitRecords.forEach((record) => {
      const amount = record.amount ? Number(record.amount) : 0;
      const day = Number(record.day);
      dailyVolumeMap.set(day, (dailyVolumeMap.get(day) || 0) + amount);
    });

    const dailyVolumes: { day: number; volume: number }[] = [];
    for (let day = 1; day <= 31; day++) {
      dailyVolumes.push({
        day,
        volume: dailyVolumeMap.get(day) || 0,
      });
    }

    const totalVolume = Array.from(dailyVolumeMap.values()).reduce((sum, vol) => sum + vol, 0);

    return {
      habitId: habit.id,
      habitName: habit.name,
      unit,
      dailyVolumes,
      totalVolume,
    };
  });

  return {
    overallPercentage: Math.round(overallPercentage),
    habitStats,
    dailyStats,
    volumeStats,
    totalCompleted,
    totalExpected,
    dateRange: {
      startDay,
      startMonth,
      startYear,
      endDay,
      endMonth,
      endYear,
    },
  };
}
