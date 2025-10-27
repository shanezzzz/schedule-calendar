import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CalendarCell from '@/components/CalendarCell'
import type { CalendarCellEmployee } from '@/components/CalendarCell'
import CalendarEvent from '@/components/CalendarEvent'
import CalendarBlockTime from '@/components/CalendarBlockTime'
import styles from './CalendarGrid.module.scss'
import {
  addMinutesToSlot,
  differenceInMinutes,
  slotToMinutes,
  formatTime,
  parseTimeSlot,
  timeValueToDate,
} from '@/utils/util'
import { getEmployeeBlockTimes, isTimeRangeBlocked } from '@/types/blockTime'
import {
  DEFAULT_EMPLOYEE_COLUMN_WIDTH,
  resolveEmployeeColumnTemplate,
} from '@/utils/employeeColumns'
import type {
  CalendarEventChildren,
  CalendarEventData,
  CalendarEventDragMeta,
  CalendarEventRenderContext,
} from '@/components/CalendarEvent'
import type { CalendarGridEmployee, CalendarGridProps } from './types'
import type { BlockTime } from '@/types/blockTime'

type EventCluster = {
  id: string
  employeeId: string
  events: CalendarEventData[]
}

interface RenderOptions {
  disableDrag?: boolean
  disableClick?: boolean
  overrideChildren?: CalendarEventChildren
  onMouseEnter?: (event: CalendarEventData) => void
  onMouseLeave?: (event: CalendarEventData) => void
  className?: string
  styleOverrides?: React.CSSProperties
}

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
  eventWidth = 88,
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
  const [expandedClusterId, setExpandedClusterId] = useState<string | null>(
    null
  )
  const collapseTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  )
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

  const eventsByEmployee = useMemo(() => {
    const map = new Map<string, CalendarEventData[]>()

    displayEmployeeIds.forEach(employeeId => {
      map.set(employeeId, [])
    })

    events.forEach(calendarEvent => {
      const collection = map.get(calendarEvent.employeeId)
      if (!collection) {
        return
      }
      collection.push(calendarEvent)
    })

    map.forEach(list => {
      list.sort((a, b) => {
        const startA = slotToMinutes(a.start)
        const startB = slotToMinutes(b.start)
        if (startA === null && startB === null) return 0
        if (startA === null) return 1
        if (startB === null) return -1
        return startA - startB
      })
    })

    return map
  }, [displayEmployeeIds, events])

  const eventClusters = useMemo(() => {
    const map = new Map<string, EventCluster[]>()

    displayEmployeeIds.forEach(employeeId => {
      const employeeEvents = eventsByEmployee.get(employeeId) ?? []
      const clusters: EventCluster[] = []
      let clusterCounter = 0
      let currentCluster: EventCluster | null = null
      let currentClusterEnd: number | null = null

      employeeEvents.forEach(calendarEvent => {
        const startMinutes = slotToMinutes(calendarEvent.start)
        const endMinutes = slotToMinutes(calendarEvent.end)

        if (startMinutes === null || endMinutes === null) {
          clusterCounter += 1
          clusters.push({
            id: `${employeeId}-cluster-${clusterCounter}`,
            employeeId,
            events: [calendarEvent],
          })
          currentCluster = null
          currentClusterEnd = null
          return
        }

        if (
          currentCluster === null ||
          currentClusterEnd === null ||
          startMinutes >= currentClusterEnd
        ) {
          clusterCounter += 1
          currentCluster = {
            id: `${employeeId}-cluster-${clusterCounter}`,
            employeeId,
            events: [calendarEvent],
          }
          currentClusterEnd = endMinutes
          clusters.push(currentCluster)
          return
        }

        currentCluster.events.push(calendarEvent)
        currentClusterEnd = Math.max(currentClusterEnd, endMinutes)
      })

      map.set(employeeId, clusters)
    })

    return map
  }, [displayEmployeeIds, eventsByEmployee])

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

  const formatClusterTimeRange = useCallback(
    (startSlot: string, endSlot: string) => {
      const startParsed = parseTimeSlot(startSlot)
      const endParsed = parseTimeSlot(endSlot)

      const startLabel =
        startParsed.success && startParsed.data
          ? formatTime(timeValueToDate(startParsed.data), use24HourFormat)
          : startSlot

      const endLabel =
        endParsed.success && endParsed.data
          ? formatTime(timeValueToDate(endParsed.data), use24HourFormat)
          : endSlot

      return `${startLabel} - ${endLabel}`
    },
    [use24HourFormat]
  )

  const clearCollapseTimer = useCallback((clusterId: string) => {
    const timers = collapseTimersRef.current
    const timerId = timers.get(clusterId)
    if (timerId) {
      clearTimeout(timerId)
      timers.delete(clusterId)
    }
  }, [])

  const scheduleCollapse = useCallback(
    (clusterId: string) => {
      const timers = collapseTimersRef.current
      const existing = timers.get(clusterId)
      if (existing) {
        clearTimeout(existing)
      }

      const timerId = setTimeout(() => {
        setExpandedClusterId(prev => (prev === clusterId ? null : prev))
        timers.delete(clusterId)
      }, 150)

      timers.set(clusterId, timerId)
    },
    [setExpandedClusterId]
  )

  useEffect(() => {
    const timers = collapseTimersRef.current

    return () => {
      timers.forEach(timerId => {
        clearTimeout(timerId)
      })
      timers.clear()
    }
  }, [])

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
    (calendarEvent: CalendarEventData, options?: RenderOptions) => {
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

      // 解析eventWidth，支持数字（百分比）和字符串（如'calc(90% - 10px)'）
      const widthPercent = (() => {
        if (typeof eventWidth === 'number') {
          return layoutMeta ? eventWidth / layoutMeta.columns : eventWidth
        }
        // 对于字符串类型，不进行数值计算
        return 100 // 默认值，实际不会使用到
      })()
      const widthStyle = (() => {
        if (typeof eventWidth === 'string') {
          // 如果是字符串（如CSS calc表达式），直接使用
          return layoutMeta && layoutMeta.columns > 1
            ? `calc((${eventWidth}) / ${layoutMeta.columns} - ${overlapGap}px)`
            : eventWidth
        } else {
          // 如果是数字，按百分比处理
          return layoutMeta && layoutMeta.columns > 1
            ? `calc(${widthPercent}% - ${overlapGap}px)`
            : `${eventWidth}%`
        }
      })()
      const marginLeftStyle = (() => {
        if (!layoutMeta || layoutMeta.columns <= 1) return undefined

        if (typeof eventWidth === 'string') {
          // 对于字符串类型的eventWidth，简化处理，仅使用重叠间隙
          return `${layoutMeta.column * overlapGap}px`
        } else {
          // 对于数字类型，使用百分比 + 间隙
          return `calc(${widthPercent * layoutMeta.column}% + ${layoutMeta.column * overlapGap}px)`
        }
      })()

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

      if (options?.styleOverrides) {
        Object.assign(style, options.styleOverrides)
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

      const draggable = options?.disableDrag ? false : hasDragCapability
      const clickHandler = options?.disableClick ? undefined : onEventClick
      const childrenContent =
        options?.overrideChildren ??
        (renderEvent
          ? (context: CalendarEventRenderContext) =>
              renderEvent({
                event: context.event,
                isDragging: context.isDragging,
              })
          : undefined)

      return (
        <CalendarEvent
          key={calendarEvent.id}
          event={calendarEvent}
          style={style}
          className={options?.className}
          draggable={draggable}
          isActive={activeEventId === calendarEvent.id}
          use24HourFormat={use24HourFormat}
          employee={employeeData}
          snapToGrid={snapToGrid}
          onClick={clickHandler}
          onDragStart={(evt, meta) => {
            handleDragStart(evt)
            handleDrag(evt, meta.delta.x, meta.delta.y)
          }}
          onDrag={(evt, meta) => {
            handleDrag(evt, meta.delta.x, meta.delta.y)
          }}
          onDragEnd={(evt, meta) => handleDragEnd(evt, meta)}
          onMouseEnter={options?.onMouseEnter}
          onMouseLeave={options?.onMouseLeave}
        >
          {childrenContent}
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
      eventWidth,
    ]
  )

  const eventNodes: React.ReactNode[] = []

  displayEmployeeIds.forEach(employeeId => {
    const clusters = eventClusters.get(employeeId) ?? []
    clusters.forEach(cluster => {
      const clusterId = cluster.id
      const clusterEvents = cluster.events
      const hasMultiple = clusterEvents.length > 1
      const isExpanded = expandedClusterId === clusterId

      if (!hasMultiple) {
        const singleEvent = clusterEvents[0]
        if (!singleEvent) {
          return
        }

        const node = renderCalendarEvent(singleEvent, {
          onMouseEnter: () => clearCollapseTimer(clusterId),
          onMouseLeave: () => scheduleCollapse(clusterId),
        })

        if (node) {
          eventNodes.push(node)
        }
        return
      }

      if (!isExpanded) {
        const primaryEvent = clusterEvents[0]
        if (!primaryEvent) {
          return
        }

        const accentColor = primaryEvent.color ?? '#2563eb'
        const clusterStart = clusterEvents.reduce((earliest, current) => {
          const earliestMinutes = slotToMinutes(earliest)
          const currentMinutes = slotToMinutes(current.start)
          if (earliestMinutes === null && currentMinutes === null) {
            return earliest
          }
          if (earliestMinutes === null) {
            return current.start
          }
          if (currentMinutes === null) {
            return earliest
          }
          return currentMinutes < earliestMinutes ? current.start : earliest
        }, primaryEvent.start)

        const clusterEndSlot = clusterEvents.reduce((latest, current) => {
          const latestMinutes = slotToMinutes(latest)
          const currentMinutes = slotToMinutes(current.end)
          if (latestMinutes === null && currentMinutes === null) {
            return latest
          }
          if (latestMinutes === null) {
            return current.end
          }
          if (currentMinutes === null) {
            return latest
          }
          return currentMinutes > latestMinutes ? current.end : latest
        }, primaryEvent.end)

        const aggregateTitle = primaryEvent.title
          ? `${primaryEvent.title} +${clusterEvents.length - 1}`
          : `${clusterEvents.length} events`

        const aggregatedEvent: CalendarEventData = {
          id: `cluster-${clusterId}`,
          employeeId,
          start: clusterStart,
          end: clusterEndSlot,
          title: aggregateTitle,
        }

        const summaryContent = (
          <div className={styles.eventCluster}>
            <span className={styles.eventClusterBadge}>
              +{clusterEvents.length} Events
            </span>
            <div className={styles.eventClusterTitle}>
              {primaryEvent.title ?? 'Multiple events'}
            </div>
            <div className={styles.eventClusterMeta}>
              <span>
                {formatClusterTimeRange(clusterStart, clusterEndSlot)}
              </span>
            </div>
            <div className={styles.eventClusterHint}>
              Aggregate view · hover to expand
            </div>
          </div>
        )

        const node = renderCalendarEvent(aggregatedEvent, {
          disableDrag: true,
          disableClick: true,
          overrideChildren: summaryContent,
          className: styles.eventClusterCard,
          styleOverrides: {
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(226, 232, 240, 0.92) 100%)',
            border: `1px dashed ${accentColor}`,
            boxShadow: '0 12px 28px rgba(37, 99, 235, 0.25)',
            color: '#0f172a',
          },
          onMouseEnter: () => {
            clearCollapseTimer(clusterId)
            setExpandedClusterId(clusterId)
          },
          onMouseLeave: () => scheduleCollapse(clusterId),
        })

        if (node) {
          eventNodes.push(node)
        }
        return
      }

      clusterEvents.forEach(event => {
        const node = renderCalendarEvent(event, {
          onMouseEnter: () => {
            clearCollapseTimer(clusterId)
            setExpandedClusterId(clusterId)
          },
          onMouseLeave: () => scheduleCollapse(clusterId),
        })

        if (node) {
          eventNodes.push(node)
        }
      })
    })
  })

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
        {eventNodes}
      </div>
    </div>
  )
}

export default CalendarGrid
