export type RecurrenceFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export type RecurrenceWeeklyDay =
  | 'sun'
  | 'mon'
  | 'tue'
  | 'wed'
  | 'thu'
  | 'fri'
  | 'sat';

export interface RecurrencePattern {
  frequency: RecurrenceFrequency;
  interval: number; // e.g., every 2 weeks, every 3 months
  weeklyDays?: RecurrenceWeeklyDay[]; // For weekly recurrence, which days
  monthlyDay?: number; // For monthly recurrence, which day of month (1-31)
  count?: number; // Number of occurrences (optional, if not set, recurs until end date)
}
