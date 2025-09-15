// Export all components
export { default as Calendar } from './components/Calendar'
export { default as CalendarHeader } from './components/CalendarHeader'
export { default as CalendarGrid } from './components/CalendarGrid'
export { default as CalendarCell } from './components/CalendarCell'

// Export types
export type { CalendarProps } from './components/Calendar'
export type { CalendarHeaderProps } from './components/CalendarHeader'
export type { CalendarGridProps } from './components/CalendarGrid'
export type { CalendarCellProps } from './components/CalendarCell'

// Auto-import styles - out of the box
import './styles/index.css'
