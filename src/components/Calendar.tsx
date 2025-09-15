import React, { useState } from 'react'
import CalendarHeader from './CalendarHeader'
import CalendarGrid from './CalendarGrid'
import styles from './Calendar.module.scss'

export interface CalendarProps {
  /** Currently selected date */
  value?: Date
  /** Date change callback */
  onChange?: (date: Date) => void
  /** Minimum date */
  minDate?: Date
  /** Maximum date */
  maxDate?: Date
  /** Whether disabled */
  disabled?: boolean
  /** Custom class name */
  className?: string
  /** Custom styles */
  style?: React.CSSProperties
}

const Calendar: React.FC<CalendarProps> = ({
  value = new Date(),
  onChange,
  minDate,
  maxDate,
  disabled = false,
  className = '',
  style,
}) => {
  const [currentDate, setCurrentDate] = useState(value)

  const handleDateChange = (date: Date) => {
    if (disabled) return
    
    // Check date range
    if (minDate && date < minDate) return
    if (maxDate && date > maxDate) return
    
    setCurrentDate(date)
    onChange?.(date)
  }

  const handleMonthChange = (date: Date) => {
    setCurrentDate(date)
  }

  return (
    <div
      className={`schedule-calendar ${styles.calendar} ${className}`}
      style={style}
      data-testid="calendar"
    >
      <CalendarHeader
        currentDate={currentDate}
        onMonthChange={handleMonthChange}
        disabled={disabled}
      />
      <CalendarGrid
        currentDate={currentDate}
        selectedDate={value}
        onDateSelect={handleDateChange}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
      />
    </div>
  )
}

export default Calendar
