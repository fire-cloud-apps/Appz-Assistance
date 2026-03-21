import {
  RecurrencePattern,
  RecurrenceWeeklyDay,
} from '../database/models'

/**
 * Calculate the next occurrence date based on the recurrence pattern
 */
export function calculateNextOccurrence(
  currentDate: Date,
  pattern: RecurrencePattern,
  recurrenceEndDate?: string | null
): Date | null {
  const endDate = recurrenceEndDate ? new Date(recurrenceEndDate) : null

  let nextDate: Date

  switch (pattern.frequency) {
    case 'daily':
      nextDate = addDays(currentDate, pattern.interval)
      break

    case 'weekly':
      nextDate = findNextWeeklyDate(currentDate, pattern)
      break

    case 'monthly':
      nextDate = findNextMonthlyDate(currentDate, pattern)
      break

    case 'yearly':
      nextDate = addYears(currentDate, pattern.interval)
      break

    default:
      return null
  }

  // Check if next occurrence is beyond end date
  if (endDate && nextDate > endDate) {
    return null
  }

  return nextDate
}

/**
 * Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Add weeks to a date
 */
function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7)
}

/**
 * Add months to a date
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  // Handle month overflow (e.g., Jan 31 + 1 month = Feb 28)
  while (result.getMonth() !== (date.getMonth() + months) % 12) {
    result.setDate(result.getDate() - 1)
  }
  return result
}

/**
 * Add years to a date
 */
function addYears(date: Date, years: number): Date {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  // Handle Feb 29 in non-leap years
  if (result.getMonth() === 1 && result.getDate() === 28 && date.getDate() === 29) {
    // Keep Feb 28 for non-leap years
  }
  return result
}

/**
 * Find the next valid date for weekly recurrence
 */
function findNextWeeklyDate(currentDate: Date, pattern: RecurrencePattern): Date {
  const weeklyDays = pattern.weeklyDays || ['mon']
  const interval = pattern.interval || 1

  // Convert day strings to numeric days (0-6)
  const dayMap: Record<RecurrenceWeeklyDay, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  }

  const targetDays = weeklyDays.map((d: RecurrenceWeeklyDay) => dayMap[d]).sort((a: number, b: number) => a - b)
  const currentDay = currentDate.getDay()

  // Find the next target day
  let nextDay: number | null = null
  for (const day of targetDays) {
    if (day > currentDay) {
      nextDay = day
      break
    }
  }

  if (nextDay === null) {
    // No more days this week, go to next week
    const firstDay = targetDays[0]!
    const daysUntilNext = (7 - currentDay) + firstDay
    return addWeeks(addDays(currentDate, daysUntilNext), interval - 1)
  } else {
    const daysUntilNext = nextDay - currentDay
    return addDays(currentDate, daysUntilNext)
  }
}

/**
 * Find the next valid date for monthly recurrence
 */
function findNextMonthlyDate(currentDate: Date, pattern: RecurrencePattern): Date {
  const interval = pattern.interval || 1
  const monthlyDay = pattern.monthlyDay || currentDate.getDate()

  let nextDate = addMonths(currentDate, interval)

  // Set to the target day of the month
  const daysInMonth = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 0).getDate()
  const targetDay = Math.min(monthlyDay, daysInMonth)

  nextDate.setDate(targetDay)

  return nextDate
}

/**
 * Get a human-readable label for a recurrence pattern
 */
export function getRecurrenceLabel(pattern: RecurrencePattern): string {
  const { frequency, interval, weeklyDays, monthlyDay } = pattern

  const intervalText = interval === 1 ? '' : `every ${interval} `

  switch (frequency) {
    case 'daily':
      return `${intervalText}day${interval !== 1 ? 's' : ''}`

    case 'weekly':
      const days = weeklyDays?.map(dayToLabel).join(', ') || 'week'
      return interval === 1
        ? `weekly on ${days}`
        : `every ${interval} weeks on ${days}`

    case 'monthly':
      const dayOrdinal = getOrdinal(monthlyDay || 1)
      return interval === 1
        ? `monthly on the ${dayOrdinal}`
        : `every ${interval} months on the ${dayOrdinal}`

    case 'yearly':
      return interval === 1 ? 'yearly' : `every ${interval} years`

    default:
      return 'does not repeat'
  }
}

/**
 * Convert day abbreviation to full name
 */
function dayToLabel(day: RecurrenceWeeklyDay): string {
  const labels: Record<RecurrenceWeeklyDay, string> = {
    sun: 'Sun',
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
  }
  return labels[day]
}

/**
 * Get ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 */
function getOrdinal(num: number): string {
  const j = num % 10
  const k = num % 100

  if (j === 1 && k !== 11) return `${num}st`
  if (j === 2 && k !== 12) return `${num}nd`
  if (j === 3 && k !== 13) return `${num}rd`
  return `${num}th`
}

/**
 * Get the day of week as RecurrenceWeeklyDay
 */
export function getDayOfWeek(date: Date): RecurrenceWeeklyDay {
  const days: RecurrenceWeeklyDay[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return days[date.getDay()]
}

/**
 * Check if a task should create its next occurrence
 */
export function shouldCreateNextOccurrence(
  _dueDate: string | null | undefined,
  _pattern: RecurrencePattern,
  _recurrenceEndDate?: string | null
): boolean {
  // This function is reserved for future use
  return false
}

/**
 * Format date to ISO string (YYYY-MM-DD)
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString().split('T')[0]
}
