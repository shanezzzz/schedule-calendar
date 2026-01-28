import React, { useMemo } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import type { CalendarEventData } from '@/components/CalendarEvent'
import { extractTime } from '@/utils/dateUtils'
import styles from './MonthViewCell.module.scss'

interface MonthViewCellProps {
  date: string
  events: CalendarEventData[]
  isCurrentMonth: boolean
  isToday: boolean
  maxEventsPerCell: number
  onEventClick?: (event: CalendarEventData, date: string) => void
  onDateClick?: (date: string) => void
  onMoreClick?: (date: string, events: CalendarEventData[]) => void
  renderEvent?: (params: {
    event: CalendarEventData
    date: string
  }) => ReactNode
  renderCell?: (params: {
    date: string
    events: CalendarEventData[]
    isCurrentMonth: boolean
    isToday: boolean
  }) => ReactNode
  cellClassName?: string
  cellStyle?: CSSProperties
  eventClassName?: string
  eventStyle?: CSSProperties
}

const MonthViewCell: React.FC<MonthViewCellProps> = ({
  date,
  events,
  isCurrentMonth,
  isToday,
  maxEventsPerCell,
  onEventClick,
  onDateClick,
  onMoreClick,
  renderEvent,
  renderCell,
  cellClassName,
  cellStyle,
  eventClassName,
  eventStyle,
}) => {
  const dayNumber = useMemo(() => parseInt(date.split('-')[2], 10), [date])

  const visibleEvents = events.slice(0, maxEventsPerCell)
  const overflowCount = events.length - maxEventsPerCell

  const rootClassName = useMemo(
    () =>
      [
        styles.cell,
        !isCurrentMonth && styles.otherMonth,
        isToday && styles.today,
        cellClassName,
      ]
        .filter(Boolean)
        .join(' '),
    [isCurrentMonth, isToday, cellClassName]
  )

  // Custom cell renderer takes full control
  if (renderCell) {
    return (
      <div className={rootClassName} style={cellStyle}>
        {renderCell({ date, events, isCurrentMonth, isToday })}
      </div>
    )
  }

  return (
    <div className={rootClassName} style={cellStyle}>
      <button
        className={styles.dateNumber}
        type="button"
        onClick={() => onDateClick?.(date)}
        tabIndex={-1}
      >
        {dayNumber}
      </button>
      <div className={styles.eventList}>
        {visibleEvents.map(event => {
          if (renderEvent) {
            return (
              <div
                key={event.id}
                className={eventClassName}
                style={eventStyle}
                onClick={e => {
                  e.stopPropagation()
                  onEventClick?.(event, date)
                }}
                role="button"
                tabIndex={-1}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onEventClick?.(event, date)
                  }
                }}
              >
                {renderEvent({ event, date })}
              </div>
            )
          }

          const timeStr = extractTime(event.start)

          return (
            <button
              key={event.id}
              className={`${styles.eventChip} ${eventClassName ?? ''}`}
              style={{
                backgroundColor: event.color ?? '#3b82f6',
                ...eventStyle,
              }}
              type="button"
              onClick={e => {
                e.stopPropagation()
                onEventClick?.(event, date)
              }}
              title={`${timeStr} ${event.title ?? ''}`}
            >
              <span className={styles.eventTime}>{timeStr}</span>
              {event.title && (
                <span className={styles.eventTitle}>{event.title}</span>
              )}
            </button>
          )
        })}
        {overflowCount > 0 && (
          <button
            className={styles.moreLink}
            type="button"
            onClick={e => {
              e.stopPropagation()
              onMoreClick?.(date, events)
            }}
          >
            +{overflowCount} more
          </button>
        )}
      </div>
    </div>
  )
}

export default MonthViewCell
