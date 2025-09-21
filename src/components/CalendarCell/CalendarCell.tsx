import React from 'react';
import styles from './CalendarCell.module.scss';

interface CalendarCellProps {
  timeSlot?: string; // 时间槽，如 "07:00"
  stepMinutes?: number; // 时间间隔，如 30
  use24HourFormat?: boolean; // true: 24小时制, false: 12小时制(AM/PM)
  events?: Array<{
    id: string;
    time: string;
    title?: string;
  }>;
  onEventClick?: (eventId: string) => void;
}

const CalendarCell: React.FC<CalendarCellProps> = ({ 
  timeSlot,
  stepMinutes = 30,
  use24HourFormat = false,
  events = [], 
  onEventClick 
}) => {
  // 根据时间槽和间隔生成显示的时间
  const generateTimeLabels = () => {
    if (!timeSlot) return [];
    
    const times: string[] = [];
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const startTime = new Date();
    startTime.setHours(hours, minutes, 0, 0);
    
    // 根据 stepMinutes 生成该时间段内的所有时间点
    let currentTime = new Date(startTime);
    const nextTimeSlot = new Date(startTime.getTime() + 60 * 60 * 1000); // 下一个小时
    
    while (currentTime < nextTimeSlot) {
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
  
  const displayEvents = events.length > 0 ? events : [];

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
      
      {/* 显示事件（如果有的话） */}
      {displayEvents.map((event, index) => (
        <div 
          key={event.id || index} 
          className={styles.eventItem}
          onClick={() => onEventClick?.(event.id)}
        >
          <div className={styles.timeLabel}>
            {event.time}
          </div>
        </div>
      ))}
    </div>
  )
}

export default CalendarCell
