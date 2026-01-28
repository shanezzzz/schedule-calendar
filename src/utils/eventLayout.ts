import type { CalendarEventData } from '@/components/CalendarEvent'
import { slotToMinutes, differenceInMinutes } from '@/utils/util'
import { extractTime } from '@/utils/dateUtils'

// ======================== Types ========================
export interface EventLayoutInfo {
  /** Sub-column index within the overlap group (0-based) */
  column: number
  /** Total number of concurrent columns in this overlap group */
  columns: number
}

// ======================== Core Algorithm ========================

/**
 * Calculate overlap layout for a set of events within a single column (day or employee).
 * Handles overlapping events by assigning sub-column positions.
 *
 * Returns a Map of eventId -> EventLayoutInfo.
 *
 * @param events - Array of events to layout. The start/end fields may be
 *                 time-only ("09:00") or datetime ("2025-01-28 09:00").
 */
export function calculateEventOverlapLayout(
  events: CalendarEventData[]
): Map<string, EventLayoutInfo> {
  const layoutMap = new Map<string, EventLayoutInfo>()

  const processedEvents = events
    .map(evt => {
      const startTime = extractTime(evt.start)
      const endTime = extractTime(evt.end)
      const start = slotToMinutes(startTime)
      if (start === null) return null

      const duration = differenceInMinutes(startTime, endTime)
      return {
        start,
        end: start + duration,
        event: evt,
      }
    })
    .filter(
      (
        value
      ): value is {
        start: number
        end: number
        event: CalendarEventData
      } => value !== null
    )
    .sort((a, b) => a.start - b.start)

  const active: Array<{ id: string; end: number; column: number }> = []

  processedEvents.forEach(item => {
    // Remove events that have ended
    for (let idx = active.length - 1; idx >= 0; idx -= 1) {
      if (active[idx].end <= item.start) {
        active.splice(idx, 1)
      }
    }

    // Find the first available column
    const usedColumns = new Set(active.map(entry => entry.column))
    let column = 0
    while (usedColumns.has(column)) {
      column += 1
    }

    active.push({ id: item.event.id, end: item.end, column })
    const currentColumns = active.length

    // Update all active entries with the new max column count
    active.forEach(entry => {
      const existing = layoutMap.get(entry.id) ?? {
        column: entry.column,
        columns: 1,
      }
      existing.column = entry.column
      existing.columns = Math.max(existing.columns, currentColumns)
      layoutMap.set(entry.id, existing)
    })
  })

  return layoutMap
}
