import type { CSSProperties, ReactNode } from 'react'
import type { CalendarEventData } from '../CalendarEvent'
import type { DayViewProps } from '../DayView'
import type { WeekViewProps } from '../WeekView'
import type { MonthViewProps } from '../MonthView'

export type ScheduleCalendarView = 'day' | 'week' | 'month'

export interface ScheduleCalendarProps {
  /** Controlled view mode. */
  view?: ScheduleCalendarView
  /** Uncontrolled initial view. @default 'day' */
  defaultView?: ScheduleCalendarView
  /** View change callback. */
  onViewChange?: (view: ScheduleCalendarView) => void
  /** The date to display. @default new Date() */
  currentDate?: Date
  /** Callback when date changes via header navigation. */
  onDateChange?: (date: Date) => void
  /** Calendar events (shared across views). */
  events?: CalendarEventData[]
  /** Week start day (0=Sunday, 1=Monday). @default 1 */
  weekStartsOn?: 0 | 1
  /** IANA time zone name used for current time indicator. */
  timeZone?: Intl.DateTimeFormatOptions['timeZone']
  /** Custom header actions. */
  headerActions?: ReactNode
  /** Date format for header display. */
  dateFormat?: string
  /** Show the built-in view switcher in the header. @default true */
  showViewSwitcher?: boolean
  /** Root className passed to the active view. */
  className?: string
  /** Root style passed to the active view. */
  style?: CSSProperties
  /** Extra props for DayView (excluding shared props). */
  dayViewProps?: Omit<
    DayViewProps,
    | 'currentDate'
    | 'onDateChange'
    | 'headerActions'
    | 'dateFormat'
    | 'events'
    | 'className'
    | 'style'
    | 'showViewSwitcher'
    | 'view'
    | 'onViewChange'
    | 'timeZone'
  >
  /** Extra props for WeekView (excluding shared props). */
  weekViewProps?: Omit<
    WeekViewProps,
    | 'currentDate'
    | 'onDateChange'
    | 'headerActions'
    | 'dateFormat'
    | 'events'
    | 'className'
    | 'style'
    | 'showViewSwitcher'
    | 'view'
    | 'onViewChange'
    | 'weekStartsOn'
    | 'timeZone'
  >
  /** Extra props for MonthView (excluding shared props). */
  monthViewProps?: Omit<
    MonthViewProps,
    | 'currentDate'
    | 'onDateChange'
    | 'headerActions'
    | 'dateFormat'
    | 'events'
    | 'className'
    | 'style'
    | 'showViewSwitcher'
    | 'view'
    | 'onViewChange'
    | 'weekStartsOn'
    | 'timeZone'
  >
}
