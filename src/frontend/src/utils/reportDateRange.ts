export interface DateRange {
  startDay: number;
  startMonth: number;
  startYear: number;
  endDay: number;
  endMonth: number;
  endYear: number;
}

export function dateToUTCComponents(date: Date): { day: number; month: number; year: number } {
  return {
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
  };
}

export function dateRangeToComponents(startDate: Date, endDate: Date): DateRange {
  // Normalize: if end is before start, swap them
  const actualStart = startDate <= endDate ? startDate : endDate;
  const actualEnd = endDate >= startDate ? endDate : startDate;

  const start = dateToUTCComponents(actualStart);
  const end = dateToUTCComponents(actualEnd);

  return {
    startDay: start.day,
    startMonth: start.month,
    startYear: start.year,
    endDay: end.day,
    endMonth: end.month,
    endYear: end.year,
  };
}

export function formatUTCDate(day: number, month: number, year: number): string {
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toISOString().split('T')[0];
}

export function singleDateToRange(date: Date): DateRange {
  const components = dateToUTCComponents(date);
  return {
    startDay: components.day,
    startMonth: components.month,
    startYear: components.year,
    endDay: components.day,
    endMonth: components.month,
    endYear: components.year,
  };
}
