import React, { useCallback, useMemo, useRef, useState } from 'react'
import CalendarEvent from '@/components/CalendarEvent'
import type {
  CalendarEventData,
  CalendarEventDragMeta,
  CalendarEventRenderContext,
} from '@/components/CalendarEvent'
import {
  addMinutesToSlot,
  differenceInMinutes,
  slotToMinutes,
} from '@/utils/util'
import { extractTime } from '@/utils/dateUtils'
import { calculateEventOverlapLayout } from '@/utils/eventLayout'
import styles from './WeekViewGrid.module.scss'
import type {
  WeekViewEventClickHandler,
  WeekViewEventDragHandler,
  WeekViewEventDragEndHandler,
  WeekViewEventDropHandler,
  WeekViewCellClickHandler,
  WeekViewEventRenderer,
} from './types'

interface WeekViewGridProps {
  dates: string[]
  eventsByDate: Map<string, CalendarEventData[]>
  timeSlots: string[]
  cellHeight: number
  stepMinutes: number
  use24HourFormat: boolean
  eventWidth?: number | string
  onEventClick?: WeekViewEventClickHandler
  onEventDrag?: WeekViewEventDragHandler
  onEventDragEnd?: WeekViewEventDragEndHandler
  onEventDrop?: WeekViewEventDropHandler
  onCellClick?: WeekViewCellClickHandler
  renderEvent?: WeekViewEventRenderer
  eventStyle?: React.CSSProperties
  eventClassName?: string
}

