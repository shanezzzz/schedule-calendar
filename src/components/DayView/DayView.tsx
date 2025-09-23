import React, { useMemo } from 'react';
import TimeColumn from '../TimeColumn/TimeColumn';
import CalendarGrid from '../CalendarGrid/CalendarGrid';
import CurrentTimeLine from '../CurrentTimeLine/CurrentTimeLine';
import styles from './DayView.module.scss';
import EmployeeHeader from '../EmployeeHeader/EmployeeHeader';
import { generateTimeSlots, calculateSlotHeight } from '../../utils/util';

interface DayViewProps {
  startHour?: number;
  endHour?: number;
  stepMinutes?: number;
  cellHeight?: number;
  use24HourFormat?: boolean; // true: 24-hour format, false: 12-hour format (AM/PM)
  displayIntervalMinutes?: number; // Time label display interval, default 30 minutes, independent of stepMinutes
  employeeIds?: string[];
  events?: any[];
  showCurrentTimeLine?: boolean; // Whether to show current time line
}

const DayView: React.FC<DayViewProps> = ({
  startHour = 7,
  endHour = 23,
  stepMinutes = 30,
  cellHeight = 40,
  use24HourFormat = false, // Default to 12-hour format (AM/PM)
  displayIntervalMinutes = 30, // Default 30-minute interval for time label display
  employeeIds = ['1', '2', '3', '4', '5', '6', '7'],
  events = [],
  showCurrentTimeLine = true // Default to show current time line
}) => {
  // Generate time slots, ensure consistency with TimeColumn
  const timeSlots = useMemo(() => {
    return generateTimeSlots(startHour, endHour, displayIntervalMinutes, use24HourFormat);
  }, [startHour, endHour, displayIntervalMinutes, use24HourFormat]);

  const slotsHeight = useMemo(() => {
    return calculateSlotHeight(stepMinutes, cellHeight);
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