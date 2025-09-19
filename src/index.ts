
// Export days calendar components
export { default as DaysCalendar } from './components/days/DaysCalendar'
export { default as TimeColumn } from './components/days/TimeColumn'
export { default as EmployeeHeader } from './components/days/EmployeeHeader'
export { default as CurrentTimeLine } from './components/days/CurrentTimeLine'
export { default as ScheduleGrid } from './components/days/ScheduleGrid'
export { default as ScheduleEventItem } from './components/days/ScheduleEventItem'

export { default as CalendarGrid } from './components/CalendarGrid/CalendarGrid'
export { default as CalendarCell } from './components/CalendarCell/CalendarCell'

// Export days calendar types
export type { 
  DaysCalendarProps, 
  Employee, 
  ScheduleEvent 
} from './components/days/DaysCalendar'
export type { TimeColumnProps } from './components/days/TimeColumn'
export type { EmployeeHeaderProps } from './components/days/EmployeeHeader'
export type { CurrentTimeLineProps } from './components/days/CurrentTimeLine'
export type { ScheduleGridProps } from './components/days/ScheduleGrid'
export type { ScheduleEventItemProps } from './components/days/ScheduleEventItem'

// Auto-import styles - out of the box
import './styles/index.css'
