import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import styles from './CalendarHeader.module.scss'
import type { CalendarHeaderProps } from './types'

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
]

const WEEKDAY_LABELS = {
  0: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  1: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
} as const

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate = new Date(),
  onDateChange,
  className,
  actionsSection,
  formatDateLabel,
  dateFormat,
  navigationUnit = 'day',
  weekStartsOn = 1,
  showViewSwitcher = false,
  view,
  onViewChange,
  onMonthChange,
  onToggleDatePicker,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(currentDate)
  const [monthCursor, setMonthCursor] = useState<Dayjs>(() =>
    dayjs(currentDate).startOf('month')
  )
  // For month picker: track the year being displayed
  const [yearCursor, setYearCursor] = useState<number>(() =>
    dayjs(currentDate).year()
  )
  const datePickerRef = useRef<HTMLDivElement>(null)

  const rootClassName = useMemo(() => {
    return [styles.calendarHeader, className].filter(Boolean).join(' ')
  }, [className])

  const resolvedView = view ?? navigationUnit

  const viewOptions = useMemo<
    Array<{ value: 'day' | 'week' | 'month'; label: string }>
  >(
    () => [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week' },
      { value: 'month', label: 'Month' },
    ],
    []
  )

  const handleViewSelect = useCallback(
    (nextView: 'day' | 'week' | 'month') => {
      if (!onViewChange || nextView === resolvedView) return
      onViewChange(nextView)
    },
    [onViewChange, resolvedView]
  )

  const weekDayLabels = useMemo(
    () => WEEKDAY_LABELS[weekStartsOn],
    [weekStartsOn]
  )

  const getWeekStart = useCallback(
    (date: Dayjs) => {
      const weekDay = date.day()
      const startOffset =
        weekStartsOn === 1 ? (weekDay === 0 ? -6 : 1 - weekDay) : -weekDay
      return date.add(startOffset, 'day')
    },
    [weekStartsOn]
  )

  const normalizeDateByUnit = useCallback(
    (date: Date) => {
      const d = dayjs(date)
      if (navigationUnit === 'month') return d.startOf('month')
      if (navigationUnit === 'week') return getWeekStart(d)
      return d
    },
    [getWeekStart, navigationUnit]
  )

  useEffect(() => {
    const normalizedDate = normalizeDateByUnit(currentDate)
    setSelectedDate(prev =>
      dayjs(prev).isSame(normalizedDate, 'day') ? prev : normalizedDate.toDate()
    )
    const nextMonthCursor = normalizedDate.startOf('month')
    setMonthCursor(nextMonthCursor)
    setYearCursor(normalizedDate.year())
    onMonthChange?.(nextMonthCursor.toDate())
  }, [currentDate, normalizeDateByUnit, onMonthChange])

  const formattedDateLabelValue = useMemo(() => {
    if (formatDateLabel) {
      return formatDateLabel(selectedDate)
    }

    if (dateFormat) {
      return dayjs(selectedDate).format(dateFormat)
    }

    // Default format depends on navigationUnit
    if (navigationUnit === 'month') {
      return dayjs(selectedDate).format('MMMM YYYY')
    }

    if (navigationUnit === 'week') {
      const weekStart = getWeekStart(dayjs(selectedDate))
      const weekEnd = weekStart.add(6, 'day')
      // Same month?
      if (weekStart.month() === weekEnd.month()) {
        return `${weekStart.format('MMM D')} – ${weekEnd.format('D, YYYY')}`
      }
      // Same year?
      if (weekStart.year() === weekEnd.year()) {
        return `${weekStart.format('MMM D')} – ${weekEnd.format('MMM D, YYYY')}`
      }
      return `${weekStart.format('MMM D, YYYY')} – ${weekEnd.format('MMM D, YYYY')}`
    }

    return dayjs(selectedDate).format('dddd, MMM D, YYYY')
  }, [formatDateLabel, dateFormat, selectedDate, navigationUnit, getWeekStart])

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
      const normalizedDate = normalizeDateByUnit(date)
      const nextMonthStart = normalizedDate.startOf('month')
      setSelectedDate(normalizedDate.toDate())
      setMonthCursor(nextMonthStart)
      setYearCursor(normalizedDate.year())
      onMonthChange?.(nextMonthStart.toDate())
      setIsDatePickerOpen(prev => {
        if (prev) {
          onToggleDatePicker?.(false)
        }
        return false
      })
      onDateChange?.(normalizedDate.toDate())
    },
    [normalizeDateByUnit, onDateChange, onMonthChange, onToggleDatePicker]
  )

  const handlePrevious = useCallback(() => {
    const newDate = dayjs(selectedDate).subtract(1, navigationUnit).toDate()
    handleDateSelect(newDate)
  }, [selectedDate, handleDateSelect, navigationUnit])

  const handleNext = useCallback(() => {
    const newDate = dayjs(selectedDate).add(1, navigationUnit).toDate()
    handleDateSelect(newDate)
  }, [selectedDate, handleDateSelect, navigationUnit])

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

  const handleYearNavigate = useCallback((direction: 'prev' | 'next') => {
    setYearCursor(prev => (direction === 'next' ? prev + 1 : prev - 1))
  }, [])

  // Select a month (for month picker)
  const handleMonthSelect = useCallback(
    (monthIndex: number) => {
      const date = new Date(yearCursor, monthIndex, 1)
      handleDateSelect(date)
    },
    [yearCursor, handleDateSelect]
  )

  // Select a week (for week picker) — clicking any day selects the week start
  const handleWeekSelect = useCallback(
    (date: Dayjs) => {
      const weekStart = getWeekStart(date)
      handleDateSelect(weekStart.toDate())
    },
    [getWeekStart, handleDateSelect]
  )

  const isToday = dayjs(selectedDate).isSame(dayjs(), 'day')
  const isTodayWeek = useMemo(() => {
    if (navigationUnit !== 'week') return false
    const nowStart = getWeekStart(dayjs())
    const selectedStart = getWeekStart(dayjs(selectedDate))
    return nowStart.isSame(selectedStart, 'day')
  }, [selectedDate, navigationUnit, getWeekStart])
  const isTodayMonth = useMemo(() => {
    if (navigationUnit !== 'month') return false
    const now = dayjs()
    const d = dayjs(selectedDate)
    return now.isSame(d, 'month')
  }, [selectedDate, navigationUnit])

  const todayButtonActive =
    navigationUnit === 'day'
      ? isToday
      : navigationUnit === 'week'
        ? isTodayWeek
        : isTodayMonth
  const todayButtonText = todayButtonActive ? 'Today' : 'Go to Today'

  // ======================== Week picker helpers ========================
  // Which week is selected (by its week-start date string)?
  const selectedWeekStart = useMemo(() => {
    return getWeekStart(dayjs(selectedDate)).format('YYYY-MM-DD')
  }, [selectedDate, getWeekStart])

  // Build week rows for the currently displayed month (for week picker)
  const weekPickerRows = useMemo(() => {
    const firstDay = monthCursor.startOf('month')
    const firstDayOfWeek = firstDay.day() // 0=Sun
    const gridStartOffset =
      weekStartsOn === 1
        ? firstDayOfWeek === 0
          ? -6
          : 1 - firstDayOfWeek
        : -firstDayOfWeek
    const gridStart = firstDay.add(gridStartOffset, 'day')

    const rows: Dayjs[][] = []
    let current = gridStart
    // Generate enough rows to cover the full month (at most 6 rows)
    for (let r = 0; r < 6; r++) {
      const week: Dayjs[] = []
      for (let c = 0; c < 7; c++) {
        week.push(current)
        current = current.add(1, 'day')
      }
      rows.push(week)
      // Stop if we've passed the end of the month
      if (current.month() !== monthCursor.month() && r >= 3) {
        break
      }
    }
    return rows
  }, [monthCursor, weekStartsOn])

  const dayPickerDays = useMemo(() => {
    const firstDay = monthCursor.startOf('month')
    const firstDayOfWeek = firstDay.day() // 0=Sun
    const gridStartOffset =
      weekStartsOn === 1
        ? firstDayOfWeek === 0
          ? -6
          : 1 - firstDayOfWeek
        : -firstDayOfWeek
    const gridStart = firstDay.add(gridStartOffset, 'day')

    const lastDay = monthCursor.endOf('month')
    const lastDayOfWeek = lastDay.day()
    const gridEndOffset =
      weekStartsOn === 1
        ? lastDayOfWeek === 0
          ? 0
          : 7 - lastDayOfWeek
        : lastDayOfWeek === 6
          ? 0
          : 6 - lastDayOfWeek

    const totalDays =
      -gridStartOffset + monthCursor.daysInMonth() + gridEndOffset

    const days: Dayjs[] = []
    let current = gridStart
    for (let i = 0; i < totalDays; i++) {
      days.push(current)
      current = current.add(1, 'day')
    }
    return days
  }, [monthCursor, weekStartsOn])

  // ======================== Render picker content ========================
  const renderDayPicker = () => (
    <>
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
        {weekDayLabels.map(day => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}
        {dayPickerDays.map(date => {
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
    </>
  )

  const renderWeekPicker = () => (
    <>
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
      <div className={styles.weekPickerGrid}>
        {weekDayLabels.map(day => (
          <div key={day} className={styles.dayHeader}>
            {day}
          </div>
        ))}
        {weekPickerRows.map((week, rowIdx) => {
          const weekStartStr = week[0].format('YYYY-MM-DD')
          const isSelectedWeek = weekStartStr === selectedWeekStart
          const isTodayWeekRow = week.some(d => d.isSame(dayjs(), 'day'))

          return (
            <button
              key={rowIdx}
              className={`${styles.weekRow} ${isSelectedWeek ? styles.weekRowSelected : ''} ${isTodayWeekRow && !isSelectedWeek ? styles.weekRowToday : ''}`}
              onClick={() => handleWeekSelect(week[0])}
              type="button"
            >
              {week.map(date => {
                const isCurrentMonth = date.month() === monthCursor.month()
                const isTodayDate = date.isSame(dayjs(), 'day')
                return (
                  <span
                    key={date.format('YYYY-MM-DD')}
                    className={`${styles.weekDayCell} ${!isCurrentMonth ? styles.otherMonth : ''} ${isTodayDate ? styles.weekDayCellToday : ''}`}
                  >
                    {date.date()}
                  </span>
                )
              })}
            </button>
          )
        })}
      </div>
    </>
  )

  const renderMonthPicker = () => {
    const now = dayjs()
    const selectedMonth = dayjs(selectedDate).month()
    const selectedYear = dayjs(selectedDate).year()

    return (
      <>
        <div className={styles.datePickerHeader}>
          <button
            className={styles.navButton}
            onClick={() => handleYearNavigate('prev')}
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
          <span className={styles.monthYear}>{yearCursor}</span>
          <button
            className={styles.navButton}
            onClick={() => handleYearNavigate('next')}
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
        <div className={styles.monthPickerGrid}>
          {MONTH_LABELS.map((label, idx) => {
            const isSelected =
              idx === selectedMonth && yearCursor === selectedYear
            const isCurrent = idx === now.month() && yearCursor === now.year()
            return (
              <button
                key={label}
                className={`${styles.monthCell} ${isSelected ? styles.monthCellSelected : ''} ${isCurrent && !isSelected ? styles.monthCellCurrent : ''}`}
                onClick={() => handleMonthSelect(idx)}
                type="button"
              >
                {label}
              </button>
            )
          })}
        </div>
      </>
    )
  }

  const renderPickerContent = () => {
    if (navigationUnit === 'month') return renderMonthPicker()
    if (navigationUnit === 'week') return renderWeekPicker()
    return renderDayPicker()
  }

  return (
    <div className={rootClassName}>
      <div className={styles.navigationSection}>
        <button
          className={styles.navButton}
          onClick={handlePrevious}
          type="button"
          title={`Previous ${navigationUnit}`}
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
          className={`${styles.todayButton} ${todayButtonActive ? styles.todayActive : ''}`}
          onClick={handleToday}
          type="button"
        >
          {todayButtonText}
        </button>

        <button
          className={styles.navButton}
          onClick={handleNext}
          type="button"
          title={`Next ${navigationUnit}`}
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
            {renderPickerContent()}
          </div>
        )}
      </div>

      <div className={styles.actionsSection}>
        {actionsSection}
        {showViewSwitcher && (
          <div
            className={styles.viewSwitcher}
            role="tablist"
            aria-label="Calendar view"
          >
            {viewOptions.map(option => (
              <button
                key={option.value}
                className={`${styles.viewSwitcherButton} ${resolvedView === option.value ? styles.viewSwitcherButtonActive : ''}`}
                onClick={() => handleViewSelect(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarHeader
