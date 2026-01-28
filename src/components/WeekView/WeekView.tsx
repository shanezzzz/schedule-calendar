import {
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react'
import dayjs from 'dayjs'
import TimeColumn from '@/components/TimeColumn'
import CurrentTimeLine from '@/components/CurrentTimeLine'
import CalendarHeader from '@/components/CalendarHeader'
import {
  generateTimeSlots,
  calculateSlotHeight,
  performCalendarAutoScroll,
  type CalendarScrollConfig,
} from '@/utils/util'
import { getWeekDates, getEventsForDate, extractTime } from '@/utils/dateUtils'
import type { CalendarEventData } from '@/components/CalendarEvent'
import WeekViewDayHeader from './WeekViewDayHeader'
import WeekViewGrid from './WeekViewGrid'
import styles from './WeekView.module.scss'
import type { WeekViewProps, WeekViewRef } from './types'

const WeekView = forwardRef<WeekViewRef, WeekViewProps>(
  (
    {
      startHour = 7,
      endHour = 23,
      stepMinutes = 30,
      cellHeight = 40,
      use24HourFormat = false,
      displayIntervalMinutes = 30,
      currentDate = new Date(),
      weekStartsOn = 1,
      events = [],
      showCurrentTimeLine = true,
      currentTimeLineStyle,
      dateFormat,
      eventWidth = '100%',
      onDateChange,
      headerActions,
      onEventClick,
      onEventDrag,
      onEventDragEnd,
      onEventDrop,
      onCellClick,
      renderEvent,
      renderDayHeader,
      timeColumnHeaderContent,
      timeColumnSlotContentRenderer,
      className,
      style,
      eventStyle,
      eventClassName,
    },
    ref
  ) => {
    const [headerHeight, setHeaderHeight] = useState<number>(40)
    const dayHeaderRef = useRef<HTMLDivElement>(null)
    const calendarContainerRef = useRef<HTMLDivElement>(null)
    const shouldAutoScrollRef = useRef<boolean>(true)
    const previousDateRef = useRef<Date>(currentDate)

    // Generate week dates
    const weekDates = useMemo(
      () => getWeekDates(currentDate, weekStartsOn),
      [currentDate, weekStartsOn]
    )

    // Generate time slots
    const timeSlots = useMemo(
      () =>
        generateTimeSlots(
          startHour,
          endHour,
          displayIntervalMinutes,
          use24HourFormat
        ),
      [startHour, endHour, displayIntervalMinutes, use24HourFormat]
    )

    const slotsHeight = useMemo(
      () => calculateSlotHeight(stepMinutes, cellHeight),
      [stepMinutes, cellHeight]
    )

    // Group events by date
    const eventsByDate = useMemo(() => {
      const map = new Map<string, CalendarEventData[]>()
      weekDates.forEach(dateStr => {
        const dayEvents = getEventsForDate(events, dateStr)
        // Sort by start time
        dayEvents.sort((a, b) => {
          const aTime = extractTime(a.start)
          const bTime = extractTime(b.start)
          return aTime.localeCompare(bTime)
        })
        map.set(dateStr, dayEvents)
      })
      return map
    }, [weekDates, events])

    // Observe day header height for time column alignment
    useEffect(() => {
      const updateHeaderHeight = () => {
        if (dayHeaderRef.current) {
          setHeaderHeight(dayHeaderRef.current.offsetHeight)
        }
      }
      updateHeaderHeight()
      const resizeObserver = new ResizeObserver(updateHeaderHeight)
      if (dayHeaderRef.current) {
        resizeObserver.observe(dayHeaderRef.current)
      }
      return () => resizeObserver.disconnect()
    }, [renderDayHeader])

    // Scroll config
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

    // Auto-scroll
    const handleAutoScroll = useCallback(() => {
      if (!calendarContainerRef.current || !shouldAutoScrollRef.current) return
      performCalendarAutoScroll(
        calendarContainerRef.current,
        events,
        scrollConfig,
        currentDate
      )
      shouldAutoScrollRef.current = false
    }, [events, scrollConfig, currentDate])

    const scrollToCurrentTimeLine = useCallback(() => {
      if (!calendarContainerRef.current) return
      performCalendarAutoScroll(
        calendarContainerRef.current,
        [],
        scrollConfig,
        currentDate
      )
    }, [scrollConfig, currentDate])

    useImperativeHandle(ref, () => ({ scrollToCurrentTimeLine }), [
      scrollToCurrentTimeLine,
    ])

    // Reset auto-scroll on date change
    useEffect(() => {
      if (
        currentDate.toDateString() !== previousDateRef.current.toDateString()
      ) {
        shouldAutoScrollRef.current = true
        previousDateRef.current = currentDate
      }
    }, [currentDate])

    useEffect(() => {
      if (shouldAutoScrollRef.current) {
        const timer = setTimeout(handleAutoScroll, 100)
        return () => clearTimeout(timer)
      }
    }, [currentDate, showCurrentTimeLine, handleAutoScroll])

    const handleDateChange = useCallback(
      (date: Date) => onDateChange?.(date),
      [onDateChange]
    )

    // Determine if today is visible and its column index
    const todayColumnIndex = useMemo(() => {
      const todayStr = dayjs().format('YYYY-MM-DD')
      return weekDates.indexOf(todayStr)
    }, [weekDates])

    const rootClassName = useMemo(
      () => [styles.weekView, className].filter(Boolean).join(' '),
      [className]
    )

    return (
      <div className={rootClassName} style={style}>
        <CalendarHeader
          currentDate={currentDate}
          onDateChange={handleDateChange}
          actionsSection={headerActions}
          dateFormat={dateFormat}
          navigationUnit="week"
          weekStartsOn={weekStartsOn}
        />
        <div className={styles.weekViewContent} ref={calendarContainerRef}>
          <div className={styles.timeColumnArea}>
            <TimeColumn
              cellHeight={slotsHeight}
              timeSlots={timeSlots}
              headerHeight={headerHeight}
              headerContent={timeColumnHeaderContent}
              renderSlotContent={timeColumnSlotContentRenderer}
              showCurrentTimeIndicator={
                showCurrentTimeLine && todayColumnIndex !== -1
              }
              startHour={startHour}
              endHour={endHour}
              displayIntervalMinutes={displayIntervalMinutes}
              currentDate={currentDate}
              use24HourFormat={use24HourFormat}
            />
          </div>
          <div className={styles.dayHeaderArea} ref={dayHeaderRef}>
            <WeekViewDayHeader
              dates={weekDates}
              renderDayHeader={renderDayHeader}
            />
          </div>
          <div className={styles.gridArea}>
            <WeekViewGrid
              dates={weekDates}
              eventsByDate={eventsByDate}
              timeSlots={timeSlots}
              cellHeight={slotsHeight}
              stepMinutes={stepMinutes}
              use24HourFormat={use24HourFormat}
              eventWidth={eventWidth}
              onEventClick={onEventClick}
              onEventDrag={onEventDrag}
              onEventDragEnd={onEventDragEnd}
              onEventDrop={onEventDrop}
              onCellClick={onCellClick}
              renderEvent={renderEvent}
              eventStyle={eventStyle}
              eventClassName={eventClassName}
            />
            {showCurrentTimeLine && todayColumnIndex !== -1 && (
              <CurrentTimeLine
                startHour={startHour}
                endHour={endHour}
                cellHeight={slotsHeight}
                displayIntervalMinutes={displayIntervalMinutes}
                currentDate={currentDate}
                style={{
                  // Position the line to span only the today column
                  left: `${(todayColumnIndex / 7) * 100}%`,
                  width: `${(1 / 7) * 100}%`,
                  ...currentTimeLineStyle,
                }}
              />
            )}
          </div>
        </div>
      </div>
    )
  }
)

WeekView.displayName = 'WeekView'

export default WeekView
