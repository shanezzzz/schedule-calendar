import React from 'react'
import styles from './TimeColumn.module.scss'
import type { TimeColumnProps } from './types'

const TimeColumn: React.FC<TimeColumnProps> = ({
  timeSlots = [],
  cellHeight = 80,
  headerHeight = 40, // 默认40px，与原始EmployeeHeader高度一致
}) => {
  return (
    <div className={styles.timeColumn}>
      <div
        className={styles.header}
        style={{ height: `${headerHeight}px` }}
      ></div>
      {timeSlots.map((time, idx) => (
        <div
          key={idx}
          className={styles.timeSlot}
          style={{ height: `${cellHeight}px` }}
        >
          {time}
        </div>
      ))}
    </div>
  )
}

export default TimeColumn
