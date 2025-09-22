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
  const displayTimeSlots = timeSlots.length > 0 ? timeSlots : [];
  const displayEmployeeIds = employeeIds.length > 0 ? employeeIds : [];
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
