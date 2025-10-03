import React from 'react';
import { generateTimeLabels } from '../../utils/util';
import styles from './CalendarCell.module.scss';

interface CalendarCellProps {
  timeSlot?: string; // Time slot, e.g., "07:00"
  stepMinutes?: number; // Time interval, e.g., 30
  use24HourFormat?: boolean; // true: 24-hour format, false: 12-hour format (AM/PM)
  employeeId?: string; // Employee ID for this cell
  employee?: { id: string; name: string }; // Employee data
  onTimeLabelClick?: (timeLabel: string, index: number, timeSlot: string, employee: { id: string; name: string }) => void; // 时间标签点击回调
}

const CalendarCell: React.FC<CalendarCellProps> = ({ 
  timeSlot,
  stepMinutes = 30,
  use24HourFormat = false,
  employeeId,
  employee,
  onTimeLabelClick,
}) => {
  const timeLabels = timeSlot ? generateTimeLabels(timeSlot, stepMinutes, use24HourFormat) : [];
  
  // 构建 employee 数据，优先使用传入的 employee，否则根据 employeeId 构建
  const employeeData = employee || (employeeId ? { id: employeeId, name: employeeId } : { id: '', name: '' });
  
  return (
    <div className={styles.calendarCell}>
      {/* Display time labels */}
      {timeLabels.map((timeLabel, index) => (
        <div 
          key={`time-${index}`} 
          className={styles.itemLabel}
          onClick={() => onTimeLabelClick?.(timeLabel, index, timeSlot || '', employeeData)}
          style={{ cursor: onTimeLabelClick ? 'pointer' : 'default' }}
        >
          <div className={styles.timeLabel}>
            {timeLabel}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CalendarCell
