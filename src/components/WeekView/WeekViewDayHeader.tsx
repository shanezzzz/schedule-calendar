import React, { useMemo } from 'react'
import type { ReactNode } from 'react'
import dayjs from 'dayjs'
import styles from './WeekViewDayHeader.module.scss'

interface WeekViewDayHeaderProps {
  dates: string[]
  renderDayHeader?: (date: string, dayOfWeek: number) => ReactNode
}

const WeekViewDayHeader: React.FC<WeekViewDayHeaderProps> = ({
  dates,
  renderDayHeader,
}) => {
  const headers = useMemo(
    () =>
      dates.map(dateStr => {
        const d = dayjs(dateStr)
        return {
          dateStr,
          dayOfWeek: d.day(),
          label: d.format('ddd'),
          dayNum: d.date(),
          isToday: d.isSame(dayjs(), 'day'),
        }
      }),
    [dates]
  )

  return (
    <div className={styles.dayHeaderRow}>
      {headers.map(header => {
        if (renderDayHeader) {
          return (
            <div key={header.dateStr} className={styles.dayHeaderCell}>
              {renderDayHeader(header.dateStr, header.dayOfWeek)}
            </div>
          )
        }

        return (
          <div
            key={header.dateStr}
            className={`${styles.dayHeaderCell} ${header.isToday ? styles.today : ''}`}
          >
            <span className={styles.dayLabel}>{header.label}</span>
            <span className={styles.dayNumber}>{header.dayNum}</span>
          </div>
        )
      })}
    </div>
  )
}

export default WeekViewDayHeader
