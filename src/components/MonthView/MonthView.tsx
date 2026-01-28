import { useMemo, useCallback } from 'react'
import dayjs from 'dayjs'
import CalendarHeader from '@/components/CalendarHeader'
import { getMonthGrid } from '@/utils/dateUtils'
import MonthViewGrid from './MonthViewGrid'
import styles from './MonthView.module.scss'
import type { MonthViewProps } from './types'

const MonthView: React.FC<MonthViewProps> = ({
  currentDate = new Date(),
  weekStartsOn = 1,
  events = [],
  maxEventsPerCell = 3,
  dateFormat,
  onDateChange,
  headerActions,
  showViewSwitcher,
  view,
  onViewChange,
  onEventClick,
  onDateClick,
  onMoreClick,
  renderEvent,
  renderCell,
  renderDayOfWeekHeader,
  className,
  style,
  cellClassName,
  cellStyle,
  eventClassName,
  eventStyle,
}) => {
  const d = dayjs(currentDate)
  const year = d.year()
  const month = d.month()

  const grid = useMemo(
    () => getMonthGrid(year, month, weekStartsOn),
    [year, month, weekStartsOn]
  )

  const handleDateChange = useCallback(
    (date: Date) => onDateChange?.(date),
    [onDateChange]
  )

  const rootClassName = useMemo(
    () => [styles.monthView, className].filter(Boolean).join(' '),
    [className]
  )

  return (
    <div className={rootClassName} style={style}>
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={handleDateChange}
        actionsSection={headerActions}
        dateFormat={dateFormat}
        navigationUnit="month"
        showViewSwitcher={showViewSwitcher}
        view={view}
        onViewChange={onViewChange}
      />
      <MonthViewGrid
        grid={grid}
        currentMonth={month}
        events={events}
        maxEventsPerCell={maxEventsPerCell}
        weekStartsOn={weekStartsOn}
        onEventClick={onEventClick}
        onDateClick={onDateClick}
        onMoreClick={onMoreClick}
        renderEvent={renderEvent}
        renderCell={renderCell}
        renderDayOfWeekHeader={renderDayOfWeekHeader}
        cellClassName={cellClassName}
        cellStyle={cellStyle}
        eventClassName={eventClassName}
        eventStyle={eventStyle}
      />
    </div>
  )
}

MonthView.displayName = 'MonthView'

export default MonthView
