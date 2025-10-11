import type { Employee } from '../EmployeeHeader'

export type CalendarCellEmployee = Pick<Employee, 'id' | 'name'>

export interface CalendarCellProps {
  timeSlot?: string
  stepMinutes?: number
  use24HourFormat?: boolean
  employeeId?: string
  employee?: CalendarCellEmployee
  onTimeLabelClick?: (
    timeLabel: string,
    index: number,
    timeSlot: string,
    employee: CalendarCellEmployee
  ) => void
}
