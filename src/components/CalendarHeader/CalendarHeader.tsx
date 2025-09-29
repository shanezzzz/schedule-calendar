import React, { useState, useCallback } from 'react'
import dayjs from 'dayjs'
import styles from './CalendarHeader.module.scss'

interface CalendarHeaderProps {
  currentDate?: Date
  onDateChange?: (date: Date) => void
  className?: string
  actionsSection?: React.ReactNode // 自定义操作区域内容
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate = new Date(),
  onDateChange,
  className,
  actionsSection,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(currentDate)

  const formatDate = useCallback((date: Date) => {
    return dayjs(date).format('dddd, MMM D, YYYY')
  }, [])

  const handleDateClick = useCallback(() => {
    setIsDatePickerOpen(!isDatePickerOpen)
  }, [isDatePickerOpen])

  const handleDateSelect = useCallback(
    (date: Date) => {
      setSelectedDate(date)
      setIsDatePickerOpen(false)
      onDateChange?.(date)
    },
    [onDateChange]
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

  const isToday = dayjs(selectedDate).isSame(dayjs(), 'day')
  const todayButtonText = isToday ? 'Today' : 'Go to Today'

  return (
    <div className={`${styles.calendarHeader} ${className || ''}`}>
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
          <span className={styles.dateText}>{formatDate(selectedDate)}</span>
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
          <div className={styles.datePicker}>
            <div className={styles.datePickerHeader}>
              <button
                className={styles.navButton}
                onClick={() => {
                  const newDate = dayjs(selectedDate)
                    .subtract(1, 'month')
                    .toDate()
                  setSelectedDate(newDate)
                }}
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
                {dayjs(selectedDate).format('MMMM YYYY')}
              </span>
              <button
                className={styles.navButton}
                onClick={() => {
                  const newDate = dayjs(selectedDate).add(1, 'month').toDate()
                  setSelectedDate(newDate)
                }}
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
              {Array.from(
                { length: dayjs(selectedDate).daysInMonth() },
                (_, i) => {
                  const date = dayjs(selectedDate).date(i + 1)
                  const isCurrentMonth =
                    date.month() === dayjs(selectedDate).month()
                  const isSelected = date.isSame(dayjs(selectedDate), 'day')
                  const isTodayDate = date.isSame(dayjs(), 'day')

                  return (
                    <button
                      key={i}
                      className={`${styles.dateCell} ${isCurrentMonth ? '' : styles.otherMonth} ${isSelected ? styles.selected : ''} ${isTodayDate ? styles.today : ''}`}
                      onClick={() => handleDateSelect(date.toDate())}
                      type="button"
                    >
                      {date.date()}
                    </button>
                  )
                }
              )}
            </div>
          </div>
        )}
      </div>

      {actionsSection && (
        <div className={styles.actionsSection}>{actionsSection}</div>
      )}
    </div>
  )
}

export default CalendarHeader
