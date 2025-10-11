import React, { useCallback, useMemo, useRef, useState } from 'react'
import CalendarCell from '@/components/CalendarCell'
import type { CalendarCellEmployee } from '@/components/CalendarCell'
import CalendarEvent from '@/components/CalendarEvent'
import CalendarBlockTime from '@/components/CalendarBlockTime'
import styles from './CalendarGrid.module.scss'
import {
  addMinutesToSlot,
  differenceInMinutes,
  slotToMinutes,
} from '@/utils/util'
import { getEmployeeBlockTimes, isTimeRangeBlocked } from '@/types/blockTime'
import {
  DEFAULT_EMPLOYEE_COLUMN_WIDTH,
  resolveEmployeeColumnTemplate,
} from '@/utils/employeeColumns'
import type {
  CalendarEventData,
  CalendarEventDragMeta,
  CalendarEventRenderContext,
} from '@/components/CalendarEvent'
import type { CalendarGridEmployee, CalendarGridProps } from './types'
import type { BlockTime } from '@/types/blockTime'

const CalendarGrid: React.FC<CalendarGridProps> = ({
  events = [],
  timeSlots = [],
  employeeIds = [],
  cellHeight = 80,
  stepMinutes = 30,
  use24HourFormat = false,
  blockTimes = {},
  employees,
  defaultColumnWidth,
  onEventClick,
  onEventDrag,
  onEventDragEnd,
  onEventDrop,
  onTimeLabelClick,
  onBlockTimeClick,
  renderEvent,
  renderBlockTime,
}) => {
  const displayTimeSlots = useMemo(
    () => (timeSlots.length > 0 ? timeSlots : []),
    [timeSlots]
  )
  const displayEmployeeIds = useMemo(() => {
    if (employeeIds.length > 0) {
      return employeeIds
    }
    if (employees && employees.length > 0) {
      return employees.map(employee => employee.id)
    }
    return []
  }, [employeeIds, employees])
  const eventLayerRef = useRef<HTMLDivElement>(null)
  const [activeEventId, setActiveEventId] = useState<string | null>(null)
  const dragOriginRef = useRef<{
    eventId: string
    columnIndex: number
    rowIndex: number
    startSlot: string
  } | null>(null)

  const hasDragCapability = Boolean(
    onEventDrop || onEventDrag || onEventDragEnd
  )

  const employeeMap = useMemo(() => {
    const map = new Map<string, CalendarGridEmployee>()
    employees?.forEach(employee => {
      map.set(employee.id, employee)
    })
    return map
  }, [employees])

  const resolvedDefaultColumnWidth =
    defaultColumnWidth ?? DEFAULT_EMPLOYEE_COLUMN_WIDTH

  const gridTemplateColumns = useMemo(() => {
    if (displayEmployeeIds.length === 0) {
      return resolveEmployeeColumnTemplate(
        undefined,
        resolvedDefaultColumnWidth
      )
    }

    return displayEmployeeIds
      .map(employeeId => {
        const employee = employeeMap.get(employeeId)
        return resolveEmployeeColumnTemplate(
          employee?.columnWidth,
          resolvedDefaultColumnWidth
        )
      })
      .join(' ')
  }, [displayEmployeeIds, employeeMap, resolvedDefaultColumnWidth])

  const getEmployeeData = useCallback(
    (employeeId: string): CalendarCellEmployee => {
      const matched = employeeMap.get(employeeId)
      if (matched) {
        return { id: matched.id, name: matched.name }
      }
      return { id: employeeId, name: employeeId }
    },
    [employeeMap]
  )

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns,
      gridTemplateRows: `repeat(${displayTimeSlots.length}, ${cellHeight}px)`,
    }),
    [cellHeight, displayTimeSlots.length, gridTemplateColumns]
  )

  const slotIntervalMinutes = useMemo(() => {
    if (displayTimeSlots.length < 2) {
      return stepMinutes > 0 ? stepMinutes : 30
    }

    for (let i = 1; i < displayTimeSlots.length; i += 1) {
      const diff = differenceInMinutes(displayTimeSlots[0], displayTimeSlots[i])
      if (diff > 0) {
        return diff
      }
    }

    return stepMinutes > 0 ? stepMinutes : 30
  }, [displayTimeSlots, stepMinutes])

  const minSlotMinutes = useMemo(() => {
    if (displayTimeSlots.length === 0) {
      return 0
    }
    return slotToMinutes(displayTimeSlots[0]) ?? 0
  }, [displayTimeSlots])

  const eventLayouts = useMemo(() => {
    const layoutMap = new Map<string, { column: number; columns: number }>()

    displayEmployeeIds.forEach(employeeId => {
      const employeeEvents = events
        .filter(evt => evt.employeeId === employeeId)
        .map(evt => {
          const start = slotToMinutes(evt.start)
          if (start === null) {
            return null
          }
          const duration = differenceInMinutes(evt.start, evt.end)
          return {
            start,
            end: start + duration,
            event: evt,
          }
        })
        .filter(
          (
            value
          ): value is {
            start: number
            end: number
            event: CalendarEventData
          } => value !== null
        )
        .sort((a, b) => a.start - b.start)

      const active: Array<{ id: string; end: number; column: number }> = []

      employeeEvents.forEach(item => {
        for (let idx = active.length - 1; idx >= 0; idx -= 1) {
          if (active[idx].end <= item.start) {
            active.splice(idx, 1)
          }
        }

        const usedColumns = new Set(active.map(entry => entry.column))
        let column = 0
        while (usedColumns.has(column)) {
          column += 1
        }

        active.push({ id: item.event.id, end: item.end, column })
        const currentColumns = active.length

        active.forEach(entry => {
          const existing = layoutMap.get(entry.id) ?? {
            column: entry.column,
            columns: 1,
          }
          existing.column = entry.column
          existing.columns = Math.max(existing.columns, currentColumns)
          layoutMap.set(entry.id, existing)
        })
      })
    })

    return layoutMap
  }, [displayEmployeeIds, events])

  const clampIndex = useCallback((value: number, max: number) => {
    if (max <= 0) return 0
    if (value < 0) return 0
    if (value >= max) return max - 1
    return value
  }, [])

  const blockTimeLayouts = useMemo(() => {
    if (displayEmployeeIds.length === 0 || displayTimeSlots.length === 0) {
      return []
    }

    const interval =
      slotIntervalMinutes > 0
        ? slotIntervalMinutes
        : stepMinutes > 0
          ? stepMinutes
          : 30

    const lastSlot = displayTimeSlots[displayTimeSlots.length - 1]
    const lastSlotMinutes = lastSlot ? slotToMinutes(lastSlot) : null
    const scheduleEndMinutes =
      lastSlotMinutes !== null
        ? lastSlotMinutes + interval
        : minSlotMinutes + interval

    const layouts: Array<{
      key: string
      blockTime: BlockTime
      employee: CalendarCellEmployee
      style: React.CSSProperties
    }> = []

    displayEmployeeIds.forEach((employeeId, employeeIndex) => {
      const employeeBlockTimes = getEmployeeBlockTimes(employeeId, blockTimes)
      if (!employeeBlockTimes.length) {
        return
      }

      const employeeData = getEmployeeData(employeeId)

      employeeBlockTimes.forEach(blockTime => {
        const startMinutes = slotToMinutes(blockTime.start)
        const endMinutes = slotToMinutes(blockTime.end)

        if (startMinutes === null || endMinutes === null) {
          return
        }

        const constrainedStart = Math.max(startMinutes, minSlotMinutes)
        const constrainedEnd = Math.min(endMinutes, scheduleEndMinutes)

        if (constrainedEnd <= constrainedStart) {
          return
        }

        const relativeStart = Math.max(0, constrainedStart - minSlotMinutes)
        const baseRowIndex =
          interval > 0 ? Math.floor(relativeStart / interval) : 0
        const clampedRowIndex = clampIndex(
          Number.isFinite(baseRowIndex) ? baseRowIndex : 0,
          displayTimeSlots.length
        )
        const rowStart = clampedRowIndex + 1
        const baseRowStartMinutes = minSlotMinutes + clampedRowIndex * interval
        const offsetMinutes = Math.max(
          0,
          constrainedStart - baseRowStartMinutes
        )
        const visibleDuration = Math.max(constrainedEnd - constrainedStart, 1)
        const totalMinutes = offsetMinutes + visibleDuration
        const rowSpan =
          interval > 0 ? Math.max(1, Math.ceil(totalMinutes / interval)) : 1
        const maxGridLine = displayTimeSlots.length + 1
        const rowEnd = Math.min(maxGridLine, rowStart + rowSpan)
        const marginTop =
          interval > 0 ? (offsetMinutes / interval) * cellHeight : 0
        const heightPx =
          interval > 0 ? (visibleDuration / interval) * cellHeight : cellHeight

        const style: React.CSSProperties = {
          gridColumn: employeeIndex + 1,
          gridRowStart: rowStart,
          gridRowEnd: rowEnd,
          marginTop,
          height: `${Math.max(heightPx, 6)}px`,
          alignSelf: 'start',
          width: '100%',
        }

        layouts.push({
          key: `${employeeId}-${blockTime.id}`,
          blockTime,
          employee: employeeData,
          style,
        })
      })
    })

    return layouts
  }, [
    blockTimes,
    cellHeight,
    clampIndex,
    displayEmployeeIds,
    displayTimeSlots,
    getEmployeeData,
    minSlotMinutes,
    slotIntervalMinutes,
    stepMinutes,
  ])

  const handleBlockTimeOverlayClick = useCallback(
    (blockTime: BlockTime, employee: CalendarCellEmployee) => {
      if (!onBlockTimeClick) {
        return
      }
      onBlockTimeClick(blockTime, blockTime.start, employee)
    },
    [onBlockTimeClick]
  )

  const handleDragStart = useCallback(
    (event: CalendarEventData) => {
      setActiveEventId(event.id)

      const columnIndex = displayEmployeeIds.indexOf(event.employeeId)
      const rowIndex = (() => {
        const directIndex = displayTimeSlots.indexOf(event.start)
        if (directIndex !== -1) {
          return directIndex
        }
        const startMinutes = slotToMinutes(event.start)
        if (startMinutes === null || slotIntervalMinutes <= 0) {
          return -1
        }
        const relative = startMinutes - minSlotMinutes
        const computed = Math.floor(relative / slotIntervalMinutes)
        return Math.max(0, Math.min(displayTimeSlots.length - 1, computed))
      })()

      if (columnIndex !== -1 && rowIndex !== -1) {
        dragOriginRef.current = {
          eventId: event.id,
          columnIndex,
          rowIndex,
          startSlot: event.start,
        }
      } else {
        dragOriginRef.current = null
      }
    },
    [displayEmployeeIds, displayTimeSlots, minSlotMinutes, slotIntervalMinutes]
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
        displayEmployeeIds.length === 0 ||
        displayTimeSlots.length === 0
      ) {
        onEventDragEnd?.(event, event.employeeId, event.start)
        dragOriginRef.current = null
        return
      }

      const containerRect = container.getBoundingClientRect()
      const columnWidth = containerRect.width / displayEmployeeIds.length
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

      const targetColumn = clampIndex(
        origin.columnIndex + columnOffset,
        displayEmployeeIds.length
      )

      const durationMinutes = differenceInMinutes(event.start, event.end)
      const originStartMinutes =
        slotToMinutes(origin.startSlot) ?? minSlotMinutes
      const lastSlot = displayTimeSlots[displayTimeSlots.length - 1]
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
      const targetEmployeeId = displayEmployeeIds[targetColumn]
      const offsetFromMin = clampedStartMinutes - minSlotMinutes
      const baseSlot = displayTimeSlots[0] ?? origin.startSlot
      const targetStart = addMinutesToSlot(baseSlot, offsetFromMin)

      const targetEnd = addMinutesToSlot(targetStart, durationMinutes)

      // 检查目标时间范围是否与 Block Time 重叠
      const employeeBlockTimes = getEmployeeBlockTimes(
        targetEmployeeId,
        blockTimes
      )
      const isTargetBlocked = isTimeRangeBlocked(
        targetStart,
        targetEnd,
        employeeBlockTimes
      )

      if (!isTargetBlocked) {
        onEventDrop?.(event, {
          employeeId: targetEmployeeId,
          start: targetStart,
          end: targetEnd,
        })

        onEventDragEnd?.(event, targetEmployeeId, targetStart)
      } else {
        // 如果目标位置被阻塞，恢复到原始位置
        console.warn('Cannot drop event on blocked time slot')
        onEventDragEnd?.(event, event.employeeId, event.start)
      }
      dragOriginRef.current = null
    },
    [
      cellHeight,
      clampIndex,
      displayEmployeeIds,
      displayTimeSlots,
      blockTimes,
      onEventDragEnd,
      onEventDrop,
      slotIntervalMinutes,
      stepMinutes,
      minSlotMinutes,
    ]
  )

  const renderCalendarEvent = useCallback(
    (calendarEvent: CalendarEventData) => {
      const employeeIndex = displayEmployeeIds.indexOf(calendarEvent.employeeId)

      if (employeeIndex === -1 || displayTimeSlots.length === 0) {
        return null
      }

      const startMinutes = slotToMinutes(calendarEvent.start)
      if (startMinutes === null) {
        return null
      }

      const eventDuration = differenceInMinutes(
        calendarEvent.start,
        calendarEvent.end
      )
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
        displayTimeSlots.length - 1
      )
      const rowStart = clampedRowIndex + 1
      const baseRowStartMinutes = minSlotMinutes + clampedRowIndex * interval
      const offsetMinutes = Math.max(0, startMinutes - baseRowStartMinutes)
      const totalMinutes = offsetMinutes + eventDuration
      const rowSpan =
        interval > 0 ? Math.max(1, Math.ceil(totalMinutes / interval)) : 1
      const maxGridLine = displayTimeSlots.length + 1
      const rowEnd = Math.min(maxGridLine, rowStart + rowSpan)

      const marginTop =
        interval > 0 ? (offsetMinutes / interval) * cellHeight : 0
      const heightPx =
        interval > 0 ? (eventDuration / interval) * cellHeight : cellHeight

      const layoutMeta = eventLayouts.get(calendarEvent.id)
      const overlapGap = 4
      const CellWidth = 94
      const widthPercent = layoutMeta ? CellWidth / layoutMeta.columns : 100
      const widthStyle =
        layoutMeta && layoutMeta.columns > 1
          ? `calc(${widthPercent}% - ${overlapGap}px)`
          : '100%'
      const marginLeftStyle =
        layoutMeta && layoutMeta.columns > 1
          ? `calc(${widthPercent * layoutMeta.column}% + ${layoutMeta.column * overlapGap}px)`
          : undefined

      const style: React.CSSProperties = {
        gridColumn: employeeIndex + 1,
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

      const container = eventLayerRef.current
      const columnWidth =
        container && displayEmployeeIds.length > 0
          ? container.getBoundingClientRect().width / displayEmployeeIds.length
          : 0

      const effectiveStepMinutes =
        stepMinutes > 0 ? stepMinutes : slotIntervalMinutes
      const pixelsPerStep =
        slotIntervalMinutes > 0 && effectiveStepMinutes > 0
          ? (cellHeight * effectiveStepMinutes) / slotIntervalMinutes
          : cellHeight

      const snapToGrid =
        columnWidth > 0 && pixelsPerStep > 0
          ? {
              columnWidth,
              rowHeight: pixelsPerStep,
            }
          : undefined

      // 获取当前事件的员工信息
      const employeeData = getEmployeeData(calendarEvent.employeeId)

      return (
        <CalendarEvent
          key={calendarEvent.id}
          event={calendarEvent}
          style={style}
          draggable={hasDragCapability}
          isActive={activeEventId === calendarEvent.id}
          use24HourFormat={use24HourFormat}
          employee={employeeData}
          snapToGrid={snapToGrid}
          onClick={onEventClick}
          onDragStart={(evt, meta) => {
            handleDragStart(evt)
            handleDrag(evt, meta.delta.x, meta.delta.y)
          }}
          onDrag={(evt, meta) => {
            handleDrag(evt, meta.delta.x, meta.delta.y)
          }}
          onDragEnd={(evt, meta) => handleDragEnd(evt, meta)}
        >
          {renderEvent
            ? (context: CalendarEventRenderContext) =>
                renderEvent({
                  event: context.event,
                  isDragging: context.isDragging,
                })
            : undefined}
        </CalendarEvent>
      )
    },
    [
      activeEventId,
      minSlotMinutes,
      eventLayouts,
      displayEmployeeIds,
      displayTimeSlots,
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
      getEmployeeData,
    ]
  )

  return (
    <div className={styles.calendarGrid}>
      <div className={styles.gridContainer} style={gridStyle}>
        {displayTimeSlots.map((timeSlot, timeIndex) =>
          displayEmployeeIds.map((employeeId, empIndex) => {
            return (
              <CalendarCell
                key={`${timeIndex}-${empIndex}`}
                timeSlot={timeSlot}
                stepMinutes={stepMinutes}
                use24HourFormat={use24HourFormat}
                employeeId={employeeId}
                employee={employeeMap.get(employeeId)}
                onTimeLabelClick={onTimeLabelClick}
              />
            )
          })
        )}
      </div>

      <div className={styles.blockLayer} style={gridStyle}>
        {blockTimeLayouts.map(({ key, blockTime, employee, style }) => (
          <CalendarBlockTime
            key={key}
            blockTime={blockTime}
            employee={employee}
            style={style}
            use24HourFormat={use24HourFormat}
            onClick={onBlockTimeClick ? handleBlockTimeOverlayClick : undefined}
            renderContent={renderBlockTime}
          />
        ))}
      </div>

      <div ref={eventLayerRef} className={styles.eventLayer} style={gridStyle}>
        {events.map(renderCalendarEvent)}
      </div>
    </div>
  )
}

export default CalendarGrid
