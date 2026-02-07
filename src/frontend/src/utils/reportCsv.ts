import type { ExportData, HabitRecord } from '../backend';
import { formatHabitUnit } from './exportFormatters';

export function generateCsvContent(exportData: ExportData): string {
  const lines: string[] = [];

  // CSV Header
  lines.push('Date,Habit,Amount,Unit');

  // CSV Rows
  exportData.habitRecords.forEach((record: HabitRecord) => {
    const date = `${record.year}-${String(record.month).padStart(2, '0')}-${String(record.day).padStart(2, '0')}`;
    const habit = record.habitName;
    const amount = record.amount !== undefined && record.amount !== null ? String(record.amount) : '';
    const unit = formatHabitUnit(record.unit);

    // Escape fields that contain commas or quotes
    const escapeCsv = (field: string) => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    };

    lines.push(`${escapeCsv(date)},${escapeCsv(habit)},${escapeCsv(amount)},${escapeCsv(unit)}`);
  });

  return lines.join('\n');
}

export function downloadCsv(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
