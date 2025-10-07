import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react'
import TimeColumn from '../TimeColumn'
import CalendarGrid from '../CalendarGrid'
import CurrentTimeLine from '../CurrentTimeLine'
import styles from './DayView.module.scss'
import EmployeeHeader from '../EmployeeHeader'
import { generateTimeSlots, calculateSlotHeight } from '../../utils/util'
import CalendarHeader from '../CalendarHeader'
import type { DayViewProps, DayViewEmployee } from './types'

const DEFAULT_EMPLOYEE_IDS = ['1', '2', '3', '4', '5', '6', '7']

const DayView: React.FC<DayViewProps> = ({
  startHour = 7,
  endHour = 23,
  stepMinutes = 30,
  cellHeight = 40,
  use24HourFormat = false, // Default to 12-hour format (AM/PM)
  displayIntervalMinutes = 30, // Default 30-minute interval for time label display
  employeeIds,
  employees,
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
  className,
  style,
}) => {
  // 用于动态获取EmployeeHeader高度的状态和引用
  const [headerHeight, setHeaderHeight] = useState<number>(40) // 默认40px
  const employeeHeaderRef = useRef<HTMLDivElement>(null)

  const resolvedEmployees = useMemo<DayViewEmployee[]>(() => {
    if (employees && employees.length > 0) {
      return employees
    }
    const sourceIds =
      employeeIds && employeeIds.length > 0 ? employeeIds : DEFAULT_EMPLOYEE_IDS
    return sourceIds.map<DayViewEmployee>(id => ({ id, name: `${id}` }))
  }, [employees, employeeIds])

  const employeeIdsForGrid = useMemo(
    () => resolvedEmployees.map(employee => employee.id),
    [resolvedEmployees]
  )

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
  }, [renderEmployee, resolvedEmployees]) // 当renderEmployee变化时重新监听

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

  const rootClassName = useMemo(() => {
    return [styles.dayView, className].filter(Boolean).join(' ')
  }, [className])

  return (
    <div className={rootClassName} style={style}>
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
            employees={resolvedEmployees}
            renderEmployee={renderEmployee}
            {...(employeeHeaderProps ?? {})}
          />
        </div>
        <div className={styles.calendarContainer}>
          <CalendarGrid
            events={events}
            timeSlots={timeSlots}
            employeeIds={employeeIdsForGrid}
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
              currentDate={currentDate}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default DayView
