import type { CSSProperties } from 'react'

export interface CurrentTimeLineProps {
  startHour: number
  endHour: number
  cellHeight: number
  displayIntervalMinutes: number
  isVisible?: boolean
  currentDate?: Date
  style?: CSSProperties
  className?: string
}

export interface CurrentTimeLinePosition {
  top: number
  isInRange: boolean
}
