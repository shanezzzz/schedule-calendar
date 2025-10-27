import React, { useCallback, useMemo, useRef, useState } from 'react'
import styles from './CalendarEvent.module.scss'
import { formatTime, parseTimeSlot, timeValueToDate } from '../../utils/util'
import type { CalendarEventDragMeta, CalendarEventProps } from './types'

const DRAG_ACTIVATION_THRESHOLD = 2

const CalendarEvent: React.FC<CalendarEventProps> = ({
  event,
  style,
  className,
  draggable = false,
  isActive = false,
  use24HourFormat = false,
  employee,
  children,
  onClick,
  onDragStart,
  onDrag,
  onDragEnd,
  snapToGrid,
  onMouseEnter,
  onMouseLeave,
  onFocus,
  onBlur,
}) => {
  const eventRef = useRef<HTMLDivElement>(null)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const dragDeltaRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const hasMovedRef = useRef(false)

  const [isDragging, setIsDragging] = useState(false)
  const [dragDelta, setDragDelta] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  })

  const buildDragMeta = useCallback(
    (pointer: { clientX: number; clientY: number }): CalendarEventDragMeta => ({
      delta: dragDeltaRef.current,
      pointer,
      bounds: eventRef.current
        ? eventRef.current.getBoundingClientRect()
        : null,
    }),
    []
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggable || e.button !== 0) {
        return
      }

      e.preventDefault()
      e.stopPropagation()

      pointerStartRef.current = { x: e.clientX, y: e.clientY }
      dragDeltaRef.current = { x: 0, y: 0 }
      hasMovedRef.current = false

      setIsDragging(true)
      setDragDelta({ x: 0, y: 0 })

      eventRef.current?.setPointerCapture(e.pointerId)

      onDragStart?.(
        event,
        buildDragMeta({ clientX: e.clientX, clientY: e.clientY })
      )
    },
    [buildDragMeta, draggable, event, onDragStart]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (
        !draggable ||
        !pointerStartRef.current ||
        !eventRef.current?.hasPointerCapture(e.pointerId)
      ) {
        return
      }

      e.preventDefault()

      const deltaX = e.clientX - pointerStartRef.current.x
      const deltaY = e.clientY - pointerStartRef.current.y
      let adjustedDelta = { x: deltaX, y: deltaY }

      if (snapToGrid) {
        const { columnWidth, rowHeight } = snapToGrid
        const snappedX =
          columnWidth > 0
            ? Math.round(deltaX / columnWidth) * columnWidth
            : deltaX
        const snappedY =
          rowHeight > 0 ? Math.round(deltaY / rowHeight) * rowHeight : deltaY
        adjustedDelta = { x: snappedX, y: snappedY }
      }

      dragDeltaRef.current = adjustedDelta
      setDragDelta(adjustedDelta)

      if (!hasMovedRef.current) {
        hasMovedRef.current =
          Math.abs(deltaX) > DRAG_ACTIVATION_THRESHOLD ||
          Math.abs(deltaY) > DRAG_ACTIVATION_THRESHOLD
      }

      onDrag?.(event, buildDragMeta({ clientX: e.clientX, clientY: e.clientY }))
    },
    [buildDragMeta, draggable, event, onDrag, snapToGrid]
  )

  const finishDrag = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggable || !pointerStartRef.current) {
        return
      }

      const meta = buildDragMeta({ clientX: e.clientX, clientY: e.clientY })

      pointerStartRef.current = null

      eventRef.current?.releasePointerCapture(e.pointerId)

      const moved = hasMovedRef.current
      hasMovedRef.current = false

      onDragEnd?.(event, meta)
      if (!moved) {
        // 构建 employee 数据，优先使用传入的 employee，否则根据 event.employeeId 构建
        const employeeData = employee || {
          id: event.employeeId,
          name: event.employeeId,
        }
        onClick?.(event, employeeData)
      }

      dragDeltaRef.current = { x: 0, y: 0 }
      setIsDragging(false)
      setDragDelta({ x: 0, y: 0 })
    },
    [buildDragMeta, draggable, event, employee, onClick, onDragEnd]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      finishDrag(e)
    },
    [finishDrag]
  )

  const handlePointerCancel = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      finishDrag(e)
    },
    [finishDrag]
  )

  const finalClassName = useMemo(() => {
    const classNames = [styles.calendarEvent]
    if (className) classNames.push(className)
    if (isDragging || isActive) classNames.push(styles.active)
    return classNames.join(' ')
  }, [className, isActive, isDragging])

  const finalStyle = useMemo(() => {
    const baseStyle: React.CSSProperties = {
      ...style,
      cursor: draggable ? 'grab' : style?.cursor,
      willChange: 'transform',
    }

    if (isDragging) {
      const translate = `translate3d(${dragDelta.x}px, ${dragDelta.y}px, 0)`
      baseStyle.transform = style?.transform
        ? `${style.transform} ${translate}`.trim()
        : translate
      baseStyle.zIndex = Math.max(
        typeof style?.zIndex === 'number' ? style.zIndex : 10,
        100
      )
      baseStyle.transition = 'none'
    }

    if (event.color) {
      baseStyle.backgroundColor = event.color
    }

    return baseStyle
  }, [dragDelta.x, dragDelta.y, draggable, event.color, isDragging, style])

  const defaultContent = useMemo(() => {
    const startParsed = parseTimeSlot(event.start)
    const endParsed = parseTimeSlot(event.end)

    const startLabel =
      startParsed.success && startParsed.data
        ? formatTime(timeValueToDate(startParsed.data), use24HourFormat)
        : event.start

    const endLabel =
      endParsed.success && endParsed.data
        ? formatTime(timeValueToDate(endParsed.data), use24HourFormat)
        : event.end

    return (
      <div className={styles.eventContent}>
        {event.title && <div className={styles.eventTitle}>{event.title}</div>}
        <div className={styles.eventTime}>
          {startLabel} - {endLabel}
        </div>
        {event.description && (
          <div className={styles.eventDescription}>{event.description}</div>
        )}
      </div>
    )
  }, [event.description, event.end, event.start, event.title, use24HourFormat])

  const renderedChildren = useMemo(() => {
    if (typeof children === 'function') {
      return children({ event, isDragging })
    }

    if (children) {
      return children
    }

    return defaultContent
  }, [children, defaultContent, event, isDragging])

  return (
    <div
      ref={eventRef}
      className={finalClassName}
      style={finalStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onMouseEnter={() => {
        onMouseEnter?.(event)
      }}
      onMouseLeave={() => {
        onMouseLeave?.(event)
      }}
      onFocus={() => {
        onFocus?.(event)
      }}
      onBlur={() => {
        onBlur?.(event)
      }}
      role="button"
      tabIndex={0}
      aria-label={event.title || `${event.start} - ${event.end}`}
    >
      {renderedChildren}
    </div>
  )
}

export default CalendarEvent
