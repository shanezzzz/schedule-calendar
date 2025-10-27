# Schedule Calendar

Schedule Calendar is a modern React calendar component library built with TypeScript and Tailwind CSS. It is designed for day-view scheduling scenarios where you need to coordinate employees, resources, or rooms, and it ships with rich drag-and-drop interactions and accessibility support out of the box.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Styling](#styling)
- [Component Overview](#component-overview)
- [Customization Examples](#customization-examples)
- [Event Handling](#event-handling)
- [Time Format Support](#time-format-support)
- [Utility Helpers](#utility-helpers)
- [Documentation](#documentation)
- [Local Development](#local-development)
- [TypeScript Support](#typescript-support)
- [Contributing](#contributing)
- [License](#license)

## Features
- Day-view scheduler with configurable time grid and current time indicator
- Resource aware layout for employees, rooms, or equipment
- Drag-and-drop interactions with grid snapping and collision detection
- Blocked time ranges per employee for managing availability
- Custom rendering hooks for events, headers, and time columns
- Responsive layout with keyboard, screen reader, and pointer support
- Tailwind CSS friendly styling surface without leaking globals
- Comprehensive automated tests and TypeScript definitions

## Installation

```bash
npm install schedule-calendar
```

## Quick Start

### Basic Day View

```tsx
import React, { useState } from 'react'
import { DayView, CalendarEventData } from 'schedule-calendar'

function MyScheduler() {
  const [events, setEvents] = useState<CalendarEventData[]>([
    {
      id: '1',
      title: 'Team Meeting',
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
  ])

  return (
    <div style={{ height: '600px', width: '1000px' }}>
      <DayView
        startHour={8}
        endHour={18}
        stepMinutes={30}
        use24HourFormat
        employeeIds={['john', 'jane', 'mike']}
        events={events}
        onEventDrop={(event, next) => {
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
        }}
      />
    </div>
  )
}
```

### Custom Employee Headers

```tsx
<DayView
  employeeIds={['emp1', 'emp2', 'emp3']}
  events={events}
  renderEmployee={(employee, index) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        background: index % 2 === 0 ? '#f8fafc' : '#f1f5f9',
      }}
    >
      <div style={{ fontWeight: 'bold' }}>{employee.name}</div>
      <div style={{ fontSize: '12px', color: '#666' }}>
        Employee #{index + 1}
      </div>
    </div>
  )}
/>
```

### Blocked Time Ranges

```tsx
const blockTimes = {
  john: [
    {
      id: 'lunch1',
      employeeId: 'john',
      start: '12:00',
      end: '13:00',
      title: 'Lunch Break',
      color: '#fef3c7',
      type: 'unavailable' as const,
    },
  ],
  jane: [
    {
      id: 'meeting1',
      employeeId: 'jane',
      start: '15:00',
      end: '17:00',
      title: 'External Meeting',
      color: '#fee2e2',
      type: 'blocked' as const,
    },
  ],
}

<DayView events={events} blockTimes={blockTimes} employeeIds={['john', 'jane']} />
```

## Styling

Component styles are encapsulated via CSS Modules, so importing `schedule-calendar` does not modify the host application. Opt into the pre-built theme for rounded corners, subtle gradients, and minimal scrollbars:

```ts
import 'schedule-calendar/styles'
```

You can also wrap `DayView` with your own classes or compose Tailwind utilities for a bespoke look.

## Component Overview

### DayView

`DayView` renders the entire scheduling surface. Notable props include:

```ts
interface DayViewProps {
  startHour?: number
  endHour?: number
  stepMinutes?: number
  cellHeight?: number
  use24HourFormat?: boolean
  employeeIds?: string[]
  employees?: Employee[]
  events?: CalendarEventData[]
  blockTimes?: EmployeeBlockTimes
  showCurrentTimeLine?: boolean
  currentDate?: Date
  eventWidth?: number | string
  onDateChange?: (date: Date) => void
  onEventDrop?: (event: CalendarEventData, next: CalendarEventDragMeta) => void
  renderEvent?: (context: CalendarEventRenderContext) => React.ReactNode
  renderEmployee?: (employee: Employee, index: number) => React.ReactNode
  timeColumnHeaderContent?: React.ReactNode
  timeColumnSlotContentRenderer?: (time: string) => React.ReactNode
}
```

### Column Width per Employee

```tsx
const employees = [
  { id: 'carry', name: 'Carry Johnson', columnWidth: 180 },
  { id: 'lucy', name: 'Lucy Tran', columnWidth: 280 },
  { id: 'john', name: 'John Ikeda', columnWidth: '18rem' },
]

<DayView
  employees={employees}
  employeeHeaderProps={{ minColumnWidth: 160 }}
  events={events}
  blockTimes={blockTimes}
  onEventDrop={handleDrop}
/>
```

`columnWidth` accepts either a number (interpreted as pixels) or a string (any valid CSS length such as `rem`). When set, it controls the width of both the employee header and the corresponding time column so that the grid stays aligned. The `employeeHeaderProps.minColumnWidth` value still acts as the global fallback for employees without an explicit width.

### Custom Time Column Header

```tsx
<DayView
  timeColumnHeaderContent={
    <div style={{ textAlign: 'center', fontWeight: 600 }}>Local Time</div>
  }
  timeColumnSlotContentRenderer={time =>
    time.endsWith(':30') ? (
      <span style={{ fontSize: '10px', color: '#94a3b8' }}>Half hour</span>
    ) : null
  }
  {...otherProps}
/>
```

`timeColumnHeaderContent` renders at the top of the time column (aligned with employee headers) and is a convenient place for labels or legends. `timeColumnSlotContentRenderer` allows you to append custom content to each time slot, for example half-hour markers or icons.

### CalendarEventData shape

```ts
interface CalendarEventData {
  id: string
  title?: string
  start: string
  end: string
  employeeId: string
  color?: string
  description?: string
}
```

## Customization Examples

### Custom Event Rendering

```tsx
<DayView
  events={events}
  renderEvent={({ event, isDragging }) => (
    <div
      style={{
        padding: '12px',
        background: `linear-gradient(135deg, ${event.color} 0%, ${event.color}dd 100%)`,
        color: 'white',
        borderRadius: '8px',
        opacity: isDragging ? 0.8 : 1,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <div style={{ fontWeight: 'bold' }}>{event.title}</div>
      <div style={{ fontSize: '12px' }}>
        {event.start} - {event.end}
      </div>
      {event.description && (
        <div style={{ fontSize: '10px', opacity: 0.9 }}>{event.description}</div>
      )}
    </div>
  )}
/>
```

### Advanced Employee Headers

```tsx
<DayView
  renderEmployee={(employee, index) => {
    const isAvailable = Math.random() > 0.3
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '16px',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '8px',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isAvailable ? '#10b981' : '#ef4444',
          }}
        />
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            marginBottom: '8px',
          }}
        >
          {employee.name.charAt(0).toUpperCase()}
        </div>
        <div style={{ fontWeight: 'bold' }}>{employee.name}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>
          {isAvailable ? 'Available' : 'Busy'}
        </div>
      </div>
    )
  }}
/>
```

### Event Width Adjustments

```tsx
<DayView
  eventWidth={85}
  {...otherProps}
/>

<DayView
  eventWidth="calc(90% - 12px)"
  {...otherProps}
/>

<DayView
  eventWidth={95}
  {...otherProps}
/>
```

The `eventWidth` prop accepts either a number (interpreted as a percentage of the column width) or any CSS length string. Adjusting the width is useful when you want to leave room for context menus, create a margin for touch targets, or fit more detail on compact screens.

## Event Handling

```tsx
<DayView
  onEventClick={(event, employee) => {
    console.log(`Clicked: ${event.title} (${employee.name})`)
  }}
  onEventDrop={(event, next) => {
    console.log(`Moved: ${event.title} to ${next.employeeId} at ${next.start}`)
    // Update your state here
  }}
  onTimeLabelClick={(timeLabel, index, timeSlot, employee) => {
    console.log(`Clicked time slot: ${timeSlot} for ${employee.name}`)
    // Create new event or show a context menu
  }}
/>
```

## Time Format Support

```tsx
const events = [
  { start: '09:00', end: '10:00', employeeId: 'a' },
  { start: '2:30 PM', end: '3:30 PM', employeeId: 'b' },
]

<DayView use24HourFormat={false} events={events} />
<DayView use24HourFormat events={events} />
```

The scheduler understands both 12-hour and 24-hour inputs. Toggle the `use24HourFormat` flag to control how times are rendered.

## Utility Helpers

```ts
import {
  parseTimeSlot,
  slotToMinutes,
  addMinutesToSlot,
  differenceInMinutes,
  formatTime,
  generateTimeSlots,
} from 'schedule-calendar'

const parsed = parseTimeSlot('2:30 PM')
const minutes = slotToMinutes('14:30')
const later = addMinutesToSlot('14:30', 45)
const duration = differenceInMinutes('14:30', '16:00')
const slots = generateTimeSlots(9, 17, 30, true)
```

## Documentation

- [API Documentation](./API.md)
- [Examples](./EXAMPLES.md)
- [Usage Guide](./USAGE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Migration Notes](./MIGRATION.md)

## Local Development

```bash
npm install
npm run dev
npm run build
npm run test
npm run test:coverage
npm run lint
npm run format
npm run type-check
npm run storybook
```

### Linking the Library

```bash
# In this repository
npm run build
npm link

# In a consuming project
npm link schedule-calendar
```

## TypeScript Support

All components ship with first-class TypeScript definitions:

```ts
import type {
  DayViewProps,
  CalendarEventData,
  Employee,
  BlockTime,
  EmployeeBlockTimes,
  CalendarEventDragMeta,
  CalendarEventRenderContext,
} from 'schedule-calendar'
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m "Add amazing feature"`)
4. Push the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
