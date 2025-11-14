import React, { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import styles from './TimeColumn.module.scss'
import type { TimeColumnProps } from './types'
import { formatTime } from '@/utils/util'

const TimeColumn: React.FC<TimeColumnProps> = ({
  timeSlots = [],
  cellHeight = 80,
  headerHeight = 40, // 默认40px，与原始EmployeeHeader高度一致
  headerContent,
  renderSlotContent,
  showCurrentTimeIndicator = false,
  startHour,
  endHour,
  displayIntervalMinutes,
  currentDate,
  use24HourFormat = false,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date())

  // 每分钟更新一次时间，保持与 CurrentTimeLine 一致
  useEffect(() => {
    if (!showCurrentTimeIndicator) {
      return
    }

    const updateTime = () => {
      setCurrentTime(new Date())
    }

    updateTime()

    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [showCurrentTimeIndicator])

  const isToday = useMemo(() => {
    if (!currentDate) {
      return false
    }
    return dayjs(currentDate).isSame(dayjs(), 'day')
  }, [currentDate])

  const currentTimePosition = useMemo(() => {
    if (
      !showCurrentTimeIndicator ||
      !isToday ||
      startHour == null ||
      endHour == null ||
      displayIntervalMinutes == null
    ) {
      return { top: 0, isInRange: false }
    }

    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()

    if (currentHour < startHour || currentHour >= endHour) {
      return { top: 0, isInRange: false }
    }

    const totalMinutesFromStart = (currentHour - startHour) * 60 + currentMinute
    const positionInPixels =
      (totalMinutesFromStart / displayIntervalMinutes) * cellHeight

    return {
      top: positionInPixels,
      isInRange: true,
    }
  }, [
    cellHeight,
    currentTime,
    displayIntervalMinutes,
    endHour,
    isToday,
    showCurrentTimeIndicator,
    startHour,
  ])

  const shouldShowCurrentTimeIndicator =
    showCurrentTimeIndicator && isToday && currentTimePosition.isInRange

  const currentTimeLabel = useMemo(() => {
    if (!shouldShowCurrentTimeIndicator) {
      return ''
    }
    return formatTime(currentTime, use24HourFormat)
  }, [currentTime, shouldShowCurrentTimeIndicator, use24HourFormat])

  return (
    <div className={styles.timeColumn}>
      <div className={styles.header} style={{ height: `${headerHeight}px` }}>
        {headerContent}
      </div>
      {timeSlots.map((time, idx) => {
        const isWholeHour = /:00\b/.test(time)
        const slotClassName = [
          styles.timeSlot,
          !isWholeHour ? styles.timeSlotMinor : undefined,
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <div
            key={idx}
            className={slotClassName}
            style={{ height: `${cellHeight}px` }}
          >
            {time}
            {renderSlotContent?.(time, idx)}
          </div>
        )
      })}
      {shouldShowCurrentTimeIndicator && (
        <div
          className={styles.currentTimeIndicator}
          style={{ top: headerHeight + currentTimePosition.top }}
        >
          <div className={styles.currentTimePill}>
            <span className={styles.currentTimePillText}>
              {currentTimeLabel}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimeColumn
