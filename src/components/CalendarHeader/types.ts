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
  onMonthChange?: (visibleMonth: Date) => void
  onToggleDatePicker?: (isOpen: boolean) => void
}
