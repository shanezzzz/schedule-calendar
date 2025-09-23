import React from 'react';
import { generateTimeLabels } from '../../utils/util';
import styles from './CalendarCell.module.scss';

interface CalendarCellProps {
  timeSlot?: string; // Time slot, e.g., "07:00"
  stepMinutes?: number; // Time interval, e.g., 30
  use24HourFormat?: boolean; // true: 24-hour format, false: 12-hour format (AM/PM)
}

const CalendarCell: React.FC<CalendarCellProps> = ({ 
  timeSlot,
  stepMinutes = 30,
  use24HourFormat = false,
}) => {
  const timeLabels = timeSlot ? generateTimeLabels(timeSlot, stepMinutes, use24HourFormat) : [];
  
  return (
    <div className={styles.calendarCell}>
      {/* Display time labels */}
      {timeLabels.map((timeLabel, index) => (
        <div 
          key={`time-${index}`} 
          className={styles.itemLabel}
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
