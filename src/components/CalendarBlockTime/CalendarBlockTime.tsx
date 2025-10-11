import React, { useMemo } from 'react'
import { formatTime, parseTimeSlot, timeValueToDate } from '@/utils/util'
import styles from './CalendarBlockTime.module.scss'
import type { CalendarBlockTimeProps } from './types'

const CalendarBlockTime: React.FC<CalendarBlockTimeProps> = ({
  blockTime,
  employee,
  style,
  className,
  use24HourFormat = false,
  onClick,
  renderContent,
}) => {
  const isInteractive = typeof onClick === 'function'

  const finalClassName = useMemo(() => {
    const classNames = [styles.calendarBlockTime]
    if (className) {
      classNames.push(className)
    }
    if (isInteractive) {
      classNames.push(styles.interactive)
    } else {
      classNames.push(styles.readOnly)
    }
    return classNames.join(' ')
  }, [className, isInteractive])

  const finalStyle = useMemo(() => {
    const nextStyle: React.CSSProperties = {
      ...style,
    }

    if (blockTime.color) {
      nextStyle.background = blockTime.color
      nextStyle.borderColor = blockTime.color
    }

    return nextStyle
  }, [blockTime.color, style])

  const defaultContent = useMemo(() => {
    const startParsed = parseTimeSlot(blockTime.start)
    const endParsed = parseTimeSlot(blockTime.end)

    const startLabel =
      startParsed.success && startParsed.data
        ? formatTime(timeValueToDate(startParsed.data), use24HourFormat)
        : blockTime.start
    const endLabel =
      endParsed.success && endParsed.data
        ? formatTime(timeValueToDate(endParsed.data), use24HourFormat)
        : blockTime.end

    return (
      <div className={styles.content}>
        <div className={styles.headerRow}>
          <span className={styles.pill}>
            {blockTime.type ? blockTime.type : 'Blocked'}
          </span>
          <span className={styles.employeeName}>{employee.name}</span>
        </div>
        <div className={styles.titleRow}>
          <span className={styles.title}>
            {blockTime.title ?? 'Unavailable'}
          </span>
          <span className={styles.timeRange}>
            {startLabel} – {endLabel}
          </span>
        </div>
        {blockTime.description && (
          <p className={styles.description}>{blockTime.description}</p>
        )}
      </div>
    )
  }, [
    blockTime.description,
    blockTime.end,
    blockTime.start,
    blockTime.title,
    blockTime.type,
    employee.name,
    use24HourFormat,
  ])

  const renderedContent = useMemo(() => {
    if (renderContent) {
      return renderContent({ blockTime, employee })
    }
    return defaultContent
  }, [blockTime, defaultContent, employee, renderContent])

  return (
    <button
      type="button"
      className={finalClassName}
      style={finalStyle}
      onClick={isInteractive ? () => onClick?.(blockTime, employee) : undefined}
      aria-disabled={!isInteractive}
      tabIndex={isInteractive ? 0 : -1}
      aria-label={
        blockTime.title
          ? `${blockTime.title} (${blockTime.start} – ${blockTime.end})`
          : `Blocked ${blockTime.start} – ${blockTime.end}`
      }
    >
      {renderedContent}
    </button>
  )
}

export default CalendarBlockTime
