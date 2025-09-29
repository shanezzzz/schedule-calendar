import React, { useCallback, useMemo, useRef, useState } from 'react';
import CalendarCell from '../CalendarCell/CalendarCell';
import CalendarEvent, {
  CalendarEventData,
  CalendarEventDragMeta,
  CalendarEventRenderContext
} from '../CalendarEvent/CalendarEvent';
import styles from './CalendarGrid.module.scss';
import { addMinutesToSlot, differenceInMinutes, slotToMinutes } from '../../utils/util';

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
  onEventDrop?: (
    event: CalendarEventData,
    next: { employeeId: string; start: string; end: string }
  ) => void;
  renderEvent?: (params: { event: CalendarEventData; isDragging: boolean }) => React.ReactNode;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  events = [],
  timeSlots = [],
  employeeIds = [],
  cellHeight = 80,
  stepMinutes = 30,
  use24HourFormat = false,
  onEventClick,
  onEventDrag,
  onEventDragEnd,
  onEventDrop,
  renderEvent
}) => {
  const displayTimeSlots = timeSlots.length > 0 ? timeSlots : [];
  const displayEmployeeIds = employeeIds.length > 0 ? employeeIds : [];
  const eventLayerRef = useRef<HTMLDivElement>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const dragOriginRef = useRef<{
    eventId: string;
    columnIndex: number;
    rowIndex: number;
    startSlot: string;
  } | null>(null);

  const hasDragCapability = Boolean(onEventDrop || onEventDrag || onEventDragEnd);

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${displayEmployeeIds.length}, 1fr)`,
      gridTemplateRows: `repeat(${displayTimeSlots.length}, ${cellHeight}px)`
    }),
    [cellHeight, displayEmployeeIds.length, displayTimeSlots.length]
  );

  const slotIntervalMinutes = useMemo(() => {
    if (displayTimeSlots.length < 2) {
      return stepMinutes > 0 ? stepMinutes : 30;
    }

    for (let i = 1; i < displayTimeSlots.length; i += 1) {
      const diff = differenceInMinutes(displayTimeSlots[0], displayTimeSlots[i]);
      if (diff > 0) {
        return diff;
      }
    }

    return stepMinutes > 0 ? stepMinutes : 30;
  }, [displayTimeSlots, stepMinutes]);

  const minSlotMinutes = useMemo(() => {
    if (displayTimeSlots.length === 0) {
      return 0;
    }
    return slotToMinutes(displayTimeSlots[0]) ?? 0;
  }, [displayTimeSlots]);

  const eventLayouts = useMemo(() => {
    const layoutMap = new Map<string, { column: number; columns: number }>();

    displayEmployeeIds.forEach(employeeId => {
      const employeeEvents = events
        .filter(evt => evt.employeeId === employeeId)
        .map(evt => {
          const start = slotToMinutes(evt.start);
          if (start === null) {
            return null;
          }
          const duration = differenceInMinutes(evt.start, evt.end);
          return {
            start,
            end: start + duration,
            event: evt
          };
        })
        .filter((value): value is { start: number; end: number; event: CalendarEventData } => value !== null)
        .sort((a, b) => a.start - b.start);

      const active: Array<{ id: string; end: number; column: number }> = [];

      employeeEvents.forEach(item => {
        for (let idx = active.length - 1; idx >= 0; idx -= 1) {
          if (active[idx].end <= item.start) {
            active.splice(idx, 1);
          }
        }

        const usedColumns = new Set(active.map(entry => entry.column));
        let column = 0;
        while (usedColumns.has(column)) {
          column += 1;
        }

        active.push({ id: item.event.id, end: item.end, column });
        const currentColumns = active.length;

        active.forEach(entry => {
          const existing = layoutMap.get(entry.id) ?? { column: entry.column, columns: 1 };
          existing.column = entry.column;
          existing.columns = Math.max(existing.columns, currentColumns);
          layoutMap.set(entry.id, existing);
        });
      });
    });

    return layoutMap;
  }, [displayEmployeeIds, events]);

  const clampIndex = useCallback((value: number, max: number) => {
    if (max <= 0) return 0;
    if (value < 0) return 0;
    if (value >= max) return max - 1;
    return value;
  }, []);

  const handleDragStart = useCallback(
    (event: CalendarEventData) => {
      setActiveEventId(event.id);

      const columnIndex = displayEmployeeIds.indexOf(event.employeeId);
      const rowIndex = (() => {
        const directIndex = displayTimeSlots.indexOf(event.start);
        if (directIndex !== -1) {
          return directIndex;
        }
        const startMinutes = slotToMinutes(event.start);
        if (startMinutes === null || slotIntervalMinutes <= 0) {
          return -1;
        }
        const relative = startMinutes - minSlotMinutes;
        const computed = Math.floor(relative / slotIntervalMinutes);
        return Math.max(0, Math.min(displayTimeSlots.length - 1, computed));
      })();

      if (columnIndex !== -1 && rowIndex !== -1) {
        dragOriginRef.current = {
          eventId: event.id,
          columnIndex,
          rowIndex,
          startSlot: event.start
        };
      } else {
        dragOriginRef.current = null;
      }
    },
    [displayEmployeeIds, displayTimeSlots, minSlotMinutes, slotIntervalMinutes]
  );

  const handleDrag = useCallback(
    (event: CalendarEventData, deltaX: number, deltaY: number) => {
      onEventDrag?.(event, deltaX, deltaY);
    },
    [onEventDrag]
  );

  const handleDragEnd = useCallback(
    (event: CalendarEventData, meta: CalendarEventDragMeta) => {
      setActiveEventId(null);

      const moved = Math.abs(meta.delta.x) > 1 || Math.abs(meta.delta.y) > 1;
      const origin =
        dragOriginRef.current && dragOriginRef.current.eventId === event.id
          ? dragOriginRef.current
          : null;

      const container = eventLayerRef.current;

      if (!moved || !origin || !container || displayEmployeeIds.length === 0 || displayTimeSlots.length === 0) {
        onEventDragEnd?.(event, event.employeeId, event.start);
        dragOriginRef.current = null;
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const columnWidth = containerRect.width / displayEmployeeIds.length;
      const effectiveStepMinutes = stepMinutes > 0 ? stepMinutes : slotIntervalMinutes;
      const pixelsPerStep = slotIntervalMinutes > 0 && effectiveStepMinutes > 0
        ? (cellHeight * effectiveStepMinutes) / slotIntervalMinutes
        : cellHeight;

      const columnOffset = columnWidth > 0 ? Math.round(meta.delta.x / columnWidth) : 0;
      const stepOffset = pixelsPerStep > 0 ? Math.round(meta.delta.y / pixelsPerStep) : 0;

      const targetColumn = clampIndex(origin.columnIndex + columnOffset, displayEmployeeIds.length);

      const durationMinutes = differenceInMinutes(event.start, event.end);
      const originStartMinutes = slotToMinutes(origin.startSlot) ?? minSlotMinutes;
      const lastSlot = displayTimeSlots[displayTimeSlots.length - 1];
      const lastSlotMinutes = slotToMinutes(lastSlot);

      const intervalMinutes = effectiveStepMinutes > 0 ? effectiveStepMinutes : 30;
      const candidateMinutes = originStartMinutes + stepOffset * intervalMinutes;

      const scheduleEndMinutes = lastSlotMinutes !== null
        ? lastSlotMinutes + slotIntervalMinutes
        : originStartMinutes + durationMinutes;

      const maxStartMinutes = scheduleEndMinutes - durationMinutes;

      const clampedStartMinutes = Math.max(minSlotMinutes, Math.min(candidateMinutes, maxStartMinutes));
      const targetEmployeeId = displayEmployeeIds[targetColumn];
      const offsetFromMin = clampedStartMinutes - minSlotMinutes;
      const baseSlot = displayTimeSlots[0] ?? origin.startSlot;
      const targetStart = addMinutesToSlot(baseSlot, offsetFromMin);

      const targetEnd = addMinutesToSlot(targetStart, durationMinutes);

      onEventDrop?.(event, {
        employeeId: targetEmployeeId,
        start: targetStart,
        end: targetEnd
      });

      onEventDragEnd?.(event, targetEmployeeId, targetStart);
      dragOriginRef.current = null;
    },
    [
      cellHeight,
      clampIndex,
      displayEmployeeIds,
      displayTimeSlots,
      onEventDragEnd,
      onEventDrop,
      slotIntervalMinutes,
      stepMinutes,
      minSlotMinutes
    ]
  );

  const renderCalendarEvent = useCallback(
    (calendarEvent: CalendarEventData) => {
      const employeeIndex = displayEmployeeIds.indexOf(calendarEvent.employeeId);

      if (employeeIndex === -1 || displayTimeSlots.length === 0) {
        return null;
      }

      const startMinutes = slotToMinutes(calendarEvent.start);
      if (startMinutes === null) {
        return null;
      }

      const eventDuration = differenceInMinutes(calendarEvent.start, calendarEvent.end);
      const interval = slotIntervalMinutes > 0 ? slotIntervalMinutes : ((stepMinutes > 0 ? stepMinutes : 30));
      const relativeStart = Math.max(0, startMinutes - minSlotMinutes);
      const baseRowIndex = interval > 0 ? Math.floor(relativeStart / interval) : 0;
      const clampedRowIndex = Math.min(Math.max(baseRowIndex, 0), displayTimeSlots.length - 1);
      const rowStart = clampedRowIndex + 1;
      const baseRowStartMinutes = minSlotMinutes + clampedRowIndex * interval;
      const offsetMinutes = Math.max(0, startMinutes - baseRowStartMinutes);
      const totalMinutes = offsetMinutes + eventDuration;
      const rowSpan = interval > 0 ? Math.max(1, Math.ceil(totalMinutes / interval)) : 1;
      const maxGridLine = displayTimeSlots.length + 1;
      const rowEnd = Math.min(maxGridLine, rowStart + rowSpan);

      const marginTop = interval > 0 ? (offsetMinutes / interval) * cellHeight : 0;
      const heightPx = interval > 0 ? (eventDuration / interval) * cellHeight : cellHeight;

      const layoutMeta = eventLayouts.get(calendarEvent.id);
      const overlapGap = 4;
      const CellWidth = 94;
      const widthPercent = layoutMeta ? CellWidth / layoutMeta.columns : 100;
      const widthStyle = layoutMeta && layoutMeta.columns > 1
        ? `calc(${widthPercent}% - ${overlapGap}px)`
        : '100%';
      const marginLeftStyle = layoutMeta && layoutMeta.columns > 1
        ? `calc(${widthPercent * layoutMeta.column}% + ${layoutMeta.column * overlapGap}px)`
        : undefined;

      const style: React.CSSProperties = {
        gridColumn: employeeIndex + 1,
        gridRowStart: rowStart,
        gridRowEnd: rowEnd,
        marginTop,
        height: `${Math.max(heightPx, 6)}px`,
        alignSelf: 'start',
        width: widthStyle
      };

      if (marginLeftStyle) {
        style.marginLeft = marginLeftStyle;
      }

      const container = eventLayerRef.current;
      const columnWidth = container && displayEmployeeIds.length > 0
        ? container.getBoundingClientRect().width / displayEmployeeIds.length
        : 0;

      const effectiveStepMinutes = stepMinutes > 0 ? stepMinutes : slotIntervalMinutes;
      const pixelsPerStep = slotIntervalMinutes > 0 && effectiveStepMinutes > 0
        ? (cellHeight * effectiveStepMinutes) / slotIntervalMinutes
        : cellHeight;

      const snapToGrid = columnWidth > 0 && pixelsPerStep > 0
        ? {
            columnWidth,
            rowHeight: pixelsPerStep
          }
        : undefined;

      return (
        <CalendarEvent
          key={calendarEvent.id}
          event={calendarEvent}
          style={style}
          draggable={hasDragCapability}
          isActive={activeEventId === calendarEvent.id}
          use24HourFormat={use24HourFormat}
          snapToGrid={snapToGrid}
          onClick={onEventClick}
          onDragStart={(evt, meta) => {
            handleDragStart(evt);
            handleDrag(evt, meta.delta.x, meta.delta.y);
          }}
          onDrag={(evt, meta) => {
            handleDrag(evt, meta.delta.x, meta.delta.y);
          }}
          onDragEnd={(evt, meta) => handleDragEnd(evt, meta)}
        >
          {renderEvent
            ? ((context: CalendarEventRenderContext) =>
                renderEvent({ event: context.event, isDragging: context.isDragging }))
            : undefined}
        </CalendarEvent>
      );
    },
    [
      activeEventId,
      minSlotMinutes,
      eventLayouts,
      displayEmployeeIds,
      displayTimeSlots,
      handleDrag,
      handleDragEnd,
      handleDragStart,
      hasDragCapability,
      onEventClick,
      renderEvent,
      slotIntervalMinutes,
      cellHeight,
      stepMinutes,
      use24HourFormat
    ]
  );

  return (
    <div className={styles.calendarGrid}>
      <div className={styles.gridContainer} style={gridStyle}>
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

      <div ref={eventLayerRef} className={styles.eventLayer} style={gridStyle}>
        {events.map(renderCalendarEvent)}
      </div>
    </div>
  );
};

export default CalendarGrid
