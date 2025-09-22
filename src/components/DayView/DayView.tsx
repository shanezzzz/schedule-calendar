import React, { useMemo } from 'react';
import TimeColumn from '../TimeColumn/TimeColumn';
import CalendarGrid from '../CalendarGrid/CalendarGrid';
import CurrentTimeLine from '../CurrentTimeLine/CurrentTimeLine';
import styles from './DayView.module.scss';
import EmployeeHeader from '../EmployeeHeader/EmployeeHeader';

const DEFAULT_TIME_LABEL_INTERVAL = 30;

interface DayViewProps {
  startHour?: number;
  endHour?: number;
  stepMinutes?: number;
  cellHeight?: number;
  use24HourFormat?: boolean; // true: 24小时制, false: 12小时制(AM/PM)
  displayIntervalMinutes?: number; // 时间标签显示间隔，默认30分钟，独立于stepMinutes
  employeeIds?: string[];
  events?: any[];
  showCurrentTimeLine?: boolean; // 是否显示当前时间线
}

const DayView: React.FC<DayViewProps> = ({
  startHour = 7,
  endHour = 23,
  stepMinutes = 30,
  cellHeight = 40,
  use24HourFormat = false, // 默认使用 12小时制 (AM/PM)
  displayIntervalMinutes = 30, // 默认30分钟间隔显示时间标签
  employeeIds = ['1', '2', '3', '4', '5', '6', '7'],
  events = [],
  showCurrentTimeLine = true // 默认显示当前时间线
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
      current = new Date(current.getTime() + displayIntervalMinutes * 60000);
    }
    return times;
  }, [startHour, endHour, displayIntervalMinutes]);

  const slotsHeight = useMemo(() => {
    const height = DEFAULT_TIME_LABEL_INTERVAL / stepMinutes * 40;
    return height <= 40 ? 52 : height;
  }, [stepMinutes, cellHeight]);

  return (
    <div className={styles.dayView}>
      <div className={styles.dayViewContent}>
        <div className={styles.timeColumnArea}>
          <TimeColumn
            cellHeight={slotsHeight}
            timeSlots={timeSlots}
          />
        </div>
        <div className={styles.employeeHeaderArea}>
          <EmployeeHeader employees={employeeIds.map(id => ({ id, name: `${id}` }))} />
        </div>
        <div className={styles.calendarContainer}>
          <CalendarGrid
            timeSlots={timeSlots}
            employeeIds={employeeIds}
            events={events}
            cellHeight={slotsHeight}
            stepMinutes={stepMinutes}
            use24HourFormat={use24HourFormat}
          />
          {showCurrentTimeLine && (
            <CurrentTimeLine
              startHour={startHour}
              endHour={endHour}
              cellHeight={slotsHeight}
              displayIntervalMinutes={displayIntervalMinutes}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DayView;