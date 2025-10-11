# Examples

This document provides comprehensive examples of how to use the schedule-calendar library in various scenarios.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Event Management](#event-management)
- [Block Times](#block-times)
- [Custom Rendering](#custom-rendering)
- [Time Formats](#time-formats)
- [Drag and Drop](#drag-and-drop)
- [Advanced Customization](#advanced-customization)
- [Real-world Scenarios](#real-world-scenarios)

## Basic Usage

### Simple Calendar Setup

```tsx
import React, { useState } from 'react'
import { DayView, CalendarEventData } from 'schedule-calendar'

function SimpleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const events: CalendarEventData[] = [
    {
      id: '1',
      title: 'Morning Meeting',
      start: '09:00',
      end: '10:00',
      employeeId: 'john',
      color: '#3b82f6',
    },
    {
      id: '2',
      title: 'Client Call',
      start: '14:30',
      end: '15:30',
      employeeId: 'jane',
      color: '#10b981',
    },
  ]

  return (
    <div style={{ height: '600px', width: '800px' }}>
      <DayView
        startHour={8}
        endHour={18}
        stepMinutes={30}
        employeeIds={['john', 'jane', 'mike']}
        events={events}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        use24HourFormat={true}
      />
    </div>
  )
}
```

### Using 12-Hour Format

```tsx
function TwelveHourCalendar() {
  return (
    <DayView
      startHour={9}
      endHour={17}
      stepMinutes={15}
      use24HourFormat={false} // Shows times like "9:00 AM", "2:30 PM"
      employeeIds={['emp1', 'emp2']}
      events={[
        {
          id: '1',
          title: 'Lunch Meeting',
          start: '12:00 PM',
          end: '1:00 PM',
          employeeId: 'emp1',
          color: '#f59e0b',
        },
      ]}
    />
  )
}
```

## Event Management

### Dynamic Event Updates

```tsx
import React, { useState, useCallback } from 'react'
import { DayView, CalendarEventData } from 'schedule-calendar'

function DynamicEvents() {
  const [events, setEvents] = useState<CalendarEventData[]>([
    {
      id: '1',
      title: 'Initial Event',
      start: '10:00',
      end: '11:00',
      employeeId: 'emp1',
      color: '#3b82f6',
    },
  ])

  const addEvent = useCallback(() => {
    const newEvent: CalendarEventData = {
      id: `event-${Date.now()}`,
      title: 'New Event',
      start: '14:00',
      end: '15:00',
      employeeId: 'emp2',
      color: '#10b981',
      description: 'Dynamically added event',
    }
    setEvents(prev => [...prev, newEvent])
  }, [])

  const handleEventClick = useCallback(
    (event: CalendarEventData, employee: { id: string; name: string }) => {
      console.log(`Clicked event: ${event.title} assigned to ${employee.name}`)

      // Example: Remove event on click
      setEvents(prev => prev.filter(e => e.id !== event.id))
    },
    []
  )

  const handleEventDrop = useCallback(
    (
      event: CalendarEventData,
      next: { employeeId: string; start: string; end: string }
    ) => {
      setEvents(prev =>
        prev.map(e =>
          e.id === event.id
            ? {
                ...e,
                employeeId: next.employeeId,
                start: next.start,
                end: next.end,
              }
            : e
        )
      )
    },
    []
  )

  return (
    <div>
      <button onClick={addEvent} style={{ marginBottom: '16px' }}>
        Add Event
      </button>
      <DayView
        events={events}
        employeeIds={['emp1', 'emp2', 'emp3']}
        onEventClick={handleEventClick}
        onEventDrop={handleEventDrop}
        startHour={8}
        endHour={18}
        stepMinutes={15}
      />
    </div>
  )
}
```

### Event with Rich Data

```tsx
interface ExtendedEventData extends CalendarEventData {
  priority: 'high' | 'medium' | 'low'
  attendees: string[]
  location?: string
}

function RichEvents() {
  const events: ExtendedEventData[] = [
    {
      id: '1',
      title: 'Board Meeting',
      start: '09:00',
      end: '11:00',
      employeeId: 'ceo',
      color: '#ef4444',
      description: 'Quarterly review and strategic planning',
      priority: 'high',
      attendees: ['CEO', 'CTO', 'CFO'],
      location: 'Conference Room A',
    },
    {
      id: '2',
      title: 'Team Standup',
      start: '09:30',
      end: '10:00',
      employeeId: 'dev1',
      color: '#3b82f6',
      description: 'Daily sync meeting',
      priority: 'medium',
      attendees: ['Dev Team'],
      location: 'Virtual',
    },
  ]

  return (
    <DayView
      events={events}
      employeeIds={['ceo', 'dev1', 'dev2']}
      renderEvent={({ event }) => {
        const extendedEvent = event as ExtendedEventData
        return (
          <div
            style={{
              padding: '8px',
              background: event.color,
              color: 'white',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {event.title}
              {extendedEvent.priority === 'high' && ' 🔥'}
            </div>
            <div>
              {event.start} - {event.end}
            </div>
            {extendedEvent.location && (
              <div style={{ fontSize: '10px', opacity: 0.9 }}>
                📍 {extendedEvent.location}
              </div>
            )}
            <div style={{ fontSize: '10px', opacity: 0.9 }}>
              👥 {extendedEvent.attendees.join(', ')}
            </div>
          </div>
        )
      }}
    />
  )
}
```

## Block Times

### Basic Block Times

```tsx
import { EmployeeBlockTimes, BlockTime } from 'schedule-calendar'

function CalendarWithBlockTimes() {
  const blockTimes: EmployeeBlockTimes = {
    emp1: [
      {
        id: 'lunch-1',
        employeeId: 'emp1',
        start: '12:00',
        end: '13:00',
        title: 'Lunch Break',
        color: '#fef3c7',
        type: 'unavailable',
      },
      {
        id: 'training-1',
        employeeId: 'emp1',
        start: '15:00',
        end: '16:00',
        title: 'Training Session',
        color: '#dbeafe',
        type: 'blocked',
      },
    ],
    emp2: [
      {
        id: 'maintenance-2',
        employeeId: 'emp2',
        start: '14:00',
        end: '17:00',
        title: 'System Maintenance',
        color: '#fee2e2',
        type: 'maintenance',
      },
    ],
  }

  const events: CalendarEventData[] = [
    {
      id: '1',
      title: 'Available Slot',
      start: '10:00',
      end: '11:00',
      employeeId: 'emp1',
      color: '#10b981',
    },
  ]

  return (
    <DayView
      events={events}
      blockTimes={blockTimes}
      employeeIds={['emp1', 'emp2', 'emp3']}
      onEventDrop={(event, next) => {
        // Block times prevent dropping events on blocked periods
        console.log('Event moved to:', next)
      }}
    />
  )
}
```

### Dynamic Block Times

```tsx
function DynamicBlockTimes() {
  const [blockTimes, setBlockTimes] = useState<EmployeeBlockTimes>({})

  const addBlockTime = useCallback(
    (employeeId: string, start: string, end: string, title: string) => {
      const newBlock: BlockTime = {
        id: `block-${Date.now()}`,
        employeeId,
        start,
        end,
        title,
        color: '#f3f4f6',
        type: 'blocked',
      }

      setBlockTimes(prev => ({
        ...prev,
        [employeeId]: [...(prev[employeeId] || []), newBlock],
      }))
    },
    []
  )

  return (
    <div>
      <button
        onClick={() => addBlockTime('emp1', '14:00', '15:00', 'Break')}
        style={{ marginBottom: '16px' }}
      >
        Add Block Time for Employee 1
      </button>

      <DayView
        blockTimes={blockTimes}
        employeeIds={['emp1', 'emp2']}
        onTimeLabelClick={(timeLabel, index, timeSlot, employee) => {
          // Quick block time creation
          const endTime = addMinutesToSlot(timeSlot, 30)
          addBlockTime(employee.id, timeSlot, endTime, 'Quick Block')
        }}
      />
    </div>
  )
}
```

## Custom Rendering

### Custom Event Appearance

```tsx
function CustomEventStyling() {
  const events: CalendarEventData[] = [
    {
      id: '1',
      title: 'High Priority',
      start: '09:00',
      end: '10:00',
      employeeId: 'emp1',
      color: '#ef4444',
      description: 'Urgent task',
    },
    {
      id: '2',
      title: 'Regular Task',
      start: '11:00',
      end: '12:00',
      employeeId: 'emp1',
      color: '#3b82f6',
    },
  ]

  return (
    <DayView
      events={events}
      employeeIds={['emp1', 'emp2']}
      renderEvent={({ event, isDragging }) => (
        <div
          style={{
            padding: '12px',
            background: `linear-gradient(135deg, ${event.color} 0%, ${event.color}dd 100%)`,
            color: 'white',
            borderRadius: '8px',
            border: '2px solid white',
            boxShadow: isDragging
              ? '0 8px 25px rgba(0,0,0,0.3)'
              : '0 2px 8px rgba(0,0,0,0.1)',
            transform: isDragging ? 'scale(1.02)' : 'scale(1)',
            transition: isDragging ? 'none' : 'all 0.2s ease-in-out',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Shine effect */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              animation: isDragging ? 'none' : 'shine 2s infinite',
            }}
          />

          <div
            style={{
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '4px',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            {event.title}
          </div>

          <div
            style={{
              fontSize: '12px',
              opacity: 0.9,
              marginBottom: '4px',
            }}
          >
            🕐 {event.start} - {event.end}
          </div>

          {event.description && (
            <div
              style={{
                fontSize: '10px',
                opacity: 0.8,
                fontStyle: 'italic',
              }}
            >
              {event.description}
            </div>
          )}

          {event.color === '#ef4444' && (
            <div
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                background: '#ffffff',
                color: '#ef4444',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
              }}
            >
              !
            </div>
          )}
        </div>
      )}
    />
  )
}
```

### Advanced Employee Headers

```tsx
function AdvancedEmployeeHeaders() {
  const employees = [
    {
      id: 'emp1',
      name: 'Sarah Chen',
      role: 'Developer',
      avatar: '👩‍💻',
      status: 'available',
    },
    {
      id: 'emp2',
      name: 'Mike Johnson',
      role: 'Designer',
      avatar: '👨‍🎨',
      status: 'busy',
    },
    {
      id: 'emp3',
      name: 'Alex Rivera',
      role: 'Manager',
      avatar: '👨‍💼',
      status: 'in-meeting',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#10b981'
      case 'busy':
        return '#f59e0b'
      case 'in-meeting':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  return (
    <DayView
      employeeIds={employees.map(e => e.id)}
      renderEmployee={(employee, index) => {
        const emp = employees.find(e => e.id === employee.id)!
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '16px 8px',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
              borderRight: '1px solid #e2e8f0',
              minHeight: '80px',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {/* Status indicator */}
            <div
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: getStatusColor(emp.status),
                border: '2px solid white',
                boxShadow: '0 0 0 1px rgba(0,0,0,0.1)',
              }}
            />

            {/* Avatar */}
            <div
              style={{
                fontSize: '24px',
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)',
              }}
            >
              {emp.avatar}
            </div>

            {/* Name */}
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '14px',
                color: '#1e293b',
                textAlign: 'center',
                marginBottom: '4px',
                lineHeight: '1.2',
              }}
            >
              {emp.name}
            </div>

            {/* Role */}
            <div
              style={{
                fontSize: '11px',
                color: '#64748b',
                textAlign: 'center',
                marginBottom: '6px',
                fontWeight: '500',
              }}
            >
              {emp.role}
            </div>

            {/* Status badge */}
            <div
              style={{
                fontSize: '9px',
                color: getStatusColor(emp.status),
                backgroundColor: `${getStatusColor(emp.status)}20`,
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {emp.status.replace('-', ' ')}
            </div>
          </div>
        )
      }}
      employeeHeaderProps={{
        minColumnWidth: 140,
        style: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
        },
      }}
    />
  )
}
```

## Time Formats

### Mixed Time Format Handling

```tsx
function MixedTimeFormats() {
  // The library automatically handles different time formats
  const events: CalendarEventData[] = [
    {
      id: '1',
      title: '24-hour format',
      start: '09:00', // 24-hour format
      end: '10:30',
      employeeId: 'emp1',
      color: '#3b82f6',
    },
    {
      id: '2',
      title: '12-hour format',
      start: '2:00 PM', // 12-hour format
      end: '3:30 PM',
      employeeId: 'emp2',
      color: '#10b981',
    },
  ]

  return (
    <DayView
      events={events}
      employeeIds={['emp1', 'emp2']}
      use24HourFormat={false} // Display in 12-hour format
      onEventClick={event => {
        console.log(`Event: ${event.title}`)
        console.log(`Start: ${event.start}, End: ${event.end}`)
      }}
    />
  )
}
```

### Time Utility Usage

```tsx
import {
  parseTimeSlot,
  slotToMinutes,
  addMinutesToSlot,
  differenceInMinutes,
  formatTime,
  generateTimeSlots,
} from 'schedule-calendar'

function TimeUtilityExample() {
  // Parse different time formats
  const parsed24 = parseTimeSlot('14:30')
  const parsed12 = parseTimeSlot('2:30 PM')

  // Convert to minutes from midnight
  const minutes = slotToMinutes('14:30') // 870 minutes

  // Add time
  const laterTime = addMinutesToSlot('14:30', 45) // "15:15"

  // Calculate duration
  const duration = differenceInMinutes('14:30', '16:00') // 90 minutes

  // Format time
  const formatted24 = formatTime(new Date(), true) // "14:30"
  const formatted12 = formatTime(new Date(), false) // "2:30 PM"

  // Generate time slots
  const timeSlots = generateTimeSlots(9, 17, 30, true)
  // ["09:00", "09:30", "10:00", ..., "17:00"]

  return (
    <div>
      <h3>Time Utility Examples</h3>
      <p>24-hour parse: {JSON.stringify(parsed24)}</p>
      <p>12-hour parse: {JSON.stringify(parsed12)}</p>
      <p>Minutes from midnight: {minutes}</p>
      <p>Add 45 minutes to 14:30: {laterTime}</p>
      <p>Duration 14:30 to 16:00: {duration} minutes</p>

      <DayView
        timeSlots={timeSlots}
        employeeIds={['emp1']}
        use24HourFormat={true}
      />
    </div>
  )
}
```

## Drag and Drop

### Advanced Drag Handling

```tsx
function AdvancedDragDrop() {
  const [events, setEvents] = useState<CalendarEventData[]>([
    {
      id: '1',
      title: 'Draggable Event',
      start: '10:00',
      end: '11:00',
      employeeId: 'emp1',
      color: '#3b82f6',
    },
  ])

  const [dragHistory, setDragHistory] = useState<string[]>([])

  const handleDragStart = useCallback((event: CalendarEventData) => {
    console.log('Drag started:', event.title)
    setDragHistory(prev => [...prev, `Started dragging: ${event.title}`])
  }, [])

  const handleDrag = useCallback(
    (event: CalendarEventData, deltaX: number, deltaY: number) => {
      // Optional: Live feedback during drag
      console.log(`Dragging ${event.title}: x=${deltaX}, y=${deltaY}`)
    },
    []
  )

  const handleDragEnd = useCallback(
    (event: CalendarEventData, newEmployeeId: string, newStart: string) => {
      console.log('Drag ended:', {
        event: event.title,
        newEmployeeId,
        newStart,
      })
      setDragHistory(prev => [
        ...prev,
        `Drag ended: ${event.title} -> ${newEmployeeId} at ${newStart}`,
      ])
    },
    []
  )

  const handleDrop = useCallback(
    (
      event: CalendarEventData,
      next: { employeeId: string; start: string; end: string }
    ) => {
      // Update event position
      setEvents(prev =>
        prev.map(e =>
          e.id === event.id
            ? {
                ...e,
                employeeId: next.employeeId,
                start: next.start,
                end: next.end,
              }
            : e
        )
      )

      setDragHistory(prev => [
        ...prev,
        `Dropped: ${event.title} at ${next.employeeId} (${next.start} - ${next.end})`,
      ])
    },
    []
  )

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h3>Drag History:</h3>
        <div
          style={{
            height: '100px',
            overflow: 'auto',
            background: '#f3f4f6',
            padding: '8px',
            fontSize: '12px',
          }}
        >
          {dragHistory.map((entry, index) => (
            <div key={index}>{entry}</div>
          ))}
        </div>
      </div>

      <DayView
        events={events}
        employeeIds={['emp1', 'emp2', 'emp3']}
        onEventDrag={handleDrag}
        onEventDragEnd={handleDragEnd}
        onEventDrop={handleDrop}
        stepMinutes={15} // Fine-grained snapping
      />
    </div>
  )
}
```

### Drag Constraints

```tsx
function ConstrainedDragDrop() {
  const [events, setEvents] = useState<CalendarEventData[]>([
    {
      id: '1',
      title: 'Meeting (Admin only)',
      start: '10:00',
      end: '11:00',
      employeeId: 'admin',
      color: '#ef4444',
    },
    {
      id: '2',
      title: 'Flexible Task',
      start: '14:00',
      end: '15:00',
      employeeId: 'emp1',
      color: '#10b981',
    },
  ])

  const handleDrop = useCallback(
    (
      event: CalendarEventData,
      next: { employeeId: string; start: string; end: string }
    ) => {
      // Example: Prevent moving admin events to other employees
      if (event.employeeId === 'admin' && next.employeeId !== 'admin') {
        alert('Admin events cannot be moved to other employees')
        return
      }

      // Example: Prevent scheduling outside business hours
      const startMinutes = slotToMinutes(next.start)
      const businessStart = 9 * 60 // 9:00 AM
      const businessEnd = 17 * 60 // 5:00 PM

      if (
        startMinutes &&
        (startMinutes < businessStart || startMinutes >= businessEnd)
      ) {
        alert('Events must be scheduled during business hours (9 AM - 5 PM)')
        return
      }

      // Allow the move
      setEvents(prev =>
        prev.map(e =>
          e.id === event.id
            ? {
                ...e,
                employeeId: next.employeeId,
                start: next.start,
                end: next.end,
              }
            : e
        )
      )
    },
    []
  )

  return (
    <DayView
      events={events}
      employeeIds={['admin', 'emp1', 'emp2']}
      onEventDrop={handleDrop}
      startHour={8}
      endHour={18}
      stepMinutes={30}
    />
  )
}
```

## Advanced Customization

### Multi-day Support Simulation

```tsx
function MultiDaySimulation() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [allEvents, setAllEvents] = useState<{
    [key: string]: CalendarEventData[]
  }>({
    '2024-01-15': [
      {
        id: '1',
        title: 'Monday Meeting',
        start: '09:00',
        end: '10:00',
        employeeId: 'emp1',
        color: '#3b82f6',
      },
    ],
    '2024-01-16': [
      {
        id: '2',
        title: 'Tuesday Task',
        start: '14:00',
        end: '15:00',
        employeeId: 'emp2',
        color: '#10b981',
      },
    ],
  })

  const dateKey = currentDate.toISOString().split('T')[0]
  const todaysEvents = allEvents[dateKey] || []

  const handleEventDrop = useCallback(
    (
      event: CalendarEventData,
      next: { employeeId: string; start: string; end: string }
    ) => {
      setAllEvents(prev => ({
        ...prev,
        [dateKey]: (prev[dateKey] || []).map(e =>
          e.id === event.id
            ? {
                ...e,
                employeeId: next.employeeId,
                start: next.start,
                end: next.end,
              }
            : e
        ),
      }))
    },
    [dateKey]
  )

  return (
    <DayView
      currentDate={currentDate}
      onDateChange={setCurrentDate}
      events={todaysEvents}
      employeeIds={['emp1', 'emp2', 'emp3']}
      onEventDrop={handleEventDrop}
      headerActions={
        <div>
          <span style={{ marginRight: '16px' }}>
            Events today: {todaysEvents.length}
          </span>
          <button
            onClick={() => {
              const newEvent: CalendarEventData = {
                id: `event-${Date.now()}`,
                title: 'New Event',
                start: '11:00',
                end: '12:00',
                employeeId: 'emp1',
                color: '#f59e0b',
              }
              setAllEvents(prev => ({
                ...prev,
                [dateKey]: [...(prev[dateKey] || []), newEvent],
              }))
            }}
          >
            Add Event
          </button>
        </div>
      }
    />
  )
}
```

### Integration with External State Management

```tsx
// Using with Redux/Zustand/Context
import { useCalendarStore } from './store/calendarStore'

function StateIntegratedCalendar() {
  const {
    events,
    employees,
    blockTimes,
    currentDate,
    updateEvent,
    setCurrentDate,
    addEvent,
    removeEvent,
  } = useCalendarStore()

  const handleTimeLabelClick = useCallback(
    (
      timeLabel: string,
      index: number,
      timeSlot: string,
      employee: { id: string; name: string }
    ) => {
      // Quick event creation
      const endTime = addMinutesToSlot(timeSlot, 60)
      const newEvent: CalendarEventData = {
        id: `quick-${Date.now()}`,
        title: 'Quick Event',
        start: timeSlot,
        end: endTime,
        employeeId: employee.id,
        color: '#3b82f6',
      }
      addEvent(newEvent)
    },
    [addEvent]
  )

  return (
    <DayView
      events={events}
      blockTimes={blockTimes}
      currentDate={currentDate}
      employeeIds={employees.map(e => e.id)}
      onDateChange={setCurrentDate}
      onEventDrop={(event, next) => {
        updateEvent(event.id, {
          employeeId: next.employeeId,
          start: next.start,
          end: next.end,
        })
      }}
      onTimeLabelClick={handleTimeLabelClick}
      renderEmployee={(employee, index) => {
        const emp = employees.find(e => e.id === employee.id)
        return (
          <div>
            {emp?.name}
            <div style={{ fontSize: '12px' }}>
              {events.filter(e => e.employeeId === emp?.id).length} events
            </div>
          </div>
        )
      }}
    />
  )
}
```

## Real-world Scenarios

### Medical Appointment Scheduler

```tsx
interface AppointmentData extends CalendarEventData {
  patientName: string
  appointmentType: 'consultation' | 'procedure' | 'followup'
  duration: number
  notes?: string
}

function MedicalScheduler() {
  const [appointments, setAppointments] = useState<AppointmentData[]>([
    {
      id: '1',
      title: 'John Doe - Consultation',
      start: '09:00',
      end: '09:30',
      employeeId: 'dr-smith',
      color: '#3b82f6',
      patientName: 'John Doe',
      appointmentType: 'consultation',
      duration: 30,
      notes: 'First visit',
    },
  ])

  const doctors = [
    { id: 'dr-smith', name: 'Dr. Smith', specialty: 'Cardiology' },
    { id: 'dr-jones', name: 'Dr. Jones', specialty: 'Neurology' },
  ]

  const lunchBreaks: EmployeeBlockTimes = {
    'dr-smith': [
      {
        id: 'lunch-smith',
        employeeId: 'dr-smith',
        start: '12:00',
        end: '13:00',
        title: 'Lunch Break',
        color: '#fef3c7',
        type: 'unavailable',
      },
    ],
    'dr-jones': [
      {
        id: 'lunch-jones',
        employeeId: 'dr-jones',
        start: '12:30',
        end: '13:30',
        title: 'Lunch Break',
        color: '#fef3c7',
        type: 'unavailable',
      },
    ],
  }

  return (
    <DayView
      startHour={8}
      endHour={18}
      stepMinutes={15}
      events={appointments}
      blockTimes={lunchBreaks}
      employeeIds={doctors.map(d => d.id)}
      renderEmployee={employee => {
        const doctor = doctors.find(d => d.id === employee.id)
        return (
          <div style={{ textAlign: 'center', padding: '12px' }}>
            <div style={{ fontWeight: 'bold' }}>{doctor?.name}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {doctor?.specialty}
            </div>
            <div style={{ fontSize: '10px', marginTop: '4px' }}>
              {appointments.filter(a => a.employeeId === employee.id).length}{' '}
              appointments
            </div>
          </div>
        )
      }}
      renderEvent={({ event }) => {
        const appointment = event as AppointmentData
        return (
          <div
            style={{
              padding: '8px',
              background: event.color,
              color: 'white',
              borderRadius: '4px',
              fontSize: '11px',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{appointment.patientName}</div>
            <div>{appointment.appointmentType}</div>
            <div>
              {event.start} - {event.end}
            </div>
            {appointment.notes && (
              <div style={{ fontSize: '9px', opacity: 0.8 }}>
                {appointment.notes}
              </div>
            )}
          </div>
        )
      }}
      onEventDrop={(event, next) => {
        setAppointments(prev =>
          prev.map(a =>
            a.id === event.id
              ? {
                  ...a,
                  employeeId: next.employeeId,
                  start: next.start,
                  end: next.end,
                }
              : a
          )
        )
      }}
      headerActions={
        <button
          onClick={() => {
            // Add new appointment logic
            console.log('Add new appointment')
          }}
        >
          New Appointment
        </button>
      }
    />
  )
}
```

### Service Booking System

```tsx
interface ServiceBooking extends CalendarEventData {
  serviceType: string
  customerName: string
  customerPhone: string
  estimatedDuration: number
  status: 'confirmed' | 'pending' | 'completed'
}

function ServiceBookingCalendar() {
  const [bookings, setBookings] = useState<ServiceBooking[]>([])
  const [technicians] = useState([
    { id: 'tech1', name: 'Mike Wilson', skills: ['plumbing', 'electrical'] },
    { id: 'tech2', name: 'Sarah Davis', skills: ['hvac', 'plumbing'] },
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10b981'
      case 'pending':
        return '#f59e0b'
      case 'completed':
        return '#6b7280'
      default:
        return '#3b82f6'
    }
  }

  return (
    <DayView
      startHour={8}
      endHour={17}
      stepMinutes={30}
      events={bookings}
      employeeIds={technicians.map(t => t.id)}
      renderEmployee={employee => {
        const tech = technicians.find(t => t.id === employee.id)
        const todayBookings = bookings.filter(b => b.employeeId === employee.id)
        return (
          <div style={{ padding: '12px', textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold' }}>{tech?.name}</div>
            <div style={{ fontSize: '10px', color: '#666' }}>
              Skills: {tech?.skills.join(', ')}
            </div>
            <div style={{ fontSize: '10px', marginTop: '4px' }}>
              {todayBookings.length} bookings today
            </div>
          </div>
        )
      }}
      renderEvent={({ event }) => {
        const booking = event as ServiceBooking
        return (
          <div
            style={{
              padding: '10px',
              background: getStatusColor(booking.status),
              color: 'white',
              borderRadius: '6px',
              fontSize: '11px',
              border: booking.status === 'pending' ? '2px dashed #fff' : 'none',
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{booking.serviceType}</div>
            <div>{booking.customerName}</div>
            <div>
              {event.start} - {event.end}
            </div>
            <div style={{ fontSize: '9px', opacity: 0.8 }}>
              📞 {booking.customerPhone}
            </div>
            <div
              style={{
                fontSize: '8px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '3px',
                padding: '2px 4px',
                marginTop: '4px',
                textTransform: 'uppercase',
              }}
            >
              {booking.status}
            </div>
          </div>
        )
      }}
      onEventClick={(event, employee) => {
        const booking = event as ServiceBooking
        console.log(
          `Booking clicked: ${booking.customerName} - ${booking.serviceType}`
        )
        // Open booking details modal
      }}
    />
  )
}
```

These examples demonstrate the flexibility and power of the schedule-calendar library for various use cases, from simple scheduling to complex business applications with custom rendering, state management, and advanced interactions.
