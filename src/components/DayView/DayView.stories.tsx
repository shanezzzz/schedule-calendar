import { useCallback, useState } from 'react'
import type { Story } from '@ladle/react'
import DayView from './DayView'
import { CalendarEventData } from '../CalendarEvent/CalendarEvent'

const initialEvents: CalendarEventData[] = [
  {
    id: 'evt-1',
    title: 'Standup Meeting',
    start: '08:00',
    end: '09:00',
    employeeId: 'Carry',
    color: '#2563eb',
    description: 'Daily sync with the product squad',
  },
  {
    id: 'evt-2',
    title: 'Client Call',
    start: '09:30',
    end: '10:30',
    employeeId: 'Lucy',
    color: '#10b981',
    description: 'Review contract milestones',
  },
  {
    id: 'evt-3',
    title: 'Design Review',
    start: '11:00',
    end: '12:00',
    employeeId: 'John',
    color: '#f59e0b',
    description: 'UI/UX direction for upcoming sprint',
  },
  {
    id: 'evt-4',
    title: 'Design Review',
    start: '11:00',
    end: '12:00',
    employeeId: 'Tom',
  },
]

export const DayViews: Story = () => {
  const [events, setEvents] = useState<CalendarEventData[]>(initialEvents)

  console.log('events', events)

  const handleDrop = useCallback(
    (
      event: CalendarEventData,
      next: { employeeId: string; start: string; end: string }
    ) => {
      setEvents(prev =>
        prev.map(item =>
          item.id === event.id
            ? {
                ...item,
                employeeId: next.employeeId,
                start: next.start,
                end: next.end,
              }
            : item
        )
      )
    },
    []
  )

  return (
    <div style={{ height: '800px', width: '1000px', padding: '10px' }}>
      <DayView
        startHour={7}
        endHour={23}
        stepMinutes={15}
        use24HourFormat
        employeeIds={['Carry', 'Lucy', 'John', 'Tom', 'Jerry', 'Alice', 'Bob']}
        events={events}
        onEventDrop={handleDrop}
        renderEvent={({ event }) => (
          <div style={{ padding: '6px 8px', color: '#ffffff' }}>
            <div style={{ fontWeight: 600, fontSize: 12 }}>{event.title}</div>
            <div
              style={{ fontSize: 10 }}
            >{`${event.start} - ${event.end}`}</div>
            {event.description && (
              <div style={{ fontSize: 10, opacity: 0.85 }}>
                {event.description}
              </div>
            )}
          </div>
        )}
      />
    </div>
  )
}
