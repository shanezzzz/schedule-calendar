import React, { useMemo } from 'react'
import dayjs from 'dayjs'
import type { CalendarEventData } from '@/components/CalendarEvent'
import { getEventsForDate } from '@/utils/dateUtils'
import MonthViewCell from './MonthViewCell'
import styles from './MonthViewGrid.module.scss'
import type {
  MonthViewEventClickHandler,
  MonthViewDateClickHandler,
  MonthViewMoreClickHandler,
  MonthViewEventRenderer,
  MonthViewCellRenderer,
  MonthViewDayOfWeekHeaderRenderer,
} from './types'

interface MonthViewGridProps {
  grid: string[][]
  currentMonth: number
  events: CalendarEventData[]
  maxEventsPerCell: number
  weekStartsOn: 0 | 1
  onEventClick?: MonthViewEventClickHandler
  onDateClick?: MonthViewDateClickHandler
  onMoreClick?: MonthViewMoreClickHandler
  renderEvent?: MonthViewEventRenderer
  renderCell?: MonthViewCellRenderer
  renderDayOfWeekHeader?: MonthViewDayOfWeekHeaderRenderer
  cellClassName?: string
  cellStyle?: React.CSSProperties
  eventClassName?: string
  eventStyle?: React.CSSProperties
}

const DAY_LABELS_SUN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const DAY_LABELS_MON = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const MonthViewGrid: React.FC<MonthViewGridProps> = ({
  grid,
  currentMonth,
  events,
  maxEventsPerCell,
  weekStartsOn,
  onEventClick,
  onDateClick,
  onMoreClick,
  renderEvent,
  renderCell,
  renderDayOfWeekHeader,
  cellClassName,
  cellStyle,
  eventClassName,
  eventStyle,
}) => {
  const dayLabels = weekStartsOn === 0 ? DAY_LABELS_SUN : DAY_LABELS_MON

  // Precompute day-of-week indices for header
  const dayOfWeekIndices = useMemo(() => {
    if (weekStartsOn === 0) return [0, 1, 2, 3, 4, 5, 6]
    return [1, 2, 3, 4, 5, 6, 0]
  }, [weekStartsOn])

  const todayStr = useMemo(() => dayjs().format('YYYY-MM-DD'), [])

  return (
    <div className={styles.monthGrid}>
      {/* Day of week header row */}
      <div className={styles.dayOfWeekRow}>
        {dayLabels.map((label, index) => (
          <div key={label} className={styles.dayOfWeekCell}>
            {renderDayOfWeekHeader
              ? renderDayOfWeekHeader(dayOfWeekIndices[index], label)
              : label}
          </div>
        ))}
      </div>

      {/* Week rows */}
      {grid.map((week, weekIndex) => (
        <div key={weekIndex} className={styles.weekRow}>
          {week.map(dateStr => {
            const dateMonth = parseInt(dateStr.split('-')[1], 10) - 1
            const isCurrentMonth = dateMonth === currentMonth
            const isToday = dateStr === todayStr
            const dayEvents = getEventsForDate(events, dateStr)

            return (
              <MonthViewCell
                key={dateStr}
                date={dateStr}
                events={dayEvents}
                isCurrentMonth={isCurrentMonth}
                isToday={isToday}
                maxEventsPerCell={maxEventsPerCell}
                onEventClick={onEventClick}
                onDateClick={onDateClick}
                onMoreClick={onMoreClick}
                renderEvent={renderEvent}
                renderCell={renderCell}
                cellClassName={cellClassName}
                cellStyle={cellStyle}
                eventClassName={eventClassName}
                eventStyle={eventStyle}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default MonthViewGrid
