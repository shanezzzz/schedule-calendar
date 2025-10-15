import {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react'
import TimeColumn from '@/components/TimeColumn'
import CalendarGrid from '@/components/CalendarGrid'
import CurrentTimeLine from '@/components/CurrentTimeLine'
import styles from './DayView.module.scss'
import EmployeeHeader from '@/components/EmployeeHeader'
import {
  generateTimeSlots,
  calculateSlotHeight,
  performCalendarAutoScroll,
  type CalendarScrollConfig,
} from '@/utils/util'
import CalendarHeader from '@/components/CalendarHeader'
import { DEFAULT_EMPLOYEE_COLUMN_WIDTH } from '@/utils/employeeColumns'
import type { DayViewProps, DayViewEmployee, DayViewRef } from './types'

const DEFAULT_EMPLOYEE_IDS = ['1', '2', '3', '4', '5', '6', '7']

const DayView = forwardRef<DayViewRef, DayViewProps>(
  (
    {
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
      eventWidth = '100%',
      onDateChange,
      headerActions,
      onEventClick,
      onEventDrag,
      onEventDragEnd,
      onEventDrop,
      onTimeLabelClick,
      onBlockTimeClick,
      renderEvent,
      renderBlockTime,
      renderEmployee,
      employeeHeaderProps,
      timeColumnHeaderContent,
      timeColumnSlotContentRenderer,
      className,
      style,
    },
    ref
  ) => {
    // 用于动态获取EmployeeHeader高度的状态和引用
    const [headerHeight, setHeaderHeight] = useState<number>(40) // 默认40px
    const employeeHeaderRef = useRef<HTMLDivElement>(null)

    // 用于滚动控制的引用
    const calendarContainerRef = useRef<HTMLDivElement>(null)

    // 跟踪是否应该执行自动滚动
    const shouldAutoScrollRef = useRef<boolean>(true)
    const previousDateRef = useRef<Date>(currentDate)
    const previousEventsRef = useRef<typeof events>(events)

    const resolvedEmployees = useMemo<DayViewEmployee[]>(() => {
      if (employees && employees.length > 0) {
        return employees
      }
      const sourceIds =
        employeeIds && employeeIds.length > 0
          ? employeeIds
          : DEFAULT_EMPLOYEE_IDS
      return sourceIds.map<DayViewEmployee>(id => ({ id, name: `${id}` }))
    }, [employees, employeeIds])

    const employeeIdsForGrid = useMemo(
      () => resolvedEmployees.map(employee => employee.id),
      [resolvedEmployees]
    )

    const defaultColumnWidth =
      employeeHeaderProps?.minColumnWidth ?? DEFAULT_EMPLOYEE_COLUMN_WIDTH

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

    // 检测新事件
    const detectNewEvents = useCallback(() => {
      const previousEvents = previousEventsRef.current
      const currentEvents = events

      // 如果之前没有事件或现在没有事件，返回空数组
      if (!previousEvents.length || !currentEvents.length) {
        return []
      }

      // 找出新添加的事件（通过ID比较）
      const previousEventIds = new Set(previousEvents.map(event => event.id))
      const newEvents = currentEvents.filter(
        event => !previousEventIds.has(event.id)
      )

      return newEvents
    }, [events])

    // 滚动配置
    const scrollConfig = useMemo<CalendarScrollConfig>(
      () => ({
        startHour,
        endHour,
        displayIntervalMinutes,
        cellHeight: slotsHeight,
        headerHeight,
        scrollMargin: 200,
      }),
      [startHour, endHour, displayIntervalMinutes, slotsHeight, headerHeight]
    )

    // 自动滚动逻辑 - 只在应该滚动时执行
    const handleAutoScroll = useCallback(
      (newEvents?: typeof events) => {
        if (!calendarContainerRef.current || !shouldAutoScrollRef.current) {
          return
        }

        performCalendarAutoScroll(
          calendarContainerRef.current,
          events,
          scrollConfig,
          currentDate,
          newEvents
        )

        // 执行后禁用自动滚动，直到日期变化或新事件
        shouldAutoScrollRef.current = false
      },
      [events, scrollConfig, currentDate]
    )

    // 滚动到当前时间线的专用函数
    const scrollToCurrentTimeLine = useCallback(() => {
      if (!calendarContainerRef.current) {
        return
      }

      performCalendarAutoScroll(
        calendarContainerRef.current,
        [], // 传递空事件数组，只关注当前时间线
        scrollConfig,
        currentDate
      )
    }, [scrollConfig, currentDate])

    // 暴露方法给外部调用
    useImperativeHandle(
      ref,
      () => ({
        scrollToCurrentTimeLine,
      }),
      [scrollToCurrentTimeLine]
    )

    // 监听日期变化，重置自动滚动标志
    useEffect(() => {
      const currentDateStr = currentDate.toDateString()
      const previousDateStr = previousDateRef.current.toDateString()

      // 如果日期发生变化，允许自动滚动
      if (currentDateStr !== previousDateStr) {
        shouldAutoScrollRef.current = true
        previousDateRef.current = currentDate
      }
    }, [currentDate])

    // 检测新事件并触发滚动
    useEffect(() => {
      const newEvents = detectNewEvents()

      if (newEvents.length > 0) {
        // 有新事件时，强制启用滚动并执行
        shouldAutoScrollRef.current = true
        const timer = setTimeout(() => {
          handleAutoScroll(newEvents)
        }, 100)

        // 更新事件引用
        previousEventsRef.current = events

        return () => clearTimeout(timer)
      } else {
        // 更新事件引用
        previousEventsRef.current = events
      }
    }, [events, detectNewEvents, handleAutoScroll])

    // 只在特定条件下触发自动滚动（初始渲染或日期变化）
    useEffect(() => {
      if (shouldAutoScrollRef.current) {
        const timer = setTimeout(() => {
          handleAutoScroll()
        }, 100)

        return () => clearTimeout(timer)
      }
    }, [currentDate, showCurrentTimeLine, handleAutoScroll])

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
        <div className={styles.dayViewContent} ref={calendarContainerRef}>
          <div className={styles.timeColumnArea}>
            <TimeColumn
              cellHeight={slotsHeight}
              timeSlots={timeSlots}
              headerHeight={headerHeight}
              headerContent={timeColumnHeaderContent}
              renderSlotContent={timeColumnSlotContentRenderer}
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
              employees={resolvedEmployees}
              defaultColumnWidth={defaultColumnWidth}
              eventWidth={eventWidth}
              cellHeight={slotsHeight}
              stepMinutes={stepMinutes}
              use24HourFormat={use24HourFormat}
              blockTimes={blockTimes}
              onEventClick={onEventClick}
              onEventDrag={onEventDrag}
              onEventDragEnd={onEventDragEnd}
              onEventDrop={onEventDrop}
              onTimeLabelClick={onTimeLabelClick}
              onBlockTimeClick={onBlockTimeClick}
              renderEvent={renderEvent}
              renderBlockTime={renderBlockTime}
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
)

DayView.displayName = 'DayView'

export default DayView
