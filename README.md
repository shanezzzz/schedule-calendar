# Schedule Calendar

A modern React calendar component library built with TypeScript and Tailwind CSS, specifically designed for day-view scheduling with employee/resource management, drag-and-drop events, and time slot blocking.

## ✨ Features

- 📅 **Day View Calendar** - Comprehensive day-view scheduler with time slots
- 👥 **Employee/Resource Management** - Support for multiple employees or resources
- 🎯 **Drag & Drop Events** - Full drag-and-drop support with grid snapping
- 🚫 **Block Times** - Define unavailable time periods for employees
- ⏰ **Flexible Time Formats** - Support for both 12-hour (AM/PM) and 24-hour formats
- 🎨 **Customizable UI** - Custom event and employee header rendering
- 📱 **Responsive Design** - Mobile-friendly and adaptive layout
- ♿ **Accessibility** - Complete ARIA support and keyboard navigation
- 🎯 **TypeScript** - Full TypeScript support with comprehensive type definitions
- 🧪 **Well Tested** - Comprehensive test coverage
- 📚 **Interactive Documentation** - Storybook-based documentation with live examples

## 🚀 Installation

```bash
npm install schedule-calendar
```

## 📖 Quick Start

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
        use24HourFormat={true}
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

### With Custom Employee Headers

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

### With Block Times (Unavailable Periods)

```tsx
const blockTimes = {
  'john': [
    {
      id: 'lunch1',
      employeeId: 'john',
      start: '12:00',
      end: '13:00',
      title: 'Lunch Break',
      color: '#fef3c7',
      type: 'unavailable' as const
    }
  ],
  'jane': [
    {
      id: 'meeting1',
      employeeId: 'jane',
      start: '15:00',
      end: '17:00',
      title: 'External Meeting',
      color: '#fee2e2',
      type: 'blocked' as const
    }
  ]
}

<DayView
  events={events}
  blockTimes={blockTimes}
  employeeIds={['john', 'jane']}
/>
```

## 🎨 Styling

Component styles are encapsulated via CSS Modules so importing `schedule-calendar` does not modify host application globals. If you want the pre-built theme (rounded corners, subtle gradients, minimal scrollbars), opt in explicitly:

```ts
import 'schedule-calendar/styles'
```

You can always wrap `DayView` with your own classes for a fully bespoke look.

## 🚢 Release & Automation

1. Run `npm version <patch|minor|major>` to bump the semver and create a git tag (e.g. `v0.1.0`).
2. Push the commit and tag: `git push origin HEAD --tags`.
3. The **Publish to npm** workflow builds, verifies, and publishes the package automatically. Add an `NPM_TOKEN` secret with publish rights before triggering the workflow.
4. For a manual publish, execute `npm run release:dry-run` locally, then `npm run release` once the artifacts look correct.

## 📚 Documentation

- **[API Documentation](./API.md)** - Detailed API reference for all components and props
- **[Examples](./EXAMPLES.md)** - Comprehensive examples for various use cases
- **[USAGE.md](./USAGE.md)** - Additional usage patterns and local development setup

## 🧩 Main Components

### DayView

The primary component for rendering a complete day-view scheduler.

```typescript
interface DayViewProps {
  startHour?: number // Start hour (0-23), default: 7
  endHour?: number // End hour (0-23), default: 23
  stepMinutes?: number // Time step for events, default: 30
  cellHeight?: number // Height of time cells, default: 40
  use24HourFormat?: boolean // Time format, default: false (12-hour)
  employeeIds?: string[] // Employee/resource IDs
  events?: CalendarEventData[] // Events to display
  blockTimes?: EmployeeBlockTimes // Blocked time periods
  showCurrentTimeLine?: boolean // Show current time indicator
  currentDate?: Date // Selected date
  onDateChange?: (date: Date) => void // Date change handler
  onEventDrop?: (event, next) => void // Event drop handler
  // ... and many more customization options
}
```

### Different Column Widths Per Employee

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
/>;
```

`columnWidth` 支持 number（像素）或字符串（任意 CSS 长度，如 `rem`），传入后既会控制 `EmployeeHeader` 列宽，也会让 `CalendarGrid` 中对应员工的时间列保持一致。`employeeHeaderProps.minColumnWidth` 仍然作为全局兜底宽度。

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

`timeColumnHeaderContent` 会直接渲染在时间列顶端（与员工头部对齐的区域），用于展示标题、图例或其他说明信息。
`timeColumnSlotContentRenderer` 支持针对每个时间刻度追加自定义内容（如半点提示、图例标识等）。

### CalendarEventData

The event data structure:

```typescript
interface CalendarEventData {
  id: string // Unique identifier
  title?: string // Event title
  start: string // Start time ("09:00" or "9:00 AM")
  end: string // End time ("10:00" or "10:00 AM")
  employeeId: string // Assigned employee/resource
  color?: string // Background color
  description?: string // Optional description
}
```

## 🎨 Customization

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
        <div style={{ fontSize: '10px', opacity: 0.9 }}>
          {event.description}
        </div>
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
        {/* Status indicator */}
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

        {/* Employee avatar */}
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

## ⚡ Event Handling

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
    // Create new event or show context menu
  }}
/>
```

## 🕒 Time Format Support

The library supports multiple time formats automatically:

```tsx
const events = [
  { start: '09:00', end: '10:00' },     // 24-hour format
  { start: '2:30 PM', end: '3:30 PM' }, // 12-hour format
  // Both formats work seamlessly together
]

// Display in 12-hour format
<DayView use24HourFormat={false} events={events} />

// Display in 24-hour format
<DayView use24HourFormat={true} events={events} />
```

## 🔧 Utility Functions

```tsx
import {
  parseTimeSlot,
  slotToMinutes,
  addMinutesToSlot,
  differenceInMinutes,
  formatTime,
  generateTimeSlots,
} from 'schedule-calendar'

// Parse time string
const parsed = parseTimeSlot('2:30 PM') // { hours: 14, minutes: 30 }

// Convert to minutes from midnight
const minutes = slotToMinutes('14:30') // 870

// Add time
const later = addMinutesToSlot('14:30', 45) // "15:15"

// Calculate duration
const duration = differenceInMinutes('14:30', '16:00') // 90 minutes

// Generate time slots
const slots = generateTimeSlots(9, 17, 30, true)
// ["09:00", "09:30", "10:00", ..., "17:00"]
```

## 🏗️ Local Development

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

### Build Library

```bash
npm run build
```

### Run Tests

```bash
npm run test
npm run test:coverage
```

### Interactive Documentation

```bash
npm run storybook
```

### Code Quality

```bash
npm run lint
npm run format
npm run type-check
```

### Local Development with npm link

#### In this project:

```bash
npm run build
npm link
```

#### In your target project:

```bash
npm link schedule-calendar
```

## 📝 TypeScript

The library is built with TypeScript and provides comprehensive type definitions:

```typescript
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

## 🎯 Use Cases

- **Medical Appointment Scheduling** - Doctor/patient appointment management
- **Service Booking Systems** - Technician/service scheduling
- **Meeting Room Management** - Conference room booking
- **Staff Scheduling** - Employee work schedule management
- **Resource Planning** - Equipment or facility scheduling
- **Educational Scheduling** - Class and instructor scheduling

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [API Documentation](./API.md)
- [Examples](./EXAMPLES.md)
- [Usage Guide](./USAGE.md)

## License

MIT
