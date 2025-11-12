import React from 'react'
import { generateTimeLabels } from '../../utils/util'
import styles from './CalendarCell.module.scss'
import type { CalendarCellProps, CalendarCellEmployee } from './types'

const CalendarCell: React.FC<CalendarCellProps> = ({
  timeSlot,
  stepMinutes = 30,
  cellHeight,
  use24HourFormat = false,
  employeeId,
  employee,
  onTimeLabelClick,
}) => {
  const timeLabels = timeSlot
    ? generateTimeLabels(timeSlot, stepMinutes, use24HourFormat)
    : []

  // 构建 employee 数据，优先使用传入的 employee，否则根据 employeeId 构建
  const employeeData: CalendarCellEmployee =
    employee ||
    (employeeId ? { id: employeeId, name: employeeId } : { id: '', name: '' })

  // 计算每个时间标签的高度
  const labelHeight =
    cellHeight && timeLabels.length > 0
      ? cellHeight / timeLabels.length
      : undefined

  return (
    <div
      className={styles.calendarCell}
      style={{
        position: 'relative',
      }}
    >
      {timeLabels.map((timeLabel, index) => (
        <button
          key={`time-${index}`}
          className={styles.itemLabel}
          type="button"
          onClick={() => {
            onTimeLabelClick?.(timeLabel, index, timeSlot || '', employeeData)
          }}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onTimeLabelClick?.(timeLabel, index, timeSlot || '', employeeData)
            }
          }}
          style={{
            cursor: onTimeLabelClick ? 'pointer' : 'default',
            height: labelHeight ? `${labelHeight}px` : undefined,
          }}
        >
          <div className={styles.timeLabel}>{timeLabel}</div>
          {/* {isBlocked && blockTime && (
            <div className={styles.blockIndicator}>
              {blockTime.title || 'Blocked'}
            </div>
          )} */}
        </button>
      ))}
    </div>
  )
}

export default CalendarCell
