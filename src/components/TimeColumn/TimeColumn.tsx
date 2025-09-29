import React from 'react';
import styles from './TimeColumn.module.scss';

interface TimeColumnProps {
  timeSlots?: string[];
  cellHeight?: number;
  headerHeight?: number; // 用于匹配EmployeeHeader的高度
}

const TimeColumn: React.FC<TimeColumnProps> = ({
  timeSlots = [],
  cellHeight = 80,
  headerHeight = 40, // 默认40px，与原始EmployeeHeader高度一致
}) => {

  return (
    <div className={styles.timeColumn} style={{ paddingTop: `${headerHeight}px` }}>
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