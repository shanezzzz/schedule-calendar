import React from 'react';
import CalendarCell from '../CalendarCell/CalendarCell';
import { CalendarEventData } from '../CalendarEvent/CalendarEvent';
import styles from './CalendarGrid.module.scss';

interface CalendarGridProps {
  events?: CalendarEventData[];
  timeSlots?: string[];
  employeeIds?: string[];
  cellHeight?: number;
  stepMinutes?: number;
  use24HourFormat?: boolean; // true: 24小时制, false: 12小时制(AM/PM)
  onEventClick?: (event: CalendarEventData) => void;
  onEventDrag?: (event: CalendarEventData, deltaX: number, deltaY: number) => void;
  onEventDragEnd?: (event: CalendarEventData, newEmployeeId: string, newStart: string) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  timeSlots = [],
  employeeIds = [],
  cellHeight = 80,
  stepMinutes = 30,
  use24HourFormat = false
}) => {
  // 默认时间槽 (每小时一个槽)
  const defaultTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  // 默认员工ID
  const defaultEmployeeIds = ['1', '2', '3', '4', '5', '6', '7'];

  const displayTimeSlots = timeSlots.length > 0 ? timeSlots : defaultTimeSlots;
  const displayEmployeeIds = employeeIds.length > 0 ? employeeIds : defaultEmployeeIds;

  return (
    <div className={styles.calendarGrid}>
      <div 
        className={styles.gridContainer}
        style={{
          gridTemplateColumns: `repeat(${displayEmployeeIds.length}, 1fr)`,
          gridTemplateRows: `repeat(${displayTimeSlots.length}, ${cellHeight}px)`
        }}
      >
        {/* 渲染网格单元格 */}
        {displayTimeSlots.map((timeSlot, timeIndex) =>
          displayEmployeeIds.map((_, empIndex) => (
            <CalendarCell 
              key={`${timeIndex}-${empIndex}`} 
              timeSlot={timeSlot}
              stepMinutes={stepMinutes}
              use24HourFormat={use24HourFormat}
            />
          ))
        )}
        
      </div>
    </div>
  );
};

export default CalendarGrid
