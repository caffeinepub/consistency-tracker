import type { HabitUnit } from '../backend';

export function getHabitUnitLabel(unit: HabitUnit): string {
  if (unit.__kind__ === 'reps') {
    return 'reps';
  } else if (unit.__kind__ === 'time') {
    return 'minutes';
  } else if (unit.__kind__ === 'custom') {
    return unit.custom;
  }
  return 'reps'; // fallback
}

export function getHabitUnitShortLabel(unit: HabitUnit): string {
  if (unit.__kind__ === 'reps') {
    return 'reps';
  } else if (unit.__kind__ === 'time') {
    return 'min';
  } else if (unit.__kind__ === 'custom') {
    return unit.custom;
  }
  return 'reps'; // fallback
}

export function createHabitUnit(type: 'reps' | 'time' | 'custom', customValue?: string): HabitUnit {
  if (type === 'reps') {
    return { __kind__: 'reps', reps: null };
  } else if (type === 'time') {
    return { __kind__: 'time', time: null };
  } else {
    return { __kind__: 'custom', custom: customValue || '' };
  }
}
