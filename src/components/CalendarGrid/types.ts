import type { ReactNode } from 'react'
import type { CalendarEventData } from '../CalendarEvent'
import type { CalendarCellEmployee } from '../CalendarCell'
import type { EmployeeBlockTimes } from '../../types/blockTime'

export interface CalendarGridDropResult {
  employeeId: string
  start: string
  end: string
}

export type CalendarGridEmployee = CalendarCellEmployee & {
  columnWidth?: number | string
}

export interface CalendarGridProps {
  events?: CalendarEventData[]
  timeSlots?: string[]
  employeeIds?: string[]
  cellHeight?: number
  stepMinutes?: number
  use24HourFormat?: boolean
  blockTimes?: EmployeeBlockTimes
  employees?: CalendarGridEmployee[]
  defaultColumnWidth?: number
  onEventClick?: (
    event: CalendarEventData,
    employee: CalendarCellEmployee
  ) => void
  onEventDrag?: (
    event: CalendarEventData,
    deltaX: number,
    deltaY: number
  ) => void
  onEventDragEnd?: (
    event: CalendarEventData,
    newEmployeeId: string,
    newStart: string
  ) => void
  onEventDrop?: (event: CalendarEventData, next: CalendarGridDropResult) => void
  onTimeLabelClick?: (
    timeLabel: string,
    index: number,
    timeSlot: string,
    employee: CalendarCellEmployee
  ) => void
  renderEvent?: (context: {
    event: CalendarEventData
    isDragging: boolean
  }) => ReactNode
}
