import React from 'react'
import styles from './CalendarCell.module.scss'

export interface CalendarCellProps {
  /** Date */
  date: Date
  /** Whether it's the current month */
  isCurrentMonth: boolean
  /** Whether selected */
  isSelected: boolean
  /** Whether it's today */
  isToday: boolean
  /** Click callback */
  onClick: () => void
  /** Minimum date */
  minDate?: Date
  /** Maximum date */
  maxDate?: Date
  /** Whether disabled */
  disabled?: boolean
}

const CalendarCell: React.FC<CalendarCellProps> = ({
  date,
  isCurrentMonth,
  isSelected,
  isToday,
  onClick,
  minDate,
  maxDate,
  disabled = false,
}) => {
  const isDisabled = disabled || 
    (minDate && date < minDate) || 
    (maxDate && date > maxDate)

  const handleClick = () => {
    if (isDisabled) return
    onClick()
  }

  const cellClasses = [
    styles.cell,
    !isCurrentMonth && styles.otherMonth,
    isSelected && styles.selected,
    isToday && styles.today,
    isDisabled && styles.disabled,
  ].filter(Boolean).join(' ')

  return (
    <button
      type="button"
      className={cellClasses}
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`}
    >
      {date.getDate()}
    </button>
  )
}

export default CalendarCell
