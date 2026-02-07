import type { Habit, HabitRecord } from '../backend';

/**
 * Calculate daily habit consistency percentage from habit records
 * Returns a map of date (YYYY-MM-DD) to consistency percentage (0-100)
 */
export function calculateDailyConsistency(
  habits: Habit[],
  records: HabitRecord[]
): Map<string, number> {
  const consistencyByDate = new Map<string, number>();

  if (habits.length === 0) {
    return consistencyByDate;
  }

  // Group records by date
  const recordsByDate = new Map<string, HabitRecord[]>();
  records.forEach((record) => {
    if (record.completedAt) {
      const year = Number(record.year);
      const month = String(Number(record.month)).padStart(2, '0');
      const day = String(Number(record.day)).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (!recordsByDate.has(dateKey)) {
        recordsByDate.set(dateKey, []);
      }
      recordsByDate.get(dateKey)!.push(record);
    }
  });

  // Calculate consistency for each date
  recordsByDate.forEach((dayRecords, dateKey) => {
    // Expected completions per day = sum of (weeklyTarget / 7) for all habits
    const expectedPerDay = habits.reduce((sum, habit) => {
      return sum + Number(habit.weeklyTarget) / 7;
    }, 0);

    // Actual completions for this day
    const actualCompletions = dayRecords.length;

    // Calculate percentage (capped at 100%)
    const percentage = expectedPerDay > 0
      ? Math.min((actualCompletions / expectedPerDay) * 100, 100)
      : 0;

    consistencyByDate.set(dateKey, Math.round(percentage));
  });

  return consistencyByDate;
}
