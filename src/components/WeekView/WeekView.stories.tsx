import { useCallback, useState } from 'react'
import type { Story } from '@ladle/react'
import WeekView from './WeekView'
import type { CalendarEventData } from '../CalendarEvent'
import type {
  WeekViewEventClickHandler,
  WeekViewEventDropHandler,
  WeekViewCellClickHandler,
} from './types'

// Helper to get dates for the current week (Mon–Sun)
function getCurrentWeekDate(dayOffset: number): string {
  const now = new Date()
  const day = now.getDay() // 0=Sun
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset + dayOffset)
  const y = monday.getFullYear()
  const m = String(monday.getMonth() + 1).padStart(2, '0')
  const d = String(monday.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const mon = getCurrentWeekDate(0)
const tue = getCurrentWeekDate(1)
const wed = getCurrentWeekDate(2)
const thu = getCurrentWeekDate(3)
const fri = getCurrentWeekDate(4)

const initialEvents: CalendarEventData[] = [
  {
    id: 'w-1',
    title: 'Standup',
    start: `${mon} 09:00`,
    end: `${mon} 09:30`,
    employeeId: 'team',
    color: '#3b82f6',
    description: 'Daily sync',
  },
  {
    id: 'w-2',
    title: 'Design Review',
    start: `${mon} 10:00`,
    end: `${mon} 11:30`,
    employeeId: 'team',
    color: '#8b5cf6',
    description: 'Sprint UI review',
  },
  {
    id: 'w-3',
    title: 'Client Call',
    start: `${tue} 14:00`,
    end: `${tue} 15:00`,
    employeeId: 'team',
    color: '#10b981',
  },
  {
    id: 'w-4',
    title: '1:1 with Manager',
    start: `${wed} 11:00`,
    end: `${wed} 11:30`,
    employeeId: 'team',
    color: '#f59e0b',
  },
  {
    id: 'w-5',
    title: 'Sprint Planning',
    start: `${thu} 09:00`,
    end: `${thu} 10:30`,
    employeeId: 'team',
    color: '#ef4444',
    description: 'Plan next sprint',
  },
  {
    id: 'w-6',
    title: 'Code Review',
    start: `${thu} 14:00`,
    end: `${thu} 15:00`,
    employeeId: 'team',
    color: '#06b6d4',
  },
  {
    id: 'w-7',
    title: 'Team Retro',
    start: `${fri} 16:00`,
    end: `${fri} 17:00`,
    employeeId: 'team',
    color: '#ec4899',
  },
  // Overlapping events on Monday
  {
    id: 'w-8',
    title: 'Conflicting Meeting',
    start: `${mon} 09:00`,
    end: `${mon} 10:00`,
    employeeId: 'team',
    color: '#f97316',
  },
]

export const WeekViews: Story = () => {
  const [events, setEvents] = useState<CalendarEventData[]>(initialEvents)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  const handleEventClick = useCallback<WeekViewEventClickHandler>(
    (event, date) => {
      console.log('Event clicked:', { event, date })
      alert(
        `Event: ${event.title}\nDate: ${date}\n${event.start} - ${event.end}`
      )
    },
    []
  )

  const handleDrop = useCallback<WeekViewEventDropHandler>((event, next) => {
    console.log('Event dropped:', { event, next })
    setEvents(prev =>
      prev.map(item =>
        item.id === event.id
          ? {
              ...item,
              start: `${next.date} ${next.start}`,
              end: `${next.date} ${next.end}`,
            }
          : item
      )
    )
  }, [])

  const handleCellClick = useCallback<WeekViewCellClickHandler>(
    (timeSlot, date) => {
      console.log('Cell clicked:', { timeSlot, date })
    },
    []
  )

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date)
    console.log('Date changed to:', date)
  }, [])

  return (
    <div
      style={{
        height: '900px',
        width: '1200px',
        padding: '0',
        background: '#f9fafb',
      }}
    >
      <WeekView
        startHour={7}
        endHour={22}
        stepMinutes={15}
        use24HourFormat
        events={events}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onEventClick={handleEventClick}
        onEventDrop={handleDrop}
        onCellClick={handleCellClick}
        headerActions={
          <button
            className="primaryButton"
            onClick={() => {
              const id = `w-new-${Date.now()}`
              setEvents(prev => [
                ...prev,
                {
                  id,
                  title: 'New Event',
                  start: `${mon} 12:00`,
                  end: `${mon} 13:00`,
                  employeeId: 'team',
                  color: '#6366f1',
                },
              ])
            }}
          >
            Add Event
          </button>
        }
      />
    </div>
  )
}

export const WeekViewCustomRender: Story = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  return (
    <div
      style={{
        height: '900px',
        width: '1200px',
        padding: '0',
        background: '#f9fafb',
      }}
    >
      <WeekView
        startHour={8}
        endHour={20}
        stepMinutes={30}
        events={initialEvents}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        weekStartsOn={0}
        renderEvent={({ event }) => (
          <div style={{ padding: '4px 8px', color: '#fff' }}>
            <div style={{ fontWeight: 600, fontSize: 11 }}>{event.title}</div>
            <div style={{ fontSize: 10, opacity: 0.8 }}>
              {event.description || 'No description'}
            </div>
          </div>
        )}
        renderDayHeader={(dateStr, dayOfWeek) => (
          <div
            style={{
              textAlign: 'center',
              padding: '8px',
              fontWeight: dayOfWeek === 0 || dayOfWeek === 6 ? 400 : 600,
              color: dayOfWeek === 0 || dayOfWeek === 6 ? '#94a3b8' : '#1e293b',
            }}
          >
            {dateStr.slice(-2)}
          </div>
        )}
        eventStyle={{ borderRadius: '8px' }}
      />
    </div>
  )
}
