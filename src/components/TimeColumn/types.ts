import type { ReactNode } from 'react'

export interface TimeColumnProps {
  timeSlots?: string[]
  cellHeight?: number
  headerHeight?: number
  headerContent?: ReactNode
  renderSlotContent?: (time: string, index: number) => ReactNode
  /**
   * Whether to show the current time indicator pill aligned with the current time line
   */
  showCurrentTimeIndicator?: boolean
  /**
   * Start hour of the day view, used to calculate the current time position
   */
  startHour?: number
  /**
   * End hour of the day view, used to calculate the current time position
   */
  endHour?: number
  /**
   * Interval minutes between displayed time slots, used for vertical positioning
   */
  displayIntervalMinutes?: number
  /**
   * The current date displayed in the calendar, used to determine if the indicator should be visible
   */
  currentDate?: Date
  /**
   * Whether to use 24-hour format for the current time label, keeping consistent with time labels
   */
  use24HourFormat?: boolean
}
