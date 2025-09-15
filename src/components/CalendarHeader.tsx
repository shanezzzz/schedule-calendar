import React from 'react'
import styles from './CalendarHeader.module.scss'

export interface CalendarHeaderProps {
  /** Currently displayed date */
  currentDate: Date
  /** Month change callback */
  onMonthChange: (date: Date) => void
  /** Whether disabled */
  disabled?: boolean
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onMonthChange,
  disabled = false,
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const goToPreviousMonth = () => {
    if (disabled) return
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() - 1)
    onMonthChange(newDate)
  }

  const goToNextMonth = () => {
    if (disabled) return
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + 1)
    onMonthChange(newDate)
  }

  return (
    <div className={styles.header}>
      <button
        type="button"
        className={styles.navButton}
        onClick={goToPreviousMonth}
        disabled={disabled}
        aria-label="Previous month"
      >
        ‹
      </button>
      
      <h2 className={styles.title}>
        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
      </h2>
      
      <button
        type="button"
        className={styles.navButton}
        onClick={goToNextMonth}
        disabled={disabled}
        aria-label="Next month"
      >
        ›
      </button>
    </div>
  )
}

export default CalendarHeader