const WeekViewGrid: React.FC<WeekViewGridProps> = ({
  dates,
  eventsByDate,
  timeSlots,
  cellHeight,
  stepMinutes,
  use24HourFormat,
  eventWidth = '100%',
  onEventClick,
  onEventDrag,
  onEventDragEnd,
  onEventDrop,
  onCellClick,
  renderEvent,
  eventStyle,
  eventClassName,
}) => {
  const eventLayerRef = useRef<HTMLDivElement>(null)
  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const dragOriginRef = useRef<{
    eventId: string
    columnIndex: number
    rowIndex: number
    startSlot: string
    date: string
  } | null>(null)

  const hasDragCapability = Boolean(
    onEventDrop || onEventDrag || onEventDragEnd
  )

  const slotIntervalMinutes = useMemo(() => {
    if (timeSlots.length < 2) {
      return stepMinutes > 0 ? stepMinutes : 30
    }
    for (let i = 1; i < timeSlots.length; i++) {
      const diff = differenceInMinutes(timeSlots[0], timeSlots[i])
      if (diff > 0) return diff
    }
    return stepMinutes > 0 ? stepMinutes : 30
  }, [timeSlots, stepMinutes])

  const minSlotMinutes = useMemo(() => {
    if (timeSlots.length === 0) return 0
    return slotToMinutes(timeSlots[0]) ?? 0
  }, [timeSlots])

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(7, 1fr)`,
      gridTemplateRows: `repeat(${timeSlots.length}, ${cellHeight}px)`,
    }),
    [cellHeight, timeSlots.length]
  )

  // Calculate event layouts per day
  const eventLayouts = useMemo(() => {
    const layoutMap = new Map<string, { column: number; columns: number }>()
    dates.forEach(dateStr => {
      const dayEvents = eventsByDate.get(dateStr) ?? []
      const dayLayouts = calculateEventOverlapLayout(dayEvents)
      dayLayouts.forEach((layout, eventId) => {
        layoutMap.set(eventId, layout)
      })
    })
    return layoutMap
  }, [dates, eventsByDate])

  const clampIndex = useCallback((value: number, max: number) => {
    if (max <= 0) return 0
    if (value < 0) return 0
    if (value >= max) return max - 1
    return value
  }, [])

  const handleDragStart = useCallback(
    (event: CalendarEventData, date: string) => {
      setActiveEventId(event.id)
      const columnIndex = dates.indexOf(date)
      const eventTime = extractTime(event.start)
      const rowIndex = (() => {
        const directIndex = timeSlots.indexOf(eventTime)
        if (directIndex !== -1) return directIndex
        const startMinutes = slotToMinutes(eventTime)
        if (startMinutes === null || slotIntervalMinutes <= 0) return -1
        const relative = startMinutes - minSlotMinutes
        const computed = Math.floor(relative / slotIntervalMinutes)
        return Math.max(0, Math.min(timeSlots.length - 1, computed))
      })()

      if (columnIndex !== -1 && rowIndex !== -1) {
        dragOriginRef.current = {
          eventId: event.id,
          columnIndex,
          rowIndex,
          startSlot: eventTime,
          date,
        }
      } else {
        dragOriginRef.current = null
      }
    },
    [dates, timeSlots, minSlotMinutes, slotIntervalMinutes]
  )

  const handleDrag = useCallback(
    (event: CalendarEventData, deltaX: number, deltaY: number) => {
      onEventDrag?.(event, deltaX, deltaY)
    },
    [onEventDrag]
  )

  const handleDragEnd = useCallback(
    (event: CalendarEventData, meta: CalendarEventDragMeta) => {
      setActiveEventId(null)
      const moved = Math.abs(meta.delta.x) > 1 || Math.abs(meta.delta.y) > 1
      const origin =
        dragOriginRef.current && dragOriginRef.current.eventId === event.id
          ? dragOriginRef.current
          : null
      const container = eventLayerRef.current

      if (
        !moved ||
        !origin ||
        !container ||
        dates.length === 0 ||
        timeSlots.length === 0
      ) {
        onEventDragEnd?.(
          event,
          origin?.date ?? dates[0],
          extractTime(event.start)
        )
        dragOriginRef.current = null
        return
      }

      const containerRect = container.getBoundingClientRect()
      const columnWidth = containerRect.width / 7
      const effectiveStepMinutes =
        stepMinutes > 0 ? stepMinutes : slotIntervalMinutes
      const pixelsPerStep =
        slotIntervalMinutes > 0 && effectiveStepMinutes > 0
          ? (cellHeight * effectiveStepMinutes) / slotIntervalMinutes
          : cellHeight

      const columnOffset =
        columnWidth > 0 ? Math.round(meta.delta.x / columnWidth) : 0
      const stepOffset =
        pixelsPerStep > 0 ? Math.round(meta.delta.y / pixelsPerStep) : 0

      const targetColumn = clampIndex(origin.columnIndex + columnOffset, 7)
      const targetDate = dates[targetColumn]

      const eventTime = extractTime(event.start)
      const eventEndTime = extractTime(event.end)
      const durationMinutes = differenceInMinutes(eventTime, eventEndTime)
      const originStartMinutes =
        slotToMinutes(origin.startSlot) ?? minSlotMinutes
      const lastSlot = timeSlots[timeSlots.length - 1]
      const lastSlotMinutes = slotToMinutes(lastSlot)

      const intervalMinutes =
        effectiveStepMinutes > 0 ? effectiveStepMinutes : 30
      const candidateMinutes = originStartMinutes + stepOffset * intervalMinutes
      const scheduleEndMinutes =
        lastSlotMinutes !== null
          ? lastSlotMinutes + slotIntervalMinutes
          : originStartMinutes + durationMinutes
      const maxStartMinutes = scheduleEndMinutes - durationMinutes

      const clampedStartMinutes = Math.max(
        minSlotMinutes,
        Math.min(candidateMinutes, maxStartMinutes)
      )
      const offsetFromMin = clampedStartMinutes - minSlotMinutes
      const baseSlot = timeSlots[0] ?? origin.startSlot
      const targetStart = addMinutesToSlot(baseSlot, offsetFromMin)
      const targetEnd = addMinutesToSlot(targetStart, durationMinutes)

      onEventDrop?.(event, {
        date: targetDate,
        start: targetStart,
        end: targetEnd,
      })

      onEventDragEnd?.(event, targetDate, targetStart)
      dragOriginRef.current = null
    },
    [
      cellHeight,
      clampIndex,
      dates,
      timeSlots,
      onEventDragEnd,
      onEventDrop,
      slotIntervalMinutes,
      stepMinutes,
      minSlotMinutes,
    ]
  )

  const handleCellClick = useCallback(
    (timeSlot: string, dateIndex: number) => {
      if (!onCellClick) return
      const date = dates[dateIndex]
      if (date) {
        onCellClick(timeSlot, date)
      }
    },
    [dates, onCellClick]
  )

  const renderCalendarEvent = useCallback(
    (calendarEvent: CalendarEventData, dateStr: string, dayIndex: number) => {
      if (timeSlots.length === 0) return null

      const eventTime = extractTime(calendarEvent.start)
      const eventEndTime = extractTime(calendarEvent.end)
      const startMinutes = slotToMinutes(eventTime)
      if (startMinutes === null) return null

      const eventDuration = differenceInMinutes(eventTime, eventEndTime)
      const interval =
        slotIntervalMinutes > 0
          ? slotIntervalMinutes
          : stepMinutes > 0
            ? stepMinutes
            : 30
      const relativeStart = Math.max(0, startMinutes - minSlotMinutes)
      const baseRowIndex =
        interval > 0 ? Math.floor(relativeStart / interval) : 0
      const clampedRowIndex = Math.min(
        Math.max(baseRowIndex, 0),
        timeSlots.length - 1
      )
      const rowStart = clampedRowIndex + 1
      const baseRowStartMinutes = minSlotMinutes + clampedRowIndex * interval
      const offsetMinutes = Math.max(0, startMinutes - baseRowStartMinutes)
      const totalMinutes = offsetMinutes + eventDuration
      const rowSpan =
        interval > 0 ? Math.max(1, Math.ceil(totalMinutes / interval)) : 1
      const maxGridLine = timeSlots.length + 1
      const rowEnd = Math.min(maxGridLine, rowStart + rowSpan)

      const marginTop =
        interval > 0 ? (offsetMinutes / interval) * cellHeight : 0
      const heightPx =
        interval > 0 ? (eventDuration / interval) * cellHeight : cellHeight

      const layoutMeta = eventLayouts.get(calendarEvent.id)
      const overlapGap = 4

      const widthPercent = (() => {
        if (typeof eventWidth === 'number') {
          return layoutMeta ? eventWidth / layoutMeta.columns : eventWidth
        }
        return 100
      })()
      const widthStyle = (() => {
        if (typeof eventWidth === 'string') {
          if (layoutMeta && layoutMeta.columns > 1) {
            const widthPerColumn = `(${eventWidth}) / ${layoutMeta.columns}`
            return `calc(${widthPerColumn} - ${overlapGap}px)`
          }
          return eventWidth
        }
        return layoutMeta && layoutMeta.columns > 1
          ? `calc(${widthPercent}% - ${overlapGap}px)`
          : `${eventWidth}%`
      })()
      const marginLeftStyle = (() => {
        if (!layoutMeta || layoutMeta.columns <= 1) return undefined
        if (typeof eventWidth === 'string') {
          const widthPerColumn = `(${eventWidth}) / ${layoutMeta.columns}`
          return `calc(${widthPerColumn} * ${layoutMeta.column} + ${layoutMeta.column * overlapGap}px)`
        }
        return `calc(${widthPercent * layoutMeta.column}% + ${layoutMeta.column * overlapGap}px)`
      })()

      const style: React.CSSProperties = {
        gridColumn: dayIndex + 1,
        gridRowStart: rowStart,
        gridRowEnd: rowEnd,
        marginTop,
        height: `${Math.max(heightPx, 6)}px`,
        alignSelf: 'start',
        width: widthStyle,
      }

      if (marginLeftStyle) {
        style.marginLeft = marginLeftStyle
      }

      if (eventStyle) {
        Object.assign(style, eventStyle)
      }

      const container = eventLayerRef.current
      const columnWidth = container
        ? container.getBoundingClientRect().width / 7
        : 0
      const effectiveStepMinutes =
        stepMinutes > 0 ? stepMinutes : slotIntervalMinutes
      const pixelsPerStep =
        slotIntervalMinutes > 0 && effectiveStepMinutes > 0
          ? (cellHeight * effectiveStepMinutes) / slotIntervalMinutes
          : cellHeight

      const snapToGrid =
        columnWidth > 0 && pixelsPerStep > 0
          ? { columnWidth, rowHeight: pixelsPerStep }
          : undefined

      const draggable = hasDragCapability
      const childrenContent = renderEvent
        ? (context: CalendarEventRenderContext) =>
            renderEvent({
              event: context.event,
              isDragging: context.isDragging,
              date: dateStr,
            })
        : undefined

      return (
        <CalendarEvent
          key={calendarEvent.id}
          event={calendarEvent}
          style={style}
          className={eventClassName}
          draggable={draggable}
          isActive={activeEventId === calendarEvent.id}
          use24HourFormat={use24HourFormat}
          snapToGrid={snapToGrid}
          onClick={
            onEventClick ? event => onEventClick(event, dateStr) : undefined
          }
          onDragStart={(evt, meta) => {
            handleDragStart(evt, dateStr)
            handleDrag(evt, meta.delta.x, meta.delta.y)
          }}
          onDrag={(evt, meta) => {
            handleDrag(evt, meta.delta.x, meta.delta.y)
          }}
          onDragEnd={(evt, meta) => handleDragEnd(evt, meta)}
        >
          {childrenContent}
        </CalendarEvent>
      )
    },
    [
      activeEventId,
      minSlotMinutes,
      eventLayouts,
      timeSlots,
      handleDrag,
      handleDragEnd,
      handleDragStart,
      hasDragCapability,
      onEventClick,
      renderEvent,
      slotIntervalMinutes,
      cellHeight,
      stepMinutes,
      use24HourFormat,
      eventWidth,
      eventStyle,
      eventClassName,
    ]
  )

  // Build event nodes
  const eventNodes: React.ReactNode[] = []
  dates.forEach((dateStr, dayIndex) => {
    const dayEvents = eventsByDate.get(dateStr) ?? []
    dayEvents.forEach(event => {
      const node = renderCalendarEvent(event, dateStr, dayIndex)
      if (node) eventNodes.push(node)
    })
  })

  return (
    <div className={styles.weekGrid}>
      {/* Grid cells layer */}
      <div className={styles.gridContainer} style={gridStyle}>
        {timeSlots.map((timeSlot, timeIndex) =>
          dates.map((_dateStr, dayIndex) => (
            <button
              key={`${timeIndex}-${dayIndex}`}
              className={styles.gridCell}
              type="button"
              onClick={() => handleCellClick(timeSlot, dayIndex)}
              tabIndex={-1}
            />
          ))
        )}
      </div>

      {/* Event layer */}
      <div ref={eventLayerRef} className={styles.eventLayer} style={gridStyle}>
        {eventNodes}
      </div>
    </div>
  )
}

export default WeekViewGrid
