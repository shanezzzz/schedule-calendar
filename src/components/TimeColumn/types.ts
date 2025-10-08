import type { ReactNode } from 'react'

export interface TimeColumnProps {
  timeSlots?: string[]
  cellHeight?: number
  headerHeight?: number
  headerContent?: ReactNode
  renderSlotContent?: (time: string, index: number) => ReactNode
}
