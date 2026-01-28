import type { ReactNode } from 'react'

export interface CalendarHeaderProps {
  currentDate?: Date
  onDateChange?: (date: Date) => void
  className?: string
  actionsSection?: ReactNode
  formatDateLabel?: (date: Date) => string
  /**
   * Optional Day.js-compatible format string for the main date label.
   * Ignored when `formatDateLabel` is provided.
   *
   * Examples:
   * - 'YYYY/MM/DD'
   * - 'YYYY-MM-DD'
   * - 'MM/DD/YYYY'
   * - 'DD/MM/YYYY'
   * - 'MM/DD'
   */
  dateFormat?: string
  /**
   * Navigation step unit for prev/next buttons.
   * - 'day': navigate one day at a time (default)
   * - 'week': navigate one week at a time
   * - 'month': navigate one month at a time
   * @default 'day'
   */
  navigationUnit?: 'day' | 'week' | 'month'
  /**
   * Day the week starts on for week-related navigation and pickers.
   * 0 = Sunday, 1 = Monday
   * @default 1
   */
  weekStartsOn?: 0 | 1
  onMonthChange?: (visibleMonth: Date) => void
  onToggleDatePicker?: (isOpen: boolean) => void
}
