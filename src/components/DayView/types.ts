import type { CSSProperties, ReactNode } from 'react'
import type { CalendarEventData } from '../CalendarEvent'
import type { CalendarGridDropResult } from '../CalendarGrid'
import type {
  Employee,
  EmployeeHeaderProps,
  EmployeeRenderer,
} from '../EmployeeHeader'
import type { CalendarBlockTimeRenderContext } from '../CalendarBlockTime'
import type { EmployeeBlockTimes, BlockTime } from '../../types/blockTime'

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

export type DayViewBlockTimeClickHandler = (
  blockTime: BlockTime,
  timeSlot: string,
  employee: DayViewEmployee
) => void

export type DayViewEventRenderer = (params: {
  event: CalendarEventData
  isDragging: boolean
}) => ReactNode

export type DayViewBlockTimeRenderer = (
  context: CalendarBlockTimeRenderContext
) => ReactNode

export interface DayViewEmployeeHeaderProps
  extends Pick<EmployeeHeaderProps, 'className' | 'style' | 'minColumnWidth'> {}

export interface DayViewRef {
  scrollToCurrentTimeLine: () => void
}

export interface DayViewProps {
  /**
   * Start hour of the calendar view (0-23)
   * @default 7
   */
  startHour?: number

  /**
   * End hour of the calendar view (0-23)
   * @default 23
   */
  endHour?: number

  /**
   * Time interval in minutes for each time slot
   * @default 30
   */
  stepMinutes?: number

  /**
   * Height in pixels for each time slot cell
   * @default 40
   */
  cellHeight?: number

  /**
   * Whether to use 24-hour time format
   * @default false (uses 12-hour AM/PM format)
   */
  use24HourFormat?: boolean

  /**
   * Interval in minutes for displaying time labels
   * @default 30
   */
  displayIntervalMinutes?: number

  /**
   * Array of employee IDs to display
   * If not provided and `employees` is also not provided, defaults to ['1', '2', '3', '4', '5', '6', '7']
   * @default undefined
   */
  employeeIds?: string[]

  /**
   * Array of employee objects to display
   * Takes precedence over `employeeIds` if both are provided
   * @default undefined
   */
  employees?: DayViewEmployee[]

  /**
   * Array of calendar events to display
   * @default []
   */
  events?: CalendarEventData[]

  /**
   * Block times for employees (time periods that are blocked/unavailable)
   * @default {}
   */
  blockTimes?: EmployeeBlockTimes

  /**
   * Whether to show the current time indicator line
   * @default true
   */
  showCurrentTimeLine?: boolean

  /**
   * Custom CSS styles for the current time indicator line
   * @default undefined
   */
  currentTimeLineStyle?: CSSProperties

  /**
   * The date to display in the calendar
   * @default new Date()
   */
  currentDate?: Date

  /**
   * Optional Day.js-compatible format string used by the internal
   * `CalendarHeader` for the primary date label.
   *
   * Examples:
   * - 'YYYY/MM/DD'
   * - 'YYYY-MM-DD'
   * - 'MM/DD/YYYY'
   * - 'DD/MM/YYYY'
   * - 'MM/DD'
   *
   * @default undefined
   */
  dateFormat?: string

  /**
   * Width of event elements (can be a number for pixels or string like '100%')
   * @default '100%'
   */
  eventWidth?: number | string

  /**
   * Callback fired when the date is changed via the calendar header
   * @default undefined
   */
  onDateChange?: (date: Date) => void

  /**
   * Custom React node to display in the header actions area
   * @default undefined
   */
  headerActions?: ReactNode

  /**
   * Callback fired when an event is clicked
   * @default undefined
   */
  onEventClick?: DayViewEventClickHandler

  /**
   * Callback fired while an event is being dragged
   * @default undefined
   */
  onEventDrag?: DayViewEventDragHandler

  /**
   * Callback fired when event drag ends
   * @default undefined
   */
  onEventDragEnd?: DayViewEventDragEndHandler

  /**
   * Callback fired when an event is dropped
   * @default undefined
   */
  onEventDrop?: DayViewEventDropHandler

  /**
   * Callback fired when a time label in the calendar grid is clicked
   * @default undefined
   */
  onTimeLabelClick?: DayViewTimeLabelClickHandler

  /**
   * Callback fired when a block time is clicked
   * @default undefined
   */
  onBlockTimeClick?: DayViewBlockTimeClickHandler

  /**
   * Custom renderer for event elements
   * @default undefined
   */
  renderEvent?: DayViewEventRenderer

  /**
   * Custom renderer for block time elements
   * @default undefined
   */
  renderBlockTime?: DayViewBlockTimeRenderer

  /**
   * Custom renderer for employee header cells
   * @default undefined
   */
  renderEmployee?: EmployeeRenderer

  /**
   * Props to pass to the EmployeeHeader component
   * @default undefined
   */
  employeeHeaderProps?: DayViewEmployeeHeaderProps

  /**
   * Custom content to display in the time column header
   * @default undefined
   */
  timeColumnHeaderContent?: ReactNode

  /**
   * Custom renderer for time column slot content
   * @default undefined
   */
  timeColumnSlotContentRenderer?: (time: string, index: number) => ReactNode

  /**
   * Additional CSS class name for the root element
   * @default undefined
   */
  className?: string

  /**
   * Custom CSS styles for the root element
   * @default undefined
   */
  style?: CSSProperties

  /**
   * Custom CSS styles to apply to all event elements
   * @default undefined
   */
  eventStyle?: CSSProperties

  /**
   * Custom CSS class name to apply to all event elements
   * @default undefined
   */
  eventClassName?: string
}
