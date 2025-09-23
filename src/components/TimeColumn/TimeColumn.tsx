import React from 'react';
import styles from './TimeColumn.module.scss';

interface TimeColumnProps {
  timeSlots?: string[];
  cellHeight?: number;
}

const TimeColumn: React.FC<TimeColumnProps> = ({
  timeSlots = [],
  cellHeight = 80,
}) => {

  return (
    <div className={styles.timeColumn} style={{ paddingTop: '40px' }}>
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
  );
};

export default TimeColumn;