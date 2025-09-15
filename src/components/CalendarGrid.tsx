import React from 'react'
import CalendarCell from './CalendarCell'
import styles from './CalendarGrid.module.scss'

export interface CalendarGridProps {
  /** Currently displayed date */
  currentDate: Date
  /** Selected date */
  selectedDate?: Date
  /** Date selection callback */
  onDateSelect: (date: Date) => void
  /** Minimum date */
  minDate?: Date
  /** Maximum date */
  maxDate?: Date
  /** Whether disabled */
  disabled?: boolean
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  disabled = false,
}) => {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Get first and last day of the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  
  // Get what day of the week the first day is (0-6, 0 is Sunday)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  
  // Get the last few days of the previous month
  const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0)
  const daysInPrevMonth = prevMonth.getDate()
  
  // Generate date array for calendar grid
  const calendarDays: Date[] = []
  
  // Add dates from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, daysInPrevMonth - i))
  }
  
  // Add dates from current month
  for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))
  }
  
  // Add dates from next month (fill 6 rows)
  const remainingDays = 42 - calendarDays.length
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day))
  }

  return (
    <div className={styles.grid}>
      {/* Week header */}
      <div className={styles.weekHeader}>
        {weekDays.map((day) => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>
      
      {/* Date grid */}
      <div className={styles.daysGrid}>
        {calendarDays.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth()
          const isSelected = Boolean(selectedDate && 
            date.getDate() === selectedDate.getDate() &&
            date.getMonth() === selectedDate.getMonth() &&
            date.getFullYear() === selectedDate.getFullYear())
          const isToday = date.toDateString() === new Date().toDateString()
          
          return (
            <CalendarCell
              key={index}
              date={date}
              isCurrentMonth={isCurrentMonth}
              isSelected={isSelected}
              isToday={isToday}
              onClick={() => onDateSelect(date)}
              minDate={minDate}
              maxDate={maxDate}
              disabled={disabled}
            />
          )
        })}
      </div>
    </div>
  )
}

export default CalendarGrid
