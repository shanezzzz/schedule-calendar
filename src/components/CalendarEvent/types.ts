import type { CSSProperties, ReactNode } from 'react'

export interface CalendarEventData {
  id: string
  title?: string
  start: string
  end: string
  employeeId: string
  color?: string
  description?: string
}

export interface CalendarEventDragMeta {
  delta: { x: number; y: number }
  pointer: { clientX: number; clientY: number }
  bounds: DOMRect | null
}

export interface CalendarEventRenderContext {
  event: CalendarEventData
  isDragging: boolean
}

export type CalendarEventChildren =
  | ReactNode
  | ((context: CalendarEventRenderContext) => ReactNode)

export interface CalendarEventSnapGrid {
  columnWidth: number
  rowHeight: number
}

export interface CalendarEventProps {
  event: CalendarEventData
  style?: CSSProperties
  className?: string
  draggable?: boolean
  isActive?: boolean
  use24HourFormat?: boolean
  employee?: { id: string; name: string }
  children?: CalendarEventChildren
  onClick?: (
    event: CalendarEventData,
    employee: { id: string; name: string }
  ) => void
  onDragStart?: (event: CalendarEventData, meta: CalendarEventDragMeta) => void
  onDrag?: (event: CalendarEventData, meta: CalendarEventDragMeta) => void
  onDragEnd?: (event: CalendarEventData, meta: CalendarEventDragMeta) => void
  snapToGrid?: CalendarEventSnapGrid
  onMouseEnter?: (event: CalendarEventData) => void
  onMouseLeave?: (event: CalendarEventData) => void
  onFocus?: (event: CalendarEventData) => void
  onBlur?: (event: CalendarEventData) => void
}
