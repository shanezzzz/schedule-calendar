import React from 'react';
import styles from './CalendarCell.module.scss';

interface CalendarCellProps {
  events?: Array<{
    id: string;
    time: string;
    title?: string;
  }>;
  onEventClick?: (eventId: string) => void;
}

const CalendarCell: React.FC<CalendarCellProps> = ({ 
  events = [], 
  onEventClick 
}) => {
  const defaultEvents = [
    { id: '1', time: '4:00 PM' },
    { id: '2', time: '5:30 PM'  }
  ];
  
  const displayEvents = events.length > 0 ? events : defaultEvents;

  return (
    <div className={styles.calendarCell}>
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
