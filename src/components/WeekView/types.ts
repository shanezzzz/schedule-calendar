import type { CSSProperties, ReactNode } from 'react'
import type { CalendarEventData } from '../CalendarEvent'

export interface WeekViewRef {
  scrollToCurrentTimeLine: () => void
}

export type WeekViewEventClickHandler = (
  event: CalendarEventData,
  date: string
) => void

export type WeekViewEventDropHandler = (
  event: CalendarEventData,
  next: { date: string; start: string; end: string }
) => void

export type WeekViewEventDragHandler = (
  event: CalendarEventData,
  deltaX: number,
  deltaY: number
) => void

export type WeekViewEventDragEndHandler = (
  event: CalendarEventData,
  newDate: string,
  newStart: string
) => void

export type WeekViewCellClickHandler = (timeSlot: string, date: string) => void

export type WeekViewEventRenderer = (params: {
  event: CalendarEventData
  isDragging: boolean
  date: string
}) => ReactNode

export interface WeekViewProps {
  /** Start hour of the day (0-23). @default 7 */
  startHour?: number
  /** End hour of the day (0-23). @default 23 */
  endHour?: number
  /** Time slot interval in minutes. @default 30 */
  stepMinutes?: number
  /** Pixel height per time slot. @default 40 */
  cellHeight?: number
  /** 24-hour format. @default false */
  use24HourFormat?: boolean
  /** Display interval for time labels. @default 30 */
  displayIntervalMinutes?: number
  /** The reference date (any day in the week to display). @default new Date() */
  currentDate?: Date
  /** Day the week starts on: 0=Sunday, 1=Monday. @default 1 */
  weekStartsOn?: 0 | 1
  /** Calendar events with datetime start/end. */
  events?: CalendarEventData[]
  /** Show current time indicator. @default true */
  showCurrentTimeLine?: boolean
  /** Style for current time line. */
  currentTimeLineStyle?: CSSProperties
  /** IANA time zone name used for current time indicator. */
  timeZone?: Intl.DateTimeFormatOptions['timeZone']
  /** Date format for header display. */
  dateFormat?: string
  /** Width of event elements. @default '100%' */
  eventWidth?: number | string
  /** Callback when date changes via header navigation. */
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
  onEventClick?: WeekViewEventClickHandler
  /** Event drag handler. */
  onEventDrag?: WeekViewEventDragHandler
  /** Event drag end handler. */
  onEventDragEnd?: WeekViewEventDragEndHandler
  /** Event drop handler (drag-and-drop). */
  onEventDrop?: WeekViewEventDropHandler
  /** Cell click handler. */
  onCellClick?: WeekViewCellClickHandler
  /** Custom event renderer. */
  renderEvent?: WeekViewEventRenderer
  /** Custom day header renderer. */
  renderDayHeader?: (date: string, dayOfWeek: number) => ReactNode
  /** Custom header content for the time column corner. */
  timeColumnHeaderContent?: ReactNode
  /** Custom renderer for time column slot content. */
  timeColumnSlotContentRenderer?: (time: string, index: number) => ReactNode
  /** Root className. */
  className?: string
  /** Root style. */
  style?: CSSProperties
  /** Event style override. */
  eventStyle?: CSSProperties
  /** Event className override. */
  eventClassName?: string
}
