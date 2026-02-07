import type { DiaryEntry } from '../backend';
import type { InvestmentGoal } from '../types/investments';

export function formatDate(dateNanos: bigint): string {
  const dateMs = Number(dateNanos / BigInt(1_000_000));
  const date = new Date(dateMs);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function formatAmount(amountCents: bigint): number {
  return Number(amountCents) / 100;
}

export function calculateProgress(
  goal: InvestmentGoal,
  entries: DiaryEntry[]
): { current: number; target: number; percentage: number } {
  const linkedEntryIds = new Set(goal.linkedEntries.map(id => id.toString()));
  
  const currentAmount = entries
    .filter(entry => linkedEntryIds.has(entry.id.toString()))
    .reduce((sum, entry) => sum + formatAmount(entry.amount), 0);
  
  const targetAmount = formatAmount(goal.targetAmount);
  const percentage = targetAmount > 0 ? Math.min((currentAmount / targetAmount) * 100, 100) : 0;
  
  return {
    current: currentAmount,
    target: targetAmount,
    percentage,
  };
}

export function getDeadlineText(): string {
  return 'Dec 31, 2026';
}

export function parseDate(dateString: string): Date {
  return new Date(dateString);
}
