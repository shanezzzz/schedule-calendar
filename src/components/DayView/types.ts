import type { CSSProperties, ReactNode } from 'react'
import type { CalendarEventData } from '../CalendarEvent'
import type { CalendarGridDropResult } from '../CalendarGrid'
import type {
  Employee,
  EmployeeHeaderProps,
  EmployeeRenderer,
} from '../EmployeeHeader'
import type { EmployeeBlockTimes } from '../../types/blockTime'

export type DayViewEmployee = Pick<Employee, 'id' | 'name' | 'columnWidth'> &
  Record<string, unknown>

export type DayViewEventClickHandler = (
  event: CalendarEventData,
  employee: DayViewEmployee
) => void

export type DayViewEventDragHandler = (
  event: CalendarEventData,
  deltaX: number,
  deltaY: number
) => void

export type DayViewEventDragEndHandler = (
  event: CalendarEventData,
  newEmployeeId: string,
  newStart: string
) => void

export type DayViewEventDropHandler = (
  event: CalendarEventData,
  next: CalendarGridDropResult
) => void

export type DayViewTimeLabelClickHandler = (
  timeLabel: string,
  index: number,
  timeSlot: string,
  employee: DayViewEmployee
) => void

export type DayViewEventRenderer = (params: {
  event: CalendarEventData
  isDragging: boolean
}) => ReactNode

export interface DayViewEmployeeHeaderProps
  extends Pick<EmployeeHeaderProps, 'className' | 'style' | 'minColumnWidth'> {}

export interface DayViewProps {
  startHour?: number
  endHour?: number
  stepMinutes?: number
  cellHeight?: number
  use24HourFormat?: boolean
  displayIntervalMinutes?: number
  employeeIds?: string[]
  employees?: DayViewEmployee[]
  events?: CalendarEventData[]
  blockTimes?: EmployeeBlockTimes
  showCurrentTimeLine?: boolean
  currentDate?: Date
  onDateChange?: (date: Date) => void
  headerActions?: ReactNode
  onEventClick?: DayViewEventClickHandler
  onEventDrag?: DayViewEventDragHandler
  onEventDragEnd?: DayViewEventDragEndHandler
  onEventDrop?: DayViewEventDropHandler
  onTimeLabelClick?: DayViewTimeLabelClickHandler
  renderEvent?: DayViewEventRenderer
  renderEmployee?: EmployeeRenderer
  employeeHeaderProps?: DayViewEmployeeHeaderProps
  className?: string
  style?: CSSProperties
}
