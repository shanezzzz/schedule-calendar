import { useState } from 'react'
import type { Story } from '@ladle/react'
import ScheduleCalendar from './ScheduleCalendar'
import type { ScheduleCalendarView } from './types'
import type { CalendarEventData } from '../CalendarEvent'

const today = new Date()
const y = today.getFullYear()
const m = String(today.getMonth() + 1).padStart(2, '0')
const d = String(today.getDate()).padStart(2, '0')
const dateStr = `${y}-${m}-${d}`

const events: CalendarEventData[] = [
  {
    id: 'sc-1',
    title: 'Daily Standup',
    start: `${dateStr} 09:00`,
    end: `${dateStr} 09:30`,
    employeeId: 'team',
    color: '#3b82f6',
  },
  {
    id: 'sc-2',
    title: 'Design Review',
    start: `${dateStr} 11:00`,
    end: `${dateStr} 12:00`,
    employeeId: 'team',
    color: '#8b5cf6',
  },
]

export const Default: Story = () => {
  const [view, setView] = useState<ScheduleCalendarView>('day')
  const [currentDate, setCurrentDate] = useState(new Date())

  return (
    <ScheduleCalendar
      view={view}
      onViewChange={setView}
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      events={events}
      dayViewProps={{ employees: [{ id: 'team', name: 'Team' }] }}
    />
  )
}
