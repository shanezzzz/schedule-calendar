import React, { useState, useRef, useCallback } from 'react';
import styles from './CalendarEvent.module.scss';

export interface CalendarEventData {
  id: string;
  title: string;
  start: string; // 格式: "09:00"
  end: string;   // 格式: "10:30"
  employeeId: string;
  color?: string;
  description?: string;
}

interface CalendarEventProps {
  event: CalendarEventData;
  timeSlots?: string[]; // 时间槽数组，如 ["09:00", "09:30", "10:00", ...]
  isDragging?: boolean;
  onEventClick?: (event: CalendarEventData) => void;
  onEventDragStart?: (event: CalendarEventData, mouseEvent: React.MouseEvent) => void;
  onEventDrag?: (event: CalendarEventData, deltaX: number, deltaY: number) => void;
  onEventDragEnd?: (event: CalendarEventData, newEmployeeId: string, newStart: string) => void;
}

const CalendarEvent: React.FC<CalendarEventProps> = ({
  event,
  timeSlots = [],
  isDragging = false,
  onEventClick,
  onEventDragStart,
  onEventDrag,
  onEventDragEnd
}) => {
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const eventRef = useRef<HTMLDivElement>(null);

  // 计算事件在网格中的位置
  const calculateGridPosition = useCallback(() => {
    const startIndex = timeSlots.indexOf(event.start);
    const endIndex = timeSlots.indexOf(event.end);
    const employeeIndex = parseInt(event.employeeId);
    
    if (startIndex === -1 || endIndex === -1) {
      return {
        gridColumn: employeeIndex,
        gridRowStart: 1,
        gridRowEnd: 2
      };
    }
    
    return {
      gridColumn: employeeIndex,
      gridRowStart: startIndex + 1,
      gridRowEnd: endIndex + 1
    };
  }, [event, timeSlots]);

  // 处理鼠标按下事件（开始拖动）
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // 只处理左键
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = eventRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    onEventDragStart?.(event, e);
  }, [event, onEventDragStart]);

  // 处理拖动
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    onEventDrag?.(event, deltaX, deltaY);
  }, [isDragging, dragStart, event, onEventDrag]);

  // 处理拖动结束
  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      // 这里应该根据拖动位置计算新的 employeeId 和 start
      // 简化处理，实际应该根据网格位置计算
      onEventDragEnd?.(event, event.employeeId, event.start);
    }
  }, [isDragging, event, onEventDragEnd]);

  // 处理点击事件
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick?.(event);
  }, [event, onEventClick]);

  // 添加全局鼠标事件监听
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const gridPosition = calculateGridPosition();

  return (
    <div
      ref={eventRef}
      className={`${styles.calendarEvent} ${isDragging ? styles.dragging : ''}`}
      style={{
        gridColumn: gridPosition.gridColumn,
        gridRowStart: gridPosition.gridRowStart,
        gridRowEnd: gridPosition.gridRowEnd,
        backgroundColor: event.color || '#3b82f6'
      }}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div className={styles.eventContent}>
        <div className={styles.eventTitle}>{event.title}</div>
        <div className={styles.eventTime}>
          {event.start} - {event.end}
        </div>
        {event.description && (
          <div className={styles.eventDescription}>{event.description}</div>
        )}
      </div>
    </div>
  );
};

export default CalendarEvent;