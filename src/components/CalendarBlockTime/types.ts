import type { CSSProperties, ReactNode } from 'react'
import type { BlockTime } from '@/types/blockTime'
import type { CalendarCellEmployee } from '@/components/CalendarCell'

export interface CalendarBlockTimeRenderContext {
  blockTime: BlockTime
  employee: CalendarCellEmployee
}

export interface CalendarBlockTimeProps {
  blockTime: BlockTime
  employee: CalendarCellEmployee
  style?: CSSProperties
  className?: string
  use24HourFormat?: boolean
  onClick?: (blockTime: BlockTime, employee: CalendarCellEmployee) => void
  renderContent?: (context: CalendarBlockTimeRenderContext) => ReactNode
}
