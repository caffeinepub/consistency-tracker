import type { DiaryEntry } from '../backend';

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

export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

// Goal-specific utilities
export function computeGoalProgressPercentage(currentlyHeld: number, target: number): number {
  if (target <= 0) return 0;
  const percentage = (currentlyHeld / target) * 100;
  return Math.min(percentage, 100);
}

export function formatQuantity(quantity: number): string {
  return quantity.toLocaleString('en-US', {
    maximumFractionDigits: 2,
  });
}
