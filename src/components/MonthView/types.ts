import type { CSSProperties, ReactNode } from 'react'
import type { CalendarEventData } from '../CalendarEvent'

export type MonthViewEventClickHandler = (
  event: CalendarEventData,
  date: string
) => void

export type MonthViewDateClickHandler = (date: string) => void

export type MonthViewMoreClickHandler = (
  date: string,
  events: CalendarEventData[]
) => void

export type MonthViewEventRenderer = (params: {
  event: CalendarEventData
  date: string
}) => ReactNode

export type MonthViewCellRenderer = (params: {
  date: string
  events: CalendarEventData[]
  isCurrentMonth: boolean
  isToday: boolean
}) => ReactNode

export type MonthViewDayOfWeekHeaderRenderer = (
  dayOfWeek: number,
  label: string
) => ReactNode

export interface MonthViewProps {
  /** The month to display. @default new Date() */
  currentDate?: Date
  /** Week start day: 0=Sunday, 1=Monday. @default 1 */
  weekStartsOn?: 0 | 1
  /** Calendar events with datetime start/end. */
  events?: CalendarEventData[]
  /** Max events to show per cell before "+N more". @default 3 */
  maxEventsPerCell?: number
  /** Date format for header display. */
  dateFormat?: string
  /** Callback when date navigation changes. */
  onDateChange?: (date: Date) => void
  /** Custom header actions. */
  headerActions?: ReactNode
  /** Show the built-in view switcher in the header. @default false */
  showViewSwitcher?: boolean
  /** Controlled view value for the header switcher. */
  view?: 'day' | 'week' | 'month'
  /** Callback when view changes via the header switcher. */
  onViewChange?: (view: 'day' | 'week' | 'month') => void
  /** Event click handler. */
  onEventClick?: MonthViewEventClickHandler
  /** Date cell click handler. */
  onDateClick?: MonthViewDateClickHandler
  /** "+N more" click handler. */
  onMoreClick?: MonthViewMoreClickHandler
  /** Custom event renderer inside cells. */
  renderEvent?: MonthViewEventRenderer
  /** Custom cell renderer (overrides entire cell content). */
  renderCell?: MonthViewCellRenderer
  /** Custom day-of-week header renderer. */
  renderDayOfWeekHeader?: MonthViewDayOfWeekHeaderRenderer
  /** Root className. */
  className?: string
  /** Root style. */
  style?: CSSProperties
  /** Cell className. */
  cellClassName?: string
  /** Cell style. */
  cellStyle?: CSSProperties
  /** Event item className within cells. */
  eventClassName?: string
  /** Event item style within cells. */
  eventStyle?: CSSProperties
}
