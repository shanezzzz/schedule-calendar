import { describe, expect, it } from 'vitest'
import {
  parseDateTimeString,
  extractTime,
  extractDate,
  resolveEventDate,
  getWeekDates,
  getMonthGrid,
  isSameDate,
  isToday,
  getEventsForDate,
  getEventsForDateRange,
  groupEventsByDate,
} from '../dateUtils'

describe('parseDateTimeString', () => {
  it('parses time-only string', () => {
    expect(parseDateTimeString('09:00')).toEqual({ date: null, time: '09:00' })
  })

  it('parses datetime with space separator', () => {
    expect(parseDateTimeString('2025-01-28 09:00')).toEqual({
      date: '2025-01-28',
      time: '09:00',
    })
  })

  it('parses datetime with T separator', () => {
    expect(parseDateTimeString('2025-01-28T14:30')).toEqual({
      date: '2025-01-28',
      time: '14:30',
    })
  })

  it('handles whitespace', () => {
    expect(parseDateTimeString('  09:00  ')).toEqual({
      date: null,
      time: '09:00',
    })
  })
})

describe('extractTime', () => {
  it('extracts time from datetime string', () => {
    expect(extractTime('2025-01-28 09:00')).toBe('09:00')
  })

  it('returns time-only string as-is', () => {
    expect(extractTime('09:00')).toBe('09:00')
  })
})

describe('extractDate', () => {
  it('extracts date from datetime string', () => {
    expect(extractDate('2025-01-28 09:00')).toBe('2025-01-28')
  })

  it('returns null for time-only string', () => {
    expect(extractDate('09:00')).toBeNull()
  })
})

describe('resolveEventDate', () => {
  it('resolves date from datetime start', () => {
    const event = { start: '2025-01-28 09:00', end: '2025-01-28 10:00' }
    expect(resolveEventDate(event)).toBe('2025-01-28')
  })

  it('resolves date from explicit date field', () => {
    const event = { start: '09:00', end: '10:00', date: '2025-01-28' }
    expect(resolveEventDate(event)).toBe('2025-01-28')
  })

  it('uses fallback date', () => {
    const event = { start: '09:00', end: '10:00' }
    expect(resolveEventDate(event, '2025-01-28')).toBe('2025-01-28')
  })

  it('returns null when no date available', () => {
    const event = { start: '09:00', end: '10:00' }
    expect(resolveEventDate(event)).toBeNull()
  })

  it('prioritizes datetime start over date field', () => {
    const event = {
      start: '2025-01-28 09:00',
      end: '2025-01-28 10:00',
      date: '2025-02-01',
    }
    expect(resolveEventDate(event)).toBe('2025-01-28')
  })
})

describe('getWeekDates', () => {
  it('returns 7 dates starting from Monday (weekStartsOn=1)', () => {
    // 2025-01-28 is a Tuesday
    const dates = getWeekDates(new Date(2025, 0, 28), 1)
    expect(dates).toHaveLength(7)
    expect(dates[0]).toBe('2025-01-27') // Monday
    expect(dates[6]).toBe('2025-02-02') // Sunday
  })

  it('returns 7 dates starting from Sunday (weekStartsOn=0)', () => {
    // 2025-01-28 is a Tuesday
    const dates = getWeekDates(new Date(2025, 0, 28), 0)
    expect(dates).toHaveLength(7)
    expect(dates[0]).toBe('2025-01-26') // Sunday
    expect(dates[6]).toBe('2025-02-01') // Saturday
  })

  it('handles Sunday as reference date with weekStartsOn=1', () => {
    // 2025-02-02 is a Sunday
    const dates = getWeekDates(new Date(2025, 1, 2), 1)
    expect(dates[0]).toBe('2025-01-27') // Monday of that week
    expect(dates[6]).toBe('2025-02-02') // Sunday
  })
})

