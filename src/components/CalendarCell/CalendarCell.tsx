import React from 'react'
import { generateTimeLabels } from '../../utils/util'
import { isTimeBlocked } from '../../types/blockTime'
import styles from './CalendarCell.module.scss'
import type { CalendarCellProps, CalendarCellEmployee } from './types'

const CalendarCell: React.FC<CalendarCellProps> = ({
  timeSlot,
  stepMinutes = 30,
  use24HourFormat = false,
  employeeId,
  employee,
  blockTimes = [],
  onTimeLabelClick,
}) => {
  const timeLabels = timeSlot
    ? generateTimeLabels(timeSlot, stepMinutes, use24HourFormat)
    : []

  // 构建 employee 数据，优先使用传入的 employee，否则根据 employeeId 构建
  const employeeData: CalendarCellEmployee =
    employee ||
    (employeeId ? { id: employeeId, name: employeeId } : { id: '', name: '' })

  // 检查当前时间槽是否被阻塞
  const isBlocked = timeSlot ? isTimeBlocked(timeSlot, blockTimes) : false

  // 获取阻塞时间的颜色（如果有的话）
  const blockTime = blockTimes.find(
    block => timeSlot && timeSlot >= block.start && timeSlot < block.end
  )

  return (
    <div
      className={`${styles.calendarCell} ${isBlocked ? styles.blocked : ''}`}
      style={{
        backgroundColor: isBlocked ? blockTime?.color || '#f3f4f6' : undefined,
        opacity: isBlocked ? 0.6 : 1,
        position: 'relative',
      }}
    >
      {isBlocked ? (
        <div className={styles.blockedLabel}>{timeSlot}</div>
      ) : (
        timeLabels.map((timeLabel, index) => (
          <div
            key={`time-${index}`}
            className={`${styles.itemLabel} ${isBlocked ? styles.blockedLabel : ''}`}
            onClick={() => {
              if (!isBlocked) {
                onTimeLabelClick?.(
                  timeLabel,
                  index,
                  timeSlot || '',
                  employeeData
                )
              }
            }}
            style={{
              cursor: isBlocked
                ? 'not-allowed'
                : onTimeLabelClick
                  ? 'pointer'
                  : 'default',
              pointerEvents: isBlocked ? 'none' : 'auto',
            }}
          >
            <div className={styles.timeLabel}>{timeLabel}</div>
            {/* {isBlocked && blockTime && (
            <div className={styles.blockIndicator}>
              {blockTime.title || 'Blocked'}
            </div>
          )} */}
          </div>
        ))
      )}
    </div>
  )
}

export default CalendarCell
