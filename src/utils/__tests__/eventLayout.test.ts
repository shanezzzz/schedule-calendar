import { describe, expect, it } from 'vitest'
import { calculateEventOverlapLayout } from '../eventLayout'
import type { CalendarEventData } from '@/components/CalendarEvent'

function makeEvent(id: string, start: string, end: string): CalendarEventData {
  return { id, start, end, employeeId: 'e1' }
}

describe('calculateEventOverlapLayout', () => {
  it('assigns single column for non-overlapping events', () => {
    const events = [
      makeEvent('1', '09:00', '10:00'),
      makeEvent('2', '10:00', '11:00'),
      makeEvent('3', '11:00', '12:00'),
    ]

    const layout = calculateEventOverlapLayout(events)

    expect(layout.get('1')).toEqual({ column: 0, columns: 1 })
    expect(layout.get('2')).toEqual({ column: 0, columns: 1 })
    expect(layout.get('3')).toEqual({ column: 0, columns: 1 })
  })

  it('assigns two columns for two overlapping events', () => {
    const events = [
      makeEvent('1', '09:00', '10:30'),
      makeEvent('2', '10:00', '11:00'),
    ]

    const layout = calculateEventOverlapLayout(events)

    expect(layout.get('1')?.columns).toBe(2)
    expect(layout.get('2')?.columns).toBe(2)
    expect(layout.get('1')?.column).not.toBe(layout.get('2')?.column)
  })

  it('handles three-way overlap', () => {
    const events = [
      makeEvent('1', '09:00', '11:00'),
      makeEvent('2', '09:30', '10:30'),
      makeEvent('3', '10:00', '11:30'),
    ]

    const layout = calculateEventOverlapLayout(events)

    expect(layout.get('1')?.columns).toBe(3)
    expect(layout.get('2')?.columns).toBe(3)
    expect(layout.get('3')?.columns).toBe(3)

    // All should have different columns
    const columns = new Set([
      layout.get('1')?.column,
      layout.get('2')?.column,
      layout.get('3')?.column,
    ])
    expect(columns.size).toBe(3)
  })

  it('reuses columns when events end before new ones start', () => {
    const events = [
      makeEvent('1', '09:00', '10:00'),
      makeEvent('2', '09:30', '11:00'),
      makeEvent('3', '10:00', '11:00'), // starts after event 1 ends
    ]

    const layout = calculateEventOverlapLayout(events)

    // Event 3 should reuse column 0 (from event 1 that ended)
    expect(layout.get('3')?.column).toBe(0)
  })

  it('returns empty map for empty input', () => {
    const layout = calculateEventOverlapLayout([])
    expect(layout.size).toBe(0)
  })

  it('handles datetime strings (extracts time portion)', () => {
    const events = [
      makeEvent('1', '2025-01-28 09:00', '2025-01-28 10:30'),
      makeEvent('2', '2025-01-28 10:00', '2025-01-28 11:00'),
    ]

    const layout = calculateEventOverlapLayout(events)

    expect(layout.get('1')?.columns).toBe(2)
    expect(layout.get('2')?.columns).toBe(2)
  })
})
