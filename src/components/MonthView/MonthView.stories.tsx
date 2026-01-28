import { useCallback, useState } from 'react'
import type { Story } from '@ladle/react'
import MonthView from './MonthView'
import type { CalendarEventData } from '../CalendarEvent'
import type {
  MonthViewEventClickHandler,
  MonthViewDateClickHandler,
  MonthViewMoreClickHandler,
} from './types'

function todayStr(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function dateStr(dayOffset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

const initialEvents: CalendarEventData[] = [
  {
    id: 'm-1',
    title: 'Team Standup',
    start: `${todayStr()} 09:00`,
    end: `${todayStr()} 09:30`,
    employeeId: 'team',
    color: '#3b82f6',
  },
  {
    id: 'm-2',
    title: 'Sprint Review',
    start: `${todayStr()} 14:00`,
    end: `${todayStr()} 15:00`,
    employeeId: 'team',
    color: '#8b5cf6',
  },
  {
    id: 'm-3',
    title: 'Client Meeting',
    start: `${dateStr(1)} 10:00`,
    end: `${dateStr(1)} 11:00`,
    employeeId: 'team',
    color: '#10b981',
  },
  {
    id: 'm-4',
    title: 'Workshop',
    start: `${dateStr(2)} 09:00`,
    end: `${dateStr(2)} 12:00`,
    employeeId: 'team',
    color: '#f59e0b',
    description: 'Full day workshop',
  },
  {
    id: 'm-5',
    title: 'Lunch Meeting',
    start: `${dateStr(3)} 12:00`,
    end: `${dateStr(3)} 13:00`,
    employeeId: 'team',
    color: '#ef4444',
  },
  {
    id: 'm-6',
    title: 'Planning',
    start: `${dateStr(5)} 09:00`,
    end: `${dateStr(5)} 10:00`,
    employeeId: 'team',
    color: '#06b6d4',
  },
  {
    id: 'm-7',
    title: 'Retrospective',
    start: `${dateStr(5)} 15:00`,
    end: `${dateStr(5)} 16:00`,
    employeeId: 'team',
    color: '#ec4899',
  },
  // Many events on one day to test "+N more"
  {
    id: 'm-8',
    title: 'Morning Sync',
    start: `${dateStr(-1)} 08:00`,
    end: `${dateStr(-1)} 08:30`,
    employeeId: 'team',
    color: '#6366f1',
  },
  {
    id: 'm-9',
    title: 'Code Review',
    start: `${dateStr(-1)} 10:00`,
    end: `${dateStr(-1)} 11:00`,
    employeeId: 'team',
    color: '#14b8a6',
  },
  {
    id: 'm-10',
    title: 'Design System',
    start: `${dateStr(-1)} 13:00`,
    end: `${dateStr(-1)} 14:00`,
    employeeId: 'team',
    color: '#a855f7',
  },
  {
    id: 'm-11',
    title: 'Demo Prep',
    start: `${dateStr(-1)} 15:00`,
    end: `${dateStr(-1)} 16:00`,
    employeeId: 'team',
    color: '#f97316',
  },
  {
    id: 'm-12',
    title: 'Team Dinner',
    start: `${dateStr(-1)} 18:00`,
    end: `${dateStr(-1)} 20:00`,
    employeeId: 'team',
    color: '#e11d48',
  },
]

export const MonthViews: Story = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  const handleEventClick = useCallback<MonthViewEventClickHandler>(
    (event, date) => {
      console.log('Event clicked:', { event, date })
      alert(`Event: ${event.title}\nDate: ${date}`)
    },
    []
  )

  const handleDateClick = useCallback<MonthViewDateClickHandler>(date => {
    console.log('Date clicked:', date)
  }, [])

  const handleMoreClick = useCallback<MonthViewMoreClickHandler>(
    (date, events) => {
      console.log('More clicked:', { date, count: events.length })
      alert(
        `${date}: ${events.length} events\n${events.map(e => e.title).join('\n')}`
      )
    },
    []
  )

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date)
    console.log('Month changed to:', date)
  }, [])

  return (
    <div
      style={{
        height: '800px',
        width: '1000px',
        padding: '0',
        background: '#f9fafb',
      }}
    >
      <MonthView
        events={initialEvents}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onEventClick={handleEventClick}
        onDateClick={handleDateClick}
        onMoreClick={handleMoreClick}
        maxEventsPerCell={3}
        headerActions={
          <button
            className="primaryButton"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </button>
        }
      />
    </div>
  )
}

export const MonthViewSundayStart: Story = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  return (
    <div
      style={{
        height: '800px',
        width: '1000px',
        padding: '0',
        background: '#f9fafb',
      }}
    >
      <MonthView
        events={initialEvents}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        weekStartsOn={0}
        maxEventsPerCell={2}
      />
    </div>
  )
}

export const MonthViewCustomRender: Story = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  return (
    <div
      style={{
        height: '800px',
        width: '1000px',
        padding: '0',
        background: '#f9fafb',
      }}
    >
      <MonthView
        events={initialEvents}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        renderEvent={({ event }) => (
          <div
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              background: event.color ?? '#3b82f6',
              color: '#fff',
              fontSize: '0.7rem',
              fontWeight: 600,
            }}
          >
            {event.title}
          </div>
        )}
        renderDayOfWeekHeader={(dayOfWeek, label) => (
          <span
            style={{
              color: dayOfWeek === 0 || dayOfWeek === 6 ? '#ef4444' : '#1e293b',
              fontWeight: 600,
            }}
          >
            {label}
          </span>
        )}
        eventStyle={{ marginBottom: '2px' }}
      />
    </div>
  )
}
