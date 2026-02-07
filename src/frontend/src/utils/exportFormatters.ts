import type { HabitUnit } from '../backend';
import { format, parseISO } from 'date-fns';

export function formatExportDate(dateString: string): string {
  try {
    // Handle YYYY-MM-DD format
    if (dateString.includes('-')) {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy');
    }
    // Handle YYYYMMDD numeric format
    if (dateString.length === 8) {
      const year = parseInt(dateString.substring(0, 4));
      const month = parseInt(dateString.substring(4, 6)) - 1;
      const day = parseInt(dateString.substring(6, 8));
      const date = new Date(year, month, day);
      return format(date, 'MMM d, yyyy');
    }
    return dateString;
  } catch {
    return dateString;
  }
}

export function formatHabitUnit(unit: HabitUnit): string {
  if ('__kind__' in unit) {
    switch (unit.__kind__) {
      case 'reps':
        return 'reps';
      case 'time':
        return 'time';
      case 'custom':
        return unit.custom;
      case 'none':
        return '—';
      default:
        return '—';
    }
  }
  return '—';
}

export function formatInvestmentAmount(amount: bigint): string {
  return Number(amount).toLocaleString();
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  return `${minutes}m ${remainingSeconds}s`;
}
