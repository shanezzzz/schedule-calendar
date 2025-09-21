import React, { useState, useCallback } from 'react';
import CalendarCell from '../CalendarCell/CalendarCell';
import CalendarEvent, { CalendarEventData } from '../CalendarEvent/CalendarEvent';
import styles from './CalendarGrid.module.scss';

interface CalendarGridProps {
  events?: CalendarEventData[];
  timeSlots?: string[];
  employeeIds?: string[];
  cellHeight?: number;
  onEventClick?: (event: CalendarEventData) => void;
  onEventDrag?: (event: CalendarEventData, deltaX: number, deltaY: number) => void;
  onEventDragEnd?: (event: CalendarEventData, newEmployeeId: string, newStart: string) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  events = [],
  timeSlots = [],
  employeeIds = [],
  cellHeight = 80,
  onEventClick,
  onEventDrag,
  onEventDragEnd
}) => {
  const [draggingEvent, setDraggingEvent] = useState<string | null>(null);

  // 默认时间槽 (每小时一个槽)
  const defaultTimeSlots = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', 
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  // 默认员工ID
  const defaultEmployeeIds = ['1', '2', '3', '4', '5', '6', '7'];

  // 默认事件数据
  const defaultEvents: CalendarEventData[] = [
    {
      id: '1',
      title: '团队会议',
      start: '09:00',
      end: '10:00',
      employeeId: '1',
      color: '#3b82f6',
      description: '项目进度讨论'
    },
    {
      id: '2',
      title: '客户演示',
      start: '14:00',
      end: '15:30',
      employeeId: '2',
      color: '#10b981'
    },
    {
      id: '3',
      title: '代码审查',
      start: '16:00',
      end: '17:00',
      employeeId: '3',
      color: '#f59e0b',
      description: 'Review 新功能代码'
    },
    {
      id: '4',
      title: '培训课程',
      start: '10:00',
      end: '12:00',
      employeeId: '1',
      color: '#8b5cf6'
    }
  ];

  const displayTimeSlots = timeSlots.length > 0 ? timeSlots : defaultTimeSlots;
  const displayEmployeeIds = employeeIds.length > 0 ? employeeIds : defaultEmployeeIds;
  const displayEvents = events.length > 0 ? events : defaultEvents;

  const handleEventClick = useCallback((event: CalendarEventData) => {
    onEventClick?.(event);
  }, [onEventClick]);

  const handleEventDragStart = useCallback((event: CalendarEventData) => {
    setDraggingEvent(event.id);
  }, []);

  const handleEventDrag = useCallback((event: CalendarEventData, deltaX: number, deltaY: number) => {
    onEventDrag?.(event, deltaX, deltaY);
  }, [onEventDrag]);

  const handleEventDragEnd = useCallback((event: CalendarEventData, newEmployeeId: string, newStart: string) => {
    setDraggingEvent(null);
    onEventDragEnd?.(event, newEmployeeId, newStart);
  }, [onEventDragEnd]);

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
        {displayTimeSlots.map((_, timeIndex) =>
          displayEmployeeIds.map((_, empIndex) => (
            <CalendarCell key={`${timeIndex}-${empIndex}`} />
          ))
        )}
        
        {/* 渲染事件
        {displayEvents.map((event) => (
          <CalendarEvent
            key={event.id}
            event={event}
            timeSlots={displayTimeSlots}
            isDragging={draggingEvent === event.id}
            onEventClick={handleEventClick}
            onEventDragStart={handleEventDragStart}
            onEventDrag={handleEventDrag}
            onEventDragEnd={handleEventDragEnd}
          />
        ))} */}
      </div>
    </div>
  );
};

export default CalendarGrid
