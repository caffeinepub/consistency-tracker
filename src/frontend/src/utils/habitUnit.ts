import type { HabitUnit } from '../backend';

export function getHabitUnitLabel(unit: HabitUnit): string {
  if (unit.__kind__ === 'reps') {
    return 'reps';
  } else if (unit.__kind__ === 'time') {
    return 'time';
  } else if (unit.__kind__ === 'custom') {
    return unit.custom;
  } else if (unit.__kind__ === 'none') {
    return '';
  }
  return 'reps'; // fallback
}

export function getHabitUnitShortLabel(unit: HabitUnit): string {
  if (unit.__kind__ === 'reps') {
    return 'reps';
  } else if (unit.__kind__ === 'time') {
    return 'time';
  } else if (unit.__kind__ === 'custom') {
    return unit.custom;
  } else if (unit.__kind__ === 'none') {
    return '';
  }
  return 'reps'; // fallback
}

export function createHabitUnit(type: 'reps' | 'time' | 'custom' | 'none' | 'km', customValue?: string): HabitUnit {
  if (type === 'reps') {
    return { __kind__: 'reps', reps: null };
  } else if (type === 'time') {
    return { __kind__: 'time', time: null };
  } else if (type === 'none') {
    return { __kind__: 'none', none: null };
  } else if (type === 'km') {
    return { __kind__: 'custom', custom: 'km' };
  } else {
    return { __kind__: 'custom', custom: customValue || '' };
  }
}

export function isNoUnit(unit: HabitUnit): boolean {
  return unit.__kind__ === 'none';
}

export function isTimeUnit(unit: HabitUnit): boolean {
  return unit.__kind__ === 'time';
}

export function isKmUnit(unit: HabitUnit): boolean {
  return unit.__kind__ === 'custom' && unit.custom === 'km';
}

// Helper to convert HabitUnit to UI selection type
export function habitUnitToSelectValue(unit: HabitUnit): 'reps' | 'time' | 'km' | 'none' {
  if (unit.__kind__ === 'reps') {
    return 'reps';
  } else if (unit.__kind__ === 'time') {
    return 'time';
  } else if (unit.__kind__ === 'none') {
    return 'none';
  } else if (unit.__kind__ === 'custom' && unit.custom === 'km') {
    return 'km';
  }
  return 'reps'; // fallback
}
