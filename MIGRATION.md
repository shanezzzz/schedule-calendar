# Migration Guide

This guide helps you migrate from basic calendar usage to the comprehensive day-view scheduler features.

## Component Name Changes

### Old vs New Imports

**Before:**

```tsx
import { Calendar } from 'schedule-calendar'

;<Calendar value={selectedDate} onChange={setSelectedDate} />
```

**After:**

```tsx
import { DayView, CalendarEventData } from 'schedule-calendar'

;<DayView
  currentDate={selectedDate}
  onDateChange={setSelectedDate}
  events={events}
  employeeIds={employeeIds}
/>
```

## Key Differences

### 1. From Simple Date Selection to Event Scheduling

The library has evolved from a simple date picker to a comprehensive scheduling system:

**Old Focus:**

- Date selection
- Basic calendar navigation

**New Focus:**

- Day-view event scheduling
- Employee/resource management
- Drag-and-drop events
- Time slot management
- Block time support

### 2. New Required Props

The `DayView` component requires different props than the old `Calendar`:

```tsx
// Minimum required setup
<DayView
  employeeIds={['emp1', 'emp2', 'emp3']} // Required for columns
  events={eventArray} // Events to display
/>
```

### 3. Event Data Structure

Events now use a specific data structure:

```tsx
interface CalendarEventData {
  id: string // Required unique identifier
  title?: string // Event title
  start: string // Start time ("09:00" or "9:00 AM")
  end: string // End time ("10:00" or "10:00 AM")
  employeeId: string // Which employee/resource
  color?: string // Background color
  description?: string // Optional description
}
```

## Migration Steps

### Step 1: Update Imports

```tsx
// Old
import { Calendar } from 'schedule-calendar'

// New
import { DayView, CalendarEventData, Employee } from 'schedule-calendar'
```

### Step 2: Prepare Event Data

```tsx
// Create your events array
const events: CalendarEventData[] = [
  {
    id: '1',
    title: 'Morning Meeting',
    start: '09:00',
    end: '10:00',
    employeeId: 'john',
    color: '#3b82f6',
  },
  // ... more events
]
```

### Step 3: Define Employees/Resources

```tsx
// Simple employee IDs
const employeeIds = ['john', 'jane', 'mike']

// Or with employee objects for custom rendering
const employees: Employee[] = [
  { id: 'john', name: 'John Doe' },
  { id: 'jane', name: 'Jane Smith' },
  { id: 'mike', name: 'Mike Johnson' },
]
```

### Step 4: Update Component Usage

```tsx
// Replace old Calendar with DayView
function MyScheduler() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEventData[]>([])

  return (
    <div style={{ height: '600px', width: '1000px' }}>
      <DayView
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        events={events}
        employeeIds={['john', 'jane', 'mike']}
        startHour={8}
        endHour={18}
        stepMinutes={30}
        use24HourFormat={true}
      />
    </div>
  )
}
```

## Feature Mapping

### Date Navigation

**Old:**

```tsx
<Calendar
  value={selectedDate}
  onChange={setSelectedDate}
  minDate={minDate}
  maxDate={maxDate}
/>
```

**New:**

```tsx
<DayView
  currentDate={selectedDate}
  onDateChange={setSelectedDate}
  // Date restrictions handled in your onDateChange logic
/>
```

### Custom Styling

**Old:**

```tsx
<Calendar className="custom-calendar" style={{ width: '300px' }} />
```

**New:**

```tsx
<DayView
  // Wrap in a container for styling
  employeeHeaderProps={{
    className: 'custom-employee-header',
    style: { background: '#f0f0f0' },
  }}
/>
```

## Advanced Features Migration

### Adding Event Management

If you were using the calendar for event planning, you can now use full scheduling:

