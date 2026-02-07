import type { ExportData } from '../backend';
import { format } from 'date-fns';
import { formatHabitUnit } from './exportFormatters';

// Simple XLSX generation using CSV format with .xlsx extension
// This creates a tab-delimited file that Excel can open
export async function exportToXlsx(data: ExportData, startDate: Date, endDate: Date): Promise<void> {
  const sheets: { name: string; content: string }[] = [];

  // Sheet 1: Daily Reflections
  const reflectionsRows = [
    ['Date', 'Title', 'Content'].join('\t'),
    ...data.diaryEntries.map(([date, entry]) =>
      [date, entry.title || '', (entry.content || '').replace(/\t/g, ' ').replace(/\n/g, ' ')].join('\t')
    ),
  ];
  sheets.push({ name: 'Reflections', content: reflectionsRows.join('\n') });

  // Sheet 2: Habit Records
  const habitsRows = [
    ['Date', 'Habit', 'Amount', 'Unit'].join('\t'),
    ...data.habitRecords.map((record) =>
      [
        `${record.year}-${String(record.month).padStart(2, '0')}-${String(record.day).padStart(2, '0')}`,
        record.habitName,
        record.amount !== undefined && record.amount !== null ? String(record.amount) : '',
        formatHabitUnit(record.unit),
      ].join('\t')
    ),
  ];
  sheets.push({ name: 'Habits', content: habitsRows.join('\n') });

  // Sheet 3: Investment Goals
  const goalsRows = [
    ['Asset', 'Currently Held', 'Target', 'Progress %'].join('\t'),
    ...data.investmentGoals.map((goal) => {
      const progress = goal.target > 0n ? Math.round((Number(goal.currentlyHeld) / Number(goal.target)) * 100) : 0;
      return [goal.asset, String(Number(goal.currentlyHeld)), String(Number(goal.target)), String(progress)].join('\t');
    }),
  ];
  sheets.push({ name: 'Investment Goals', content: goalsRows.join('\n') });

  // Sheet 4: Investment Diary Entries
  const investmentEntriesRows = [
    ['Date', 'Asset', 'Amount', 'Notes'].join('\t'),
    ...data.investmentDiaryEntries.map((entry) =>
      [String(entry.date), entry.asset, String(Number(entry.amount)), entry.notes.replace(/\t/g, ' ').replace(/\n/g, ' ')].join('\t')
    ),
  ];
  sheets.push({ name: 'Investment Entries', content: investmentEntriesRows.join('\n') });

  // Combine all sheets with sheet separators
  const fullContent = sheets.map((sheet) => `=== ${sheet.name} ===\n${sheet.content}`).join('\n\n');

  // Generate filename
  const startStr = format(startDate, 'yyyy-MM-dd');
  const endStr = format(endDate, 'yyyy-MM-dd');
  const filename = `export_${startStr}_to_${endStr}.xlsx`;

  // Create and download file
  const blob = new Blob([fullContent], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
