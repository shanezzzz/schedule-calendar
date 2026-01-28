import dayjs from 'dayjs'
import type { CalendarEventData } from '@/components/CalendarEvent'

// ======================== Constants ========================
const DATETIME_REGEX =
  /^(\d{4}-\d{2}-\d{2})[T\s](\d{1,2}:\d{2}(?:\s*(?:AM|PM))?)$/i
const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/

// ======================== Types ========================
export interface ParsedDateTime {
  date: string | null
  time: string
}

// ======================== Parsing Functions ========================

/**
 * Parse a start/end string that may be time-only ("09:00") or datetime ("2025-01-28 09:00").
 * Returns { date, time } where date is null for time-only strings.
 */
export function parseDateTimeString(value: string): ParsedDateTime {
  const trimmed = value.trim()
  const match = trimmed.match(DATETIME_REGEX)

  if (match) {
    return {
      date: match[1],
      time: match[2].trim(),
    }
  }

  // Time-only string
  return {
    date: null,
    time: trimmed,
  }
}

/**
 * Extract just the time portion from a start/end string.
 * "2025-01-28 09:00" -> "09:00", "09:00" -> "09:00"
 */
export function extractTime(value: string): string {
  return parseDateTimeString(value).time
}

/**
 * Extract just the date portion. Returns null for time-only strings.
 * "2025-01-28 09:00" -> "2025-01-28", "09:00" -> null
 */
export function extractDate(value: string): string | null {
  return parseDateTimeString(value).date
}

/**
 * Get the date for an event, resolving from datetime string, explicit date field, or fallback.
 * Priority: datetime in start > event.date > fallbackDate > null
 */
export function resolveEventDate(
  event: { start: string; end: string; date?: string },
  fallbackDate?: string
): string | null {
  const dateFromStart = extractDate(event.start)
  if (dateFromStart) return dateFromStart

  if (event.date && DATE_ONLY_REGEX.test(event.date)) return event.date

  return fallbackDate ?? null
}

// ======================== Week/Month Generation ========================

/**
 * Generate array of 7 dates (as "YYYY-MM-DD" strings) for the week containing the given date.
 * @param date - reference date
 * @param weekStartsOn - 0=Sunday, 1=Monday (default 1)
 */
export function getWeekDates(date: Date, weekStartsOn: 0 | 1 = 1): string[] {
  const d = dayjs(date)
  const dayOfWeek = d.day() // 0=Sunday, 1=Monday, ...

  let startOffset: number
  if (weekStartsOn === 1) {
    // Monday start
    startOffset = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1)
  } else {
    // Sunday start
    startOffset = -dayOfWeek
  }

  const weekStart = d.add(startOffset, 'day')
  const dates: string[] = []

  for (let i = 0; i < 7; i++) {
    dates.push(weekStart.add(i, 'day').format('YYYY-MM-DD'))
  }

  return dates
}

/**
 * Generate a month grid: array of week-rows, each containing 7 date strings.
 * Includes leading/trailing dates from adjacent months to fill complete weeks.
 * Returns enough rows to cover the entire month (4-6 rows).
 */
export function getMonthGrid(
  year: number,
  month: number,
  weekStartsOn: 0 | 1 = 1
): string[][] {
  const firstDay = dayjs(new Date(year, month, 1))
  const daysInMonth = firstDay.daysInMonth()

  // Find the start of the grid (first day of the first week)
  const firstDayOfWeek = firstDay.day() // 0=Sunday
  let gridStartOffset: number
  if (weekStartsOn === 1) {
    gridStartOffset = firstDayOfWeek === 0 ? -6 : -(firstDayOfWeek - 1)
  } else {
    gridStartOffset = -firstDayOfWeek
  }

  const gridStart = firstDay.add(gridStartOffset, 'day')

  // Calculate how many rows we need
  const lastDay = dayjs(new Date(year, month, daysInMonth))
  const lastDayOfWeek = lastDay.day()
  let gridEndOffset: number
  if (weekStartsOn === 1) {
    gridEndOffset = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek
  } else {
    gridEndOffset = lastDayOfWeek === 6 ? 0 : 6 - lastDayOfWeek
  }

  const totalDays = -gridStartOffset + daysInMonth + gridEndOffset
  const totalRows = Math.ceil(totalDays / 7)

  const grid: string[][] = []
  let current = gridStart

  for (let row = 0; row < totalRows; row++) {
    const week: string[] = []
    for (let col = 0; col < 7; col++) {
      week.push(current.format('YYYY-MM-DD'))
      current = current.add(1, 'day')
    }
    grid.push(week)
  }

  return grid
}

// ======================== Date Comparison ========================

/**
 * Check if a date string ("YYYY-MM-DD") matches a given Date object (same calendar day).
 */
export function isSameDate(dateStr: string, date: Date): boolean {
  return dayjs(dateStr).isSame(dayjs(date), 'day')
}

/**
 * Check if a date string is today.
 */
export function isToday(dateStr: string): boolean {
  return dayjs(dateStr).isSame(dayjs(), 'day')
}

/**
 * Format a date string for display.
 */
export function formatDateHeader(dateStr: string, format?: string): string {
  return dayjs(dateStr).format(format ?? 'ddd D')
}

// ======================== Event Filtering ========================

/**
 * Filter events that fall on a specific date.
 * Resolves event date from datetime start, explicit date field, or fallbackDate.
 */
export function getEventsForDate(
  events: CalendarEventData[],
  dateStr: string,
  fallbackDate?: string
): CalendarEventData[] {
  return events.filter(event => {
    const eventDate = resolveEventDate(event, fallbackDate)
    return eventDate === dateStr
  })
}

/**
 * Filter events that fall within a date range (inclusive).
 */
export function getEventsForDateRange(
  events: CalendarEventData[],
  startDate: string,
  endDate: string,
  fallbackDate?: string
): CalendarEventData[] {
  return events.filter(event => {
    const eventDate = resolveEventDate(event, fallbackDate)
    if (!eventDate) return false
    return eventDate >= startDate && eventDate <= endDate
  })
}

/**
 * Group events by date. Returns a Map of dateStr -> CalendarEventData[].
 */
export function groupEventsByDate(
  events: CalendarEventData[],
  fallbackDate?: string
): Map<string, CalendarEventData[]> {
  const map = new Map<string, CalendarEventData[]>()

  events.forEach(event => {
    const eventDate = resolveEventDate(event, fallbackDate)
    if (!eventDate) return

    const existing = map.get(eventDate)
    if (existing) {
      existing.push(event)
    } else {
      map.set(eventDate, [event])
    }
  })

  return map
}
