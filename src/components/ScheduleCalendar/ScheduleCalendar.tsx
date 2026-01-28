import React, { useCallback, useMemo, useState } from 'react'
import DayView from '../DayView'
import WeekView from '../WeekView'
import MonthView from '../MonthView'
import type { ScheduleCalendarProps, ScheduleCalendarView } from './types'

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
  view,
  defaultView = 'day',
  onViewChange,
  currentDate = new Date(),
  onDateChange,
  events = [],
  weekStartsOn = 1,
  headerActions,
  dateFormat,
  showViewSwitcher = true,
  className,
  style,
  dayViewProps,
  weekViewProps,
  monthViewProps,
}) => {
  const [internalView, setInternalView] = useState<ScheduleCalendarView>(
    defaultView
  )

  const resolvedView = view ?? internalView

  const handleViewChange = useCallback(
    (nextView: ScheduleCalendarView) => {
      if (view === undefined) {
        setInternalView(nextView)
      }
      onViewChange?.(nextView)
    },
    [onViewChange, view]
  )

  const sharedProps = useMemo(
    () => ({
      currentDate,
      onDateChange,
      headerActions,
      dateFormat,
      showViewSwitcher,
      view: resolvedView,
      onViewChange: handleViewChange,
      className,
      style,
    }),
    [
      currentDate,
      onDateChange,
      headerActions,
      dateFormat,
      showViewSwitcher,
      resolvedView,
      handleViewChange,
      className,
      style,
    ]
  )

  if (resolvedView === 'week') {
    return (
      <WeekView
        {...weekViewProps}
        {...sharedProps}
        weekStartsOn={weekStartsOn}
        events={events}
      />
    )
  }

  if (resolvedView === 'month') {
    return (
      <MonthView
        {...monthViewProps}
        {...sharedProps}
        weekStartsOn={weekStartsOn}
        events={events}
      />
    )
  }

  return (
    <DayView
      {...dayViewProps}
      {...sharedProps}
      events={events}
    />
  )
}

ScheduleCalendar.displayName = 'ScheduleCalendar'

export default ScheduleCalendar
