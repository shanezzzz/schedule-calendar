import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import styles from './CalendarHeader.module.scss'
import type { CalendarHeaderProps } from './types'

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate = new Date(),
  onDateChange,
  className,
  actionsSection,
  formatDateLabel,
  onMonthChange,
  onToggleDatePicker,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate)
  const [monthCursor, setMonthCursor] = useState<Dayjs>(() =>
    dayjs(currentDate).startOf('month')
  )
  const datePickerRef = useRef<HTMLDivElement>(null)

  const rootClassName = useMemo(() => {
    return [styles.calendarHeader, className].filter(Boolean).join(' ')
  }, [className])

  useEffect(() => {
    setSelectedDate(prev =>
      dayjs(prev).isSame(currentDate, 'day') ? prev : currentDate
    )
    const nextMonthCursor = dayjs(currentDate).startOf('month')
    setMonthCursor(nextMonthCursor)
    onMonthChange?.(nextMonthCursor.toDate())
  }, [currentDate, onMonthChange])

  const formattedDateLabelValue = useMemo(() => {
    return formatDateLabel
      ? formatDateLabel(selectedDate)
      : dayjs(selectedDate).format('dddd, MMM D, YYYY')
  }, [formatDateLabel, selectedDate])

  // 处理点击外部关闭日期选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDatePickerOpen &&
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false)
        onToggleDatePicker?.(false)
      }
    }

    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDatePickerOpen, onToggleDatePicker])

  const handleDateClick = useCallback(() => {
    setIsDatePickerOpen(prev => {
      const nextState = !prev
      onToggleDatePicker?.(nextState)
      return nextState
    })
  }, [onToggleDatePicker])

  const handleDateSelect = useCallback(
    (date: Date) => {
      const nextMonthStart = dayjs(date).startOf('month')
      setSelectedDate(date)
      setMonthCursor(nextMonthStart)
      onMonthChange?.(nextMonthStart.toDate())
      setIsDatePickerOpen(prev => {
        if (prev) {
          onToggleDatePicker?.(false)
        }
        return false
      })
      onDateChange?.(date)
    },
    [onDateChange, onMonthChange, onToggleDatePicker]
  )

  const handlePreviousDay = useCallback(() => {
    const newDate = dayjs(selectedDate).subtract(1, 'day').toDate()
    handleDateSelect(newDate)
  }, [selectedDate, handleDateSelect])

  const handleNextDay = useCallback(() => {
    const newDate = dayjs(selectedDate).add(1, 'day').toDate()
    handleDateSelect(newDate)
  }, [selectedDate, handleDateSelect])

  const handleToday = useCallback(() => {
    const today = new Date()
    handleDateSelect(today)
  }, [handleDateSelect])

  const handleMonthNavigate = useCallback(
    (direction: 'prev' | 'next') => {
      setMonthCursor(prev => {
        const nextMonth =
          direction === 'next'
            ? prev.add(1, 'month')
            : prev.subtract(1, 'month')
        onMonthChange?.(nextMonth.toDate())
        return nextMonth
      })
    },
    [onMonthChange]
  )

  const isToday = dayjs(selectedDate).isSame(dayjs(), 'day')
  const todayButtonText = isToday ? 'Today' : 'Go to Today'

  return (
    <div className={rootClassName}>
      <div className={styles.navigationSection}>
        <button
          className={styles.navButton}
          onClick={handlePreviousDay}
          type="button"
          title="Previous day"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>

        <button
          className={`${styles.todayButton} ${isToday ? styles.todayActive : ''}`}
          onClick={handleToday}
          type="button"
        >
          {todayButtonText}
        </button>

        <button
          className={styles.navButton}
          onClick={handleNextDay}
          type="button"
          title="Next day"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>

      <div className={styles.dateSection}>
        <button
          className={styles.dateButton}
          onClick={handleDateClick}
          type="button"
        >
          <span className={styles.dateText}>{formattedDateLabelValue}</span>
          <svg
            className={`${styles.chevronIcon} ${isDatePickerOpen ? styles.chevronUp : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="6,9 12,15 18,9"></polyline>
          </svg>
        </button>

        {isDatePickerOpen && (
          <div ref={datePickerRef} className={styles.datePicker}>
            <div className={styles.datePickerHeader}>
              <button
                className={styles.navButton}
                onClick={() => handleMonthNavigate('prev')}
                type="button"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
              </button>
              <span className={styles.monthYear}>
                {monthCursor.format('MMMM YYYY')}
              </span>
              <button
                className={styles.navButton}
                onClick={() => handleMonthNavigate('next')}
                type="button"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            </div>
            <div className={styles.datePickerGrid}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className={styles.dayHeader}>
                  {day}
                </div>
              ))}
              {Array.from({ length: monthCursor.daysInMonth() }, (_, i) => {
                const date = monthCursor.date(i + 1)
                const isCurrentMonth = date.month() === monthCursor.month()
                const isSelected = date.isSame(dayjs(selectedDate), 'day')
                const isTodayDate = date.isSame(dayjs(), 'day')

                return (
                  <button
                    key={date.format('YYYY-MM-DD')}
                    className={`${styles.dateCell} ${isCurrentMonth ? '' : styles.otherMonth} ${isSelected ? styles.selected : ''} ${isTodayDate ? styles.today : ''}`}
                    onClick={() => handleDateSelect(date.toDate())}
                    type="button"
                  >
                    {date.date()}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className={styles.actionsSection}>{actionsSection}</div>
    </div>
  )
}

export default CalendarHeader
