import dayjs from 'dayjs'

/**
 * Parse a date string in YYYY-MM-DD format to a Date object
 * Handles timezone correctly by parsing as UTC start of day
 */
export function parseDateString(dateString: string | null | undefined): Date | null {
  if (!dateString) return null

  try {
    // Parse as YYYY-MM-DD format using dayjs (handles parsing better than new Date)
    const parsed = dayjs(dateString, 'YYYY-MM-DD')
    if (!parsed.isValid()) return null
    return parsed.toDate()
  } catch {
    return null
  }
}

/**
 * Format a date to readable string format
 * e.g., "20 Apr 2026"
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'No Due Date'

  try {
    const dateObj = typeof date === 'string' ? parseDateString(date) : date
    if (!dateObj) return 'Invalid Date'

    return dayjs(dateObj).format('DD MMM YYYY')
  } catch {
    return 'Invalid Date'
  }
}

/**
 * Format time to readable string format
 * e.g., "2:30 PM" or "14:30"
 */
export function formatTime(time: string | null | undefined): string {
  if (!time) return ''

  try {
    // Assume time is in HH:mm format
    return dayjs(`2000-01-01 ${time}`).format('hh:mm A')
  } catch {
    return time // Return original if parsing fails
  }
}

/**
 * Format date and time together
 * e.g., "20 Apr 2026 at 2:30 PM"
 */
export function formatDateTime(date: string | null | undefined, time: string | null | undefined): string {
  const formattedDate = formatDate(date)
  if (formattedDate === 'Invalid Date') return 'Invalid Date'
  if (formattedDate === 'No Due Date') return 'No Due Date'

  const formattedTime = formatTime(time)
  if (formattedTime) {
    return `${formattedDate} at ${formattedTime}`
  }
  return formattedDate
}

/**
 * Parse a date string and compare with today
 * Returns true if date is in the past (before today)
 */
export function isDateInThePast(dateString: string | null | undefined): boolean {
  if (!dateString) return false

  try {
    const dateObj = parseDateString(dateString)
    if (!dateObj) return false

    const today = dayjs().startOf('day')
    const date = dayjs(dateObj).startOf('day')

    return date.isBefore(today)
  } catch {
    return false
  }
}

/**
 * Validate if a date string is valid
 */
export function isValidDateString(dateString: string | null | undefined): boolean {
  if (!dateString) return false

  try {
    const parsed = dayjs(dateString, 'YYYY-MM-DD')
    return parsed.isValid()
  } catch {
    return false
  }
}
