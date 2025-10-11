import type { Employee } from '../EmployeeHeader'
import type { BlockTime } from '../../types/blockTime'

export type CalendarCellEmployee = Pick<Employee, 'id' | 'name'>

export interface CalendarCellProps {
  timeSlot?: string
  stepMinutes?: number
  use24HourFormat?: boolean
  employeeId?: string
  employee?: CalendarCellEmployee
  blockTimes?: BlockTime[]
  onTimeLabelClick?: (
    timeLabel: string,
    index: number,
    timeSlot: string,
    employee: CalendarCellEmployee
  ) => void
  onBlockTimeClick?: (
    blockTime: BlockTime,
    timeSlot: string,
    employee: CalendarCellEmployee
  ) => void
}
