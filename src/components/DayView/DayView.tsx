import React, { useMemo } from 'react';
import TimeColumn from '../TimeColumn/TimeColumn';
import CalendarGrid from '../CalendarGrid/CalendarGrid';
import styles from './DayView.module.scss';
import EmployeeHeader from '../EmployeeHeader/EmployeeHeader';

interface DayViewProps {
  startHour?: number;
  endHour?: number;
  stepMinutes?: number;
  cellHeight?: number;
  use24HourFormat?: boolean; // true: 24小时制, false: 12小时制(AM/PM)
  employeeIds?: string[];
  events?: any[];
}

const DayView: React.FC<DayViewProps> = ({
  startHour = 7,
  endHour = 23,
  stepMinutes = 30,
  cellHeight = 80,
  use24HourFormat = false, // 默认使用 12小时制 (AM/PM)
  employeeIds = ['1', '2', '3', '4', '5', '6', '7'],
  events = []
}) => {
  // 生成时间槽，确保与 TimeColumn 一致
  const timeSlots = useMemo(() => {
    const times: string[] = [];
    const start = new Date();
    start.setHours(startHour, 0, 0, 0);
    const end = new Date();
    end.setHours(endHour, 0, 0, 0);

    let current = new Date(start);
    while (current <= end) {
      times.push(current.toTimeString().slice(0, 5));
      current = new Date(current.getTime() + stepMinutes * 60000);
    }
    return times;
  }, [startHour, endHour, stepMinutes]);

  return (
    <div className={styles.dayView}>
      <div className={styles.dayViewContent}>
        <div className={styles.timeColumnArea}>
          <TimeColumn
            startHour={startHour}
            endHour={endHour}
            stepMinutes={stepMinutes}
            cellHeight={cellHeight}
            use24HourFormat={use24HourFormat}
          />
        </div>
        <div className={styles.employeeHeaderArea}>
          <EmployeeHeader employees={employeeIds.map(id => ({ id, name: `员工${id}` }))} />
        </div>
        <div className={styles.calendarContainer}>
          <CalendarGrid
            timeSlots={timeSlots}
            employeeIds={employeeIds}
            events={events}
            cellHeight={cellHeight}
            stepMinutes={stepMinutes}
            use24HourFormat={use24HourFormat}
          />
        </div>
      </div>
    </div>
  );
};

export default DayView;