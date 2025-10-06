import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import TimeColumn from '../TimeColumn/TimeColumn'
import CalendarGrid from '../CalendarGrid/CalendarGrid'
import CurrentTimeLine from '../CurrentTimeLine/CurrentTimeLine'
import styles from './DayView.module.scss'
import EmployeeHeader, { Employee } from '../EmployeeHeader/EmployeeHeader'
import { generateTimeSlots, calculateSlotHeight } from '../../utils/util'
import { CalendarEventData } from '../CalendarEvent/CalendarEvent'
import CalendarHeader from '../CalendarHeader/CalendarHeader'
import { EmployeeBlockTimes } from '../../types/blockTime'

interface DayViewProps {
  startHour?: number
  endHour?: number
  stepMinutes?: number
  cellHeight?: number
  use24HourFormat?: boolean // true: 24-hour format, false: 12-hour format (AM/PM)
  displayIntervalMinutes?: number // Time label display interval, default 30 minutes, independent of stepMinutes
  employeeIds?: string[]
  events?: CalendarEventData[]
  blockTimes?: EmployeeBlockTimes // 员工阻塞时间映射
  showCurrentTimeLine?: boolean // Whether to show current time line
  currentDate?: Date // Current selected date
  onDateChange?: (date: Date) => void // Callback when date changes
  headerActions?: React.ReactNode // Custom actions for the header
  onEventClick?: (event: CalendarEventData, employee: { id: string; name: string }) => void
  onEventDrag?: (
    event: CalendarEventData,
    deltaX: number,
    deltaY: number
  ) => void
  onEventDragEnd?: (
    event: CalendarEventData,
    newEmployeeId: string,
    newStart: string
  ) => void
  onEventDrop?: (
    event: CalendarEventData,
    next: { employeeId: string; start: string; end: string }
  ) => void
  onTimeLabelClick?: (timeLabel: string, index: number, timeSlot: string, employee: { id: string; name: string }) => void // 时间标签点击回调
  renderEvent?: (params: {
    event: CalendarEventData
    isDragging: boolean
  }) => React.ReactNode
  renderEmployee?: (employee: Employee, index: number) => React.ReactNode
  employeeHeaderProps?: {
    className?: string
    style?: React.CSSProperties
    minColumnWidth?: number
  }
}

const DayView: React.FC<DayViewProps> = ({
  startHour = 7,
  endHour = 23,
  stepMinutes = 30,
  cellHeight = 40,
  use24HourFormat = false, // Default to 12-hour format (AM/PM)
  displayIntervalMinutes = 30, // Default 30-minute interval for time label display
  employeeIds = ['1', '2', '3', '4', '5', '6', '7'],
  events = [],
  blockTimes = {},
  showCurrentTimeLine = true, // Default to show current time line
  currentDate = new Date(),
  onDateChange,
  headerActions,
  onEventClick,
  onEventDrag,
  onEventDragEnd,
  onEventDrop,
  onTimeLabelClick,
  renderEvent,
  renderEmployee,
  employeeHeaderProps,
}) => {
  // 用于动态获取EmployeeHeader高度的状态和引用
  const [headerHeight, setHeaderHeight] = useState<number>(40) // 默认40px
  const employeeHeaderRef = useRef<HTMLDivElement>(null)

  // 监听EmployeeHeader高度变化
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (employeeHeaderRef.current) {
        const height = employeeHeaderRef.current.offsetHeight
        setHeaderHeight(height)
      }
    }

    // 初始设置
    updateHeaderHeight()

    // 使用ResizeObserver监听高度变化
    const resizeObserver = new ResizeObserver(updateHeaderHeight)
    if (employeeHeaderRef.current) {
      resizeObserver.observe(employeeHeaderRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [renderEmployee]) // 当renderEmployee变化时重新监听

  // Generate time slots, ensure consistency with TimeColumn
  const timeSlots = useMemo(() => {
    return generateTimeSlots(
      startHour,
      endHour,
      displayIntervalMinutes,
      use24HourFormat
    )
  }, [startHour, endHour, displayIntervalMinutes, use24HourFormat])

  const slotsHeight = useMemo(() => {
    return calculateSlotHeight(stepMinutes, cellHeight)
  }, [stepMinutes, cellHeight])

  const handleDateChange = useCallback(
    (date: Date) => {
      onDateChange?.(date)
    },
    [onDateChange]
  )

  return (
    <div className={styles.dayView}>
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={handleDateChange}
        actionsSection={headerActions}
      />
      <div className={styles.dayViewContent}>
        <div className={styles.timeColumnArea}>
          <TimeColumn 
            cellHeight={slotsHeight} 
            timeSlots={timeSlots} 
            headerHeight={headerHeight}
          />
        </div>
        <div className={styles.employeeHeaderArea} ref={employeeHeaderRef}>
          <EmployeeHeader
            employees={employeeIds.map(id => ({ id, name: `${id}` }))}
            renderEmployee={renderEmployee}
            {...employeeHeaderProps}
          />
        </div>
        <div className={styles.calendarContainer}>
          <CalendarGrid
            events={events}
            timeSlots={timeSlots}
            employeeIds={employeeIds}
            cellHeight={slotsHeight}
            stepMinutes={stepMinutes}
            use24HourFormat={use24HourFormat}
            blockTimes={blockTimes}
            onEventClick={onEventClick}
            onEventDrag={onEventDrag}
            onEventDragEnd={onEventDragEnd}
            onEventDrop={onEventDrop}
            onTimeLabelClick={onTimeLabelClick}
            renderEvent={renderEvent}
          />
          {showCurrentTimeLine && (
            <CurrentTimeLine
              startHour={startHour}
              endHour={endHour}
              cellHeight={slotsHeight}
              displayIntervalMinutes={displayIntervalMinutes}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default DayView
