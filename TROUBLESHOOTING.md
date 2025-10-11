# Troubleshooting Guide

This guide helps you resolve common issues when using the schedule-calendar library.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Component Rendering Issues](#component-rendering-issues)
- [Event Display Problems](#event-display-problems)
- [Drag and Drop Issues](#drag-and-drop-issues)
- [Time Format Problems](#time-format-problems)
- [Performance Issues](#performance-issues)
- [TypeScript Issues](#typescript-issues)
- [Styling Problems](#styling-problems)

## Installation Issues

### Package Not Found

**Problem:** `npm install schedule-calendar` fails or package not found

**Solutions:**

1. Check if you're using the correct package name
2. Try clearing npm cache: `npm cache clean --force`
3. For local development, ensure you've built the package: `npm run build`
4. For npm link issues:

   ```bash
   # In the library project
   npm run build
   npm link

   # In your project
   npm link schedule-calendar
   ```

### Peer Dependencies Warning

**Problem:** Warnings about React peer dependencies

**Solution:**

```bash
npm install react@^18.0.0 react-dom@^18.0.0
```

The library requires React 18 or higher.

### TypeScript Declaration Issues

**Problem:** TypeScript can't find type declarations

**Solutions:**

1. Ensure the library is built: `npm run build`
2. Check that `dist/index.d.ts` exists
3. Add to your `tsconfig.json`:
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true
     }
   }
   ```

## Component Rendering Issues

### Nothing Renders / Blank Screen

**Problem:** The DayView component doesn't show anything

**Common Causes & Solutions:**

1. **Missing employee IDs:**

   ```tsx
   // ❌ Wrong - empty or missing employeeIds
   <DayView events={events} />

   // ✅ Correct
   <DayView
     employeeIds={['emp1', 'emp2', 'emp3']}
     events={events}
   />
   ```

2. **Container has no height:**

   ```tsx
   // ❌ Wrong - no height specified
   <div>
     <DayView events={events} employeeIds={['emp1']} />
   </div>

   // ✅ Correct
   <div style={{ height: '600px', width: '100%' }}>
     <DayView events={events} employeeIds={['emp1']} />
   </div>
   ```

3. **Invalid time range:**

   ```tsx
   // ❌ Wrong - end hour before start hour
   <DayView startHour={18} endHour={9} />

   // ✅ Correct
   <DayView startHour={9} endHour={18} />
   ```

### Layout Issues

**Problem:** Components are not aligned properly

**Solutions:**

1. **Time column not aligned with events:**

   ```tsx
   // Ensure consistent cellHeight across TimeColumn and CalendarGrid
   <DayView
     cellHeight={40} // This should be consistent
     stepMinutes={30}
   />
   ```

2. **Employee header height mismatch:**
   ```tsx
   // The library automatically handles this, but if you have custom styling:
   <DayView
     employeeHeaderProps={{
       style: { minHeight: '60px' }, // Adjust as needed
     }}
   />
   ```

## Event Display Problems

### Events Not Showing

**Problem:** Events are defined but not visible

**Debugging Steps:**

1. **Check event data structure:**

   ```tsx
   // ✅ Correct event structure
   const events: CalendarEventData[] = [
     {
       id: '1', // Required: unique ID
       title: 'Meeting', // Optional but recommended
       start: '09:00', // Required: valid time format
       end: '10:00', // Required: valid time format
       employeeId: 'emp1', // Required: must match employeeIds
       color: '#3b82f6', // Optional
     },
   ]
   ```

2. **Verify employee ID matching:**

   ```tsx
   // ❌ Wrong - employeeId doesn't match
   const employeeIds = ['john', 'jane']
   const events = [
     { id: '1', employeeId: 'mike', start: '09:00', end: '10:00' }, // 'mike' not in employeeIds
   ]

   // ✅ Correct
   const employeeIds = ['john', 'jane', 'mike']
   ```

3. **Check time format:**

   ```tsx
   // ✅ Supported formats
   start: '09:00' // 24-hour
   start: '9:00 AM' // 12-hour
   start: '14:30' // 24-hour with minutes
   start: '2:30 PM' // 12-hour with minutes

   // ❌ Unsupported formats
   start: '9' // Missing minutes
   start: '9:00:00' // Seconds not supported
   start: 'morning' // Text not supported
   ```

4. **Time range validation:**
   ```tsx
   // Ensure events fall within the displayed time range
   <DayView
     startHour={9}
     endHour={17}
     events={[
       { start: '08:00', end: '09:00' }  // ❌ Before startHour
       { start: '18:00', end: '19:00' }  // ❌ After endHour
       { start: '10:00', end: '11:00' }  // ✅ Within range
     ]}
   />
   ```

### Events Appear in Wrong Position

**Problem:** Events show up in incorrect time slots or columns

**Solutions:**

1. **Check time parsing:**

   ```tsx
   import { parseTimeSlot, slotToMinutes } from 'schedule-calendar'

   // Debug time parsing
   console.log(parseTimeSlot('9:30 AM')) // Should return { success: true, data: { hours: 9, minutes: 30 }}
   console.log(slotToMinutes('9:30 AM')) // Should return 570
   ```

2. **Verify stepMinutes configuration:**

   ```tsx
   // If using 15-minute intervals
   <DayView
     stepMinutes={15}
     displayIntervalMinutes={30} // Time labels every 30 min
     events={events}
   />
   ```

3. **Check for overlapping events:**
   ```tsx
   // The library automatically handles overlapping events
   // But ensure your data is correct
   const events = [
     { id: '1', start: '09:00', end: '10:00', employeeId: 'emp1' },
     { id: '2', start: '09:30', end: '10:30', employeeId: 'emp1' }, // Overlaps with event 1
   ]
   ```

## Drag and Drop Issues

### Drag and Drop Not Working

**Problem:** Events cannot be dragged

**Solutions:**

1. **Ensure drag handlers are provided:**

   ```tsx
   // ❌ Wrong - no drag handlers
   <DayView events={events} />

   // ✅ Correct - with drag handlers
   <DayView
     events={events}
     onEventDrop={(event, next) => {
       // Update your state here
       setEvents(prev => prev.map(e =>
         e.id === event.id ? { ...e, ...next } : e
       ))
     }}
   />
   ```

2. **Check event structure for dragging:**
   ```tsx
   // Events must have proper IDs for drag tracking
   const events = [
     {
       id: 'unique-id-1', // Required for drag operations
       // ... other properties
     },
   ]
   ```

### Events Snap to Wrong Positions

**Problem:** Dragged events don't snap to expected time slots

**Solutions:**

1. **Adjust stepMinutes:**

   ```tsx
   // For 15-minute precision
   <DayView stepMinutes={15} />

   // For 30-minute precision
   <DayView stepMinutes={30} />
   ```

2. **Check grid configuration:**
   ```tsx
   <DayView
     cellHeight={40} // Affects vertical snapping
     stepMinutes={30} // Affects time precision
     displayIntervalMinutes={30} // Affects display granularity
   />
   ```

### Events Can't Be Dropped on Block Times

**Problem:** This is expected behavior

**Explanation:** Events cannot be dropped on blocked time periods. This is by design.

**Solution:** If you need to allow this, handle it in your drop handler:

```tsx
<DayView
  onEventDrop={(event, next) => {
    // You can implement custom logic here
    // For example, show a confirmation dialog
    if (isTimeBlocked(next.start, next.end, blockTimes[next.employeeId])) {
      if (confirm('This time slot is blocked. Proceed anyway?')) {
        // Allow the drop
        updateEvent(event, next)
      }
    } else {
      updateEvent(event, next)
    }
  }}
/>
```

## Time Format Problems

### Mixed Time Formats Not Working

**Problem:** Using both 12-hour and 24-hour formats causes issues

**Solutions:**

1. **The library supports mixed formats automatically:**

   ```tsx
   const events = [
     { start: '09:00', end: '10:00' }, // 24-hour
     { start: '2:30 PM', end: '3:30 PM' }, // 12-hour
   ]
   // Both work together seamlessly
   ```

2. **Use consistent display format:**
   ```tsx
   <DayView
     use24HourFormat={true} // Display all times in 24-hour format
     events={events} // Can contain mixed input formats
   />
   ```

### Invalid Time Error

**Problem:** "Invalid time format" errors

**Solutions:**

1. **Check time string format:**

   ```tsx
   // ✅ Valid formats
   '09:00'
   '9:00 AM'
   '14:30'
   '2:30 PM'

   // ❌ Invalid formats
   '9' // Missing minutes
   '25:00' // Invalid hour
   '12:60' // Invalid minutes
   '9:00 XM' // Invalid AM/PM
   ```

2. **Use time utilities for validation:**

   ```tsx
   import { parseTimeSlot } from 'schedule-calendar'

   const validateTime = (timeString: string) => {
     const result = parseTimeSlot(timeString)
     if (!result.success) {
       console.error('Invalid time:', result.error)
       return false
     }
     return true
   }
   ```

## Performance Issues

### Slow Rendering with Many Events

**Problem:** Performance degrades with large numbers of events

**Solutions:**

1. **Optimize event data:**

   ```tsx
   // Use memo for stable references
   const events = useMemo(() =>
     rawEvents.filter(event =>
       // Filter to only show events for current date
       event.date === currentDate.toISOString().split('T')[0]
     ), [rawEvents, currentDate]
   )

   const handleEventDrop = useCallback((event, next) => {
     // Use callback to prevent recreating on every render
     updateEvent(event.id, next)
   }, [])

   <DayView
     events={events}
     onEventDrop={handleEventDrop}
   />
   ```

2. **Limit visible time range:**

   ```tsx
   // Show smaller time windows for better performance
   <DayView
     startHour={8} // Instead of 0
     endHour={18} // Instead of 23
     stepMinutes={30} // Instead of 15 for fewer time slots
   />
   ```

3. **Virtualization for many employees:**

   ```tsx
   // If you have many employees, consider showing only relevant ones
   const visibleEmployees = employees.slice(0, 10)  // Show first 10

   <DayView employeeIds={visibleEmployees.map(e => e.id)} />
   ```

### Memory Leaks

**Problem:** Memory usage increases over time

**Solutions:**

1. **Clean up event listeners:**

   ```tsx
   useEffect(() => {
     // If you're adding external event listeners
     const handleResize = () => {
       /* ... */
     }
     window.addEventListener('resize', handleResize)

     return () => {
       window.removeEventListener('resize', handleResize)
     }
   }, [])
   ```

2. **Use proper dependency arrays:**

   ```tsx
   // ❌ Wrong - missing dependencies
   const handleDrop = useCallback((event, next) => {
     updateEvents(events, event, next)
   }, [])

   // ✅ Correct - proper dependencies
   const handleDrop = useCallback(
     (event, next) => {
       updateEvents(events, event, next)
     },
     [events, updateEvents]
   )
   ```

## TypeScript Issues

### Type Errors

**Problem:** TypeScript compilation errors

**Common Solutions:**

1. **Import types correctly:**

   ```tsx
   import { DayView, CalendarEventData, Employee } from 'schedule-calendar'
   import type { DayViewProps, EmployeeBlockTimes } from 'schedule-calendar'
   ```

2. **Use proper event type:**

   ```tsx
   // ✅ Correct typing
   const events: CalendarEventData[] = [
     {
       id: '1',
       title: 'Meeting',
       start: '09:00',
       end: '10:00',
       employeeId: 'emp1',
     },
   ]

   // For extended event data
   interface MyEventData extends CalendarEventData {
     customField: string
   }
   ```

3. **Handle callback types:**
   ```tsx
   const handleEventDrop = (
     event: CalendarEventData,
     next: { employeeId: string; start: string; end: string }
   ) => {
     // Your logic here
   }
   ```

### Missing Type Definitions

**Problem:** Types not found for custom properties

**Solution:**

```tsx
// Extend the Employee interface if needed
interface ExtendedEmployee extends Employee {
  role: string
  avatar: string
}

// Use module augmentation if necessary
declare module 'schedule-calendar' {
  interface Employee {
    customField?: string
  }
}
```

## Styling Problems

### Styles Not Applied

**Problem:** Custom styles don't appear

**Solutions:**

1. **CSS specificity issues:**

   ```css
   /* Increase specificity */
   .my-calendar .schedule-calendar-event {
     background: red !important;
   }
   ```

2. **Use CSS Modules properly:**

   ```tsx
   // If the library uses CSS Modules
   <DayView
     employeeHeaderProps={{
       className: 'my-custom-header',
     }}
   />
   ```

3. **Use inline styles for guaranteed application:**
   ```tsx
   <DayView
     renderEvent={({ event }) => (
       <div
         style={{
           background: event.color,
           padding: '8px',
           borderRadius: '4px',
         }}
       >
         {event.title}
       </div>
     )}
   />
   ```

### Layout Breaks on Small Screens

**Problem:** Calendar doesn't work well on mobile

**Solutions:**

1. **Adjust minimum column width:**

   ```tsx
   <DayView
     employeeHeaderProps={{
       minColumnWidth: 100, // Smaller for mobile
     }}
   />
   ```

2. **Use responsive container:**
   ```tsx
   <div
     style={{
       height: '600px',
       width: '100%',
       minWidth: '320px', // Prevent too small
       overflow: 'auto', // Allow scrolling
     }}
   >
     <DayView />
   </div>
   ```

## Getting Additional Help

### Debug Mode

Enable console logging for debugging:

```tsx
const handleEventDrop = (event, next) => {
  console.log('Event drop:', { event, next })
  // Your logic
}

const handleEventClick = (event, employee) => {
  console.log('Event click:', { event, employee })
}

;<DayView
  onEventDrop={handleEventDrop}
  onEventClick={handleEventClick}
  // Add more event handlers for debugging
/>
```

### Browser Developer Tools

1. **Check Console:** Look for error messages
2. **Inspect Elements:** Verify DOM structure
3. **Network Tab:** Check if styles are loading
4. **React DevTools:** Inspect component props and state

### Testing Your Setup

Create a minimal test component:

```tsx
function TestCalendar() {
  const testEvents: CalendarEventData[] = [
    {
      id: 'test-1',
      title: 'Test Event',
      start: '10:00',
      end: '11:00',
      employeeId: 'test-emp',
      color: '#3b82f6',
    },
  ]

  return (
    <div style={{ height: '400px', width: '600px', border: '1px solid #ccc' }}>
      <DayView
        employeeIds={['test-emp']}
        events={testEvents}
        startHour={9}
        endHour={17}
        onEventClick={event => console.log('Test click:', event)}
      />
    </div>
  )
}
```

If this basic setup works, gradually add your custom features back to isolate the issue.

### Community Resources

- **GitHub Issues:** Check existing issues for similar problems
- **Storybook Documentation:** `npm run storybook` for interactive examples
- **API Documentation:** See [API.md](./API.md) for detailed prop descriptions
- **Examples:** Review [EXAMPLES.md](./EXAMPLES.md) for working code patterns
