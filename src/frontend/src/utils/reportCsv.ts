import type { ExportData } from '../backend';
import { formatUTCDate } from './reportDateRange';
import { getHabitUnitLabel, isNoUnit } from './habitUnit';

export function generateCSV(
  exportData: ExportData,
  startDay: number,
  startMonth: number,
  startYear: number,
  endDay: number,
  endMonth: number,
  endYear: number
): string {
  const lines: string[] = [];

  lines.push(`Habit Tracker Export Report`);
  lines.push(`Date Range: ${formatUTCDate(startDay, startMonth, startYear)} to ${formatUTCDate(endDay, endMonth, endYear)}`);
  lines.push('');

  if (exportData.profile) {
    lines.push(`User: ${exportData.profile.name}`);
    lines.push('');
  }

  // Create a map of habit IDs to current habit data for reference
  const habitMap = new Map<string, { name: string; unit: string }>();
  exportData.habits.forEach((habit) => {
    habitMap.set(habit.id, {
      name: habit.name,
      unit: getHabitUnitLabel(habit.unit),
    });
  });

  lines.push('Habit,Date,Completed,Amount,Unit');

  exportData.records.forEach((record) => {
    const date = formatUTCDate(Number(record.day), Number(record.month), Number(record.year));
    const completed = record.completedAt ? 'Yes' : 'No';
    
    // Use record-level unit snapshot to determine if this record has a unit
    const recordHasNoUnit = isNoUnit(record.unit);
    
    // For no-unit records, leave amount and unit blank
    const amount = recordHasNoUnit ? '' : (record.amount !== undefined ? String(Number(record.amount)) : '');
    const unit = recordHasNoUnit ? '' : getHabitUnitLabel(record.unit);
    
    // Use the latest habit name from the habits collection
    const habitName = habitMap.get(record.habitId)?.name || record.habitName;
    
    lines.push(`"${habitName}",${date},${completed},${amount},${unit}`);
  });

  return lines.join('\n');
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
