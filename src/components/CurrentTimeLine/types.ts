export interface CurrentTimeLineProps {
  startHour: number
  endHour: number
  cellHeight: number
  displayIntervalMinutes: number
  isVisible?: boolean
  currentDate?: Date
}

export interface CurrentTimeLinePosition {
  top: number
  isInRange: boolean
}
