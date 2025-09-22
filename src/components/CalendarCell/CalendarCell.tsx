import React from 'react';
import styles from './CalendarCell.module.scss';

interface CalendarCellProps {
  timeSlot?: string; // 时间槽，如 "07:00"
  stepMinutes?: number; // 时间间隔，如 30
  use24HourFormat?: boolean; // true: 24小时制, false: 12小时制(AM/PM)
}

const DEFAULT_TIME_LABEL_INTERVAL = 30; // 默认时间标签间隔（分钟）

const CalendarCell: React.FC<CalendarCellProps> = ({ 
  timeSlot,
  stepMinutes = 30,
  use24HourFormat = false,
}) => {
  // 根据时间槽和间隔生成显示的时间
  const generateTimeLabels = () => {
    if (!timeSlot) return [];
    
    // 计算需要显示的时间标签数量
    // 公式：DEFAULT_TIME_LABEL_INTERVAL / stepMinutes
    const labelCount = Math.max(1, Math.round(DEFAULT_TIME_LABEL_INTERVAL / stepMinutes));
    
    const times: string[] = [];
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);
    
    // 根据计算出的数量生成时间标签
    let currentTime = new Date(startTime);
    
    for (let i = 0; i < labelCount; i++) {
      const timeString = currentTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: !use24HourFormat
      });
      times.push(timeString);
      currentTime = new Date(currentTime.getTime() + stepMinutes * 60 * 1000);
    }
    
    return times;
  };

  const timeLabels = generateTimeLabels();

  console.log('timeLabels', timeLabels);
  
  return (
    <div className={styles.calendarCell}>
      {/* 显示时间标签 */}
      {timeLabels.map((timeLabel, index) => (
        <div 
          key={`time-${index}`} 
          className={styles.eventItem}
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