describe('getMonthGrid', () => {
  it('generates grid for January 2025 (weekStartsOn=1)', () => {
    const grid = getMonthGrid(2025, 0, 1) // Jan 2025
    expect(grid.length).toBeGreaterThanOrEqual(4)
    expect(grid.length).toBeLessThanOrEqual(6)
    expect(grid[0]).toHaveLength(7)

    // Jan 1 2025 is a Wednesday, so grid should start from Mon Dec 30
    expect(grid[0][0]).toBe('2024-12-30')
    // Last day of January
    const allDates = grid.flat()
    expect(allDates).toContain('2025-01-31')
  })

  it('generates grid with weekStartsOn=0', () => {
    const grid = getMonthGrid(2025, 0, 0) // Jan 2025, Sunday start
    // Jan 1 2025 is a Wednesday, so grid should start from Sun Dec 29
    expect(grid[0][0]).toBe('2024-12-29')
  })

  it('each row has exactly 7 dates', () => {
    const grid = getMonthGrid(2025, 1, 1) // Feb 2025
    grid.forEach(row => {
      expect(row).toHaveLength(7)
    })
  })
})

describe('isSameDate', () => {
  it('returns true for matching dates', () => {
    expect(isSameDate('2025-01-28', new Date(2025, 0, 28))).toBe(true)
  })

  it('returns false for different dates', () => {
    expect(isSameDate('2025-01-28', new Date(2025, 0, 29))).toBe(false)
  })
})

describe('isToday', () => {
  it('returns true for today', () => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    expect(isToday(todayStr)).toBe(true)
  })

  it('returns false for another date', () => {
    expect(isToday('2020-01-01')).toBe(false)
  })
})

describe('getEventsForDate', () => {
  const events = [
    {
      id: '1',
      start: '2025-01-28 09:00',
      end: '2025-01-28 10:00',
      employeeId: 'e1',
    },
    {
      id: '2',
      start: '2025-01-29 09:00',
      end: '2025-01-29 10:00',
      employeeId: 'e1',
    },
    {
      id: '3',
      start: '09:00',
      end: '10:00',
      employeeId: 'e2',
      date: '2025-01-28',
    },
  ]

  it('filters events by date from datetime strings', () => {
    const result = getEventsForDate(events, '2025-01-28')
    expect(result).toHaveLength(2)
    expect(result.map(e => e.id)).toEqual(['1', '3'])
  })

  it('returns empty for non-matching date', () => {
    expect(getEventsForDate(events, '2025-01-30')).toHaveLength(0)
  })
})

describe('getEventsForDateRange', () => {
  const events = [
    {
      id: '1',
      start: '2025-01-27 09:00',
      end: '2025-01-27 10:00',
      employeeId: 'e1',
    },
    {
      id: '2',
      start: '2025-01-28 09:00',
      end: '2025-01-28 10:00',
      employeeId: 'e1',
    },
    {
      id: '3',
      start: '2025-01-29 09:00',
      end: '2025-01-29 10:00',
      employeeId: 'e1',
    },
    {
      id: '4',
      start: '2025-01-30 09:00',
      end: '2025-01-30 10:00',
      employeeId: 'e1',
    },
  ]

  it('filters events within a date range (inclusive)', () => {
    const result = getEventsForDateRange(events, '2025-01-28', '2025-01-29')
    expect(result).toHaveLength(2)
    expect(result.map(e => e.id)).toEqual(['2', '3'])
  })
})

describe('groupEventsByDate', () => {
  const events = [
    {
      id: '1',
      start: '2025-01-28 09:00',
      end: '2025-01-28 10:00',
      employeeId: 'e1',
    },
    {
      id: '2',
      start: '2025-01-28 14:00',
      end: '2025-01-28 15:00',
      employeeId: 'e1',
    },
    {
      id: '3',
      start: '2025-01-29 09:00',
      end: '2025-01-29 10:00',
      employeeId: 'e1',
    },
  ]

  it('groups events by date', () => {
    const result = groupEventsByDate(events)
    expect(result.get('2025-01-28')).toHaveLength(2)
    expect(result.get('2025-01-29')).toHaveLength(1)
  })
})