```tsx
function AdvancedScheduler() {
  const [events, setEvents] = useState<CalendarEventData[]>([])

  const handleEventDrop = (event: CalendarEventData, next: any) => {
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
  }

  const handleEventClick = (event: CalendarEventData) => {
    // Handle event interaction
    console.log('Event clicked:', event)
  }

  return (
    <DayView
      events={events}
      employeeIds={['resource1', 'resource2']}
      onEventDrop={handleEventDrop}
      onEventClick={handleEventClick}
      // Enable drag and drop
      stepMinutes={15} // Fine-grained snapping
    />
  )
}
```

### Adding Block Times

For unavailable periods (new feature):

```tsx
const blockTimes = {
  'john': [
    {
      id: 'lunch',
      employeeId: 'john',
      start: '12:00',
      end: '13:00',
      title: 'Lunch Break',
      color: '#fef3c7',
      type: 'unavailable' as const
    }
  ]
}

<DayView
  blockTimes={blockTimes}
  // ... other props
/>
```

## Common Patterns

### Pattern 1: Simple Appointment Scheduler

```tsx
function AppointmentScheduler() {
  const [appointments, setAppointments] = useState<CalendarEventData[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())

  return (
    <DayView
      currentDate={selectedDate}
      onDateChange={setSelectedDate}
      events={appointments}
      employeeIds={['doctor1', 'doctor2']}
      startHour={9}
      endHour={17}
      stepMinutes={30}
      onTimeLabelClick={(timeSlot, index, employee) => {
        // Quick appointment creation
        const newAppointment: CalendarEventData = {
          id: `apt-${Date.now()}`,
          title: 'New Appointment',
          start: timeSlot,
          end: addMinutesToSlot(timeSlot, 30),
          employeeId: employee.id,
          color: '#3b82f6',
        }
        setAppointments(prev => [...prev, newAppointment])
      }}
    />
  )
}
```

### Pattern 2: Resource Booking

```tsx
function ResourceBooking() {
  return (
    <DayView
      employeeIds={['room-a', 'room-b', 'room-c']}
      renderEmployee={employee => (
        <div style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontWeight: 'bold' }}>
            {employee.name.replace('-', ' ').toUpperCase()}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Conference Room</div>
        </div>
      )}
      events={roomBookings}
      onEventDrop={(event, next) => {
        // Handle room change
        updateBooking(event.id, next)
      }}
    />
  )
}
```

## Troubleshooting

### Common Issues

1. **"No columns showing"**
   - Make sure `employeeIds` is provided and not empty
   - Check that employee IDs in events match those in `employeeIds`

2. **"Events not displaying"**
   - Ensure events have valid `start` and `end` times
   - Check that `employeeId` in events matches one in `employeeIds`
   - Verify time format is supported ("HH:MM" or "H:MM AM/PM")

3. **"Drag and drop not working"**
   - Provide `onEventDrop` callback
   - Ensure `stepMinutes` is set appropriately
   - Check that events are not in blocked time periods

4. **"Time format issues"**
   - Use consistent time formats in your data
   - Set `use24HourFormat` prop appropriately
   - The library auto-parses both "14:30" and "2:30 PM" formats

### Getting Help

1. Check the [API Documentation](./API.md) for detailed prop descriptions
2. Review [Examples](./EXAMPLES.md) for common use cases
3. Use the interactive Storybook documentation: `npm run storybook`
4. Check browser console for any error messages

## Benefits of Migration

After migrating, you'll have access to:

- **Drag and Drop**: Move events between employees and time slots
- **Block Times**: Define unavailable periods
- **Custom Rendering**: Completely customize event and employee appearance
- **Time Flexibility**: Support for both 12-hour and 24-hour formats
- **Event Management**: Rich event data with titles, descriptions, colors
- **Real-time Updates**: Live current time indicator
- **Responsive Design**: Mobile-friendly scheduler
- **Accessibility**: Full keyboard navigation and screen reader support

The migration enables you to build sophisticated scheduling applications with minimal code while maintaining full customization control.
