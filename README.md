# Schedule Calendar

Schedule Calendar is a modern React calendar component library built with TypeScript and Tailwind CSS. It supports day, week, and month scheduling for coordinating employees, resources, or rooms, and it ships with rich drag-and-drop interactions and accessibility support out of the box.

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
- [View Components](#view-components)
- [Documentation](#documentation)
- [Local Development](#local-development)
- [TypeScript Support](#typescript-support)
- [Contributing](#contributing)
- [License](#license)

## Features

- Day, week, and month scheduling views
- Unified `ScheduleCalendar` with built-in view switching (Day/Week/Month)
- Configurable time grid with current time indicator
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

### ScheduleCalendar (Day / Week / Month)

```tsx
import React, { useState } from 'react'
import { ScheduleCalendar, CalendarEventData } from 'schedule-calendar'

function MyScheduler() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const events: CalendarEventData[] = [
    {
      id: '1',
      title: 'Team Meeting',
      start: '2026-01-28 09:00',
      end: '2026-01-28 10:00',
      employeeId: 'team',
      color: '#3b82f6',
    },
  ]

  return (
    <div style={{ height: '600px', width: '1000px' }}>
      <ScheduleCalendar
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        events={events}
        showViewSwitcher
        dayViewProps={{ employees: [{ id: 'team', name: 'Team' }] }}
      />
    </div>
  )
}
```

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

Schedule Calendar ships with Day/Week/Month views and the unified `ScheduleCalendar` wrapper (see [View Components](#view-components)). `DayView` remains the most flexible surface for resource scheduling.

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
  date?: string
}
```

For week/month views, if an event only contains time values (e.g. `start: '09:00'`), provide `date: 'YYYY-MM-DD'` so the event can be placed on the correct day.

| Field | Type | Description | Example |
| --- | --- | --- | --- |
| `id` | `string` | Unique identifier for the event. | `id: 'evt-1'` |
| `title` | `string` | Event title shown in UI. | `title: 'Standup'` |
| `start` | `string` | Start time or datetime (`HH:mm` or `YYYY-MM-DD HH:mm`). | `start: '2026-01-28 09:00'` |
| `end` | `string` | End time or datetime (`HH:mm` or `YYYY-MM-DD HH:mm`). | `end: '2026-01-28 10:00'` |
| `employeeId` | `string` | Employee/resource ID the event belongs to. | `employeeId: 'team'` |
| `color` | `string` | Optional color for the event. | `color: '#3b82f6'` |
| `description` | `string` | Optional details shown in custom renderers. | `description: 'Daily sync'` |
| `date` | `string` | Required when `start/end` are time-only (format `YYYY-MM-DD`). | `date: '2026-01-28'` |

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
  parseDateTimeString,
  extractTime,
  extractDate,
  resolveEventDate,
  getWeekDates,
  getMonthGrid,
  getEventsForDate,
  getEventsForDateRange,
  groupEventsByDate,
  isSameDate,
  isToday,
  formatDateHeader,
} from 'schedule-calendar'

const parsed = parseTimeSlot('2:30 PM')
const minutes = slotToMinutes('14:30')
const later = addMinutesToSlot('14:30', 45)
const duration = differenceInMinutes('14:30', '16:00')
const slots = generateTimeSlots(9, 17, 30, true)
```

## View Components

`ScheduleCalendar` wraps Day/Week/Month views and manages view switching internally. The tables below list **all props** and how to pass each one.

### ScheduleCalendar Props (Full)

| Prop | Type | Default | Description | Example |
| --- | --- | --- | --- | --- |
| `view` | `'day' \| 'week' \| 'month'` | — | Controlled view value. | `view="week"` |
| `defaultView` | `'day' \| 'week' \| 'month'` | `'day'` | Initial view for uncontrolled usage. | `defaultView="month"` |
| `onViewChange` | `(view) => void` | — | Fired when view changes via switcher. | `onViewChange={setView}` |
| `currentDate` | `Date` | `new Date()` | Current date for header navigation and view rendering. | `currentDate={date}` |
| `onDateChange` | `(date) => void` | — | Fired when header prev/next/today/date picker changes date. | `onDateChange={setDate}` |
| `events` | `CalendarEventData[]` | `[]` | Events used across Day/Week/Month views. | `events={events}` |
| `weekStartsOn` | `0 \| 1` | `1` | Week start day (0=Sunday, 1=Monday). | `weekStartsOn={0}` |
| `timeZone` | `Intl.DateTimeFormatOptions['timeZone']` | — | IANA time zone for current time indicator. | `timeZone="America/New_York"` |
| `headerActions` | `ReactNode` | — | Custom actions rendered in header right side. | `headerActions={<MyActions />}` |
| `dateFormat` | `string` | — | Day.js format for header label. | `dateFormat="YYYY/MM/DD"` |
| `showViewSwitcher` | `boolean` | `true` | Show built-in Day/Week/Month switcher. | `showViewSwitcher` |
| `className` | `string` | — | ClassName passed to active view root. | `className="my-calendar"` |
| `style` | `CSSProperties` | — | Inline style passed to active view root. | `style={{ height: 600 }}` |
| `dayViewProps` | `Omit<DayViewProps, ...>` | — | Extra props forwarded to DayView (see DayView props). | `dayViewProps={{ employees }}` |
| `weekViewProps` | `Omit<WeekViewProps, ...>` | — | Extra props forwarded to WeekView (see WeekView props). | `weekViewProps={{ showCurrentTimeLine: false }}` |
| `monthViewProps` | `Omit<MonthViewProps, ...>` | — | Extra props forwarded to MonthView (see MonthView props). | `monthViewProps={{ maxEventsPerCell: 5 }}` |

### DayView Props (Full)

| Prop | Type | Default | Description | Example |
| --- | --- | --- | --- | --- |
| `startHour` | `number` | `7` | Start hour of the day (0-23). | `startHour={8}` |
| `endHour` | `number` | `23` | End hour of the day (0-23). | `endHour={18}` |
| `stepMinutes` | `number` | `30` | Time slot interval in minutes. | `stepMinutes={15}` |
| `cellHeight` | `number` | `40` | Pixel height per time slot row. | `cellHeight={48}` |
| `use24HourFormat` | `boolean` | `false` | Render labels in 24-hour format. | `use24HourFormat` |
| `displayIntervalMinutes` | `number` | `30` | Label display interval in minutes. | `displayIntervalMinutes={60}` |
| `employeeIds` | `string[]` | — | Employee IDs when not passing `employees`. | `employeeIds={['a','b']}` |
| `employees` | `DayViewEmployee[]` | — | Employee objects (overrides `employeeIds`). | `employees={[{ id:'a', name:'A' }]}` |
| `events` | `CalendarEventData[]` | `[]` | Events for day view. | `events={events}` |
| `blockTimes` | `EmployeeBlockTimes` | `{}` | Unavailable/blocked times per employee. | `blockTimes={{ a: [...] }}` |
| `showCurrentTimeLine` | `boolean` | `true` | Show current time line. | `showCurrentTimeLine={false}` |
| `currentTimeLineStyle` | `CSSProperties` | — | Inline style for current time line. | `currentTimeLineStyle={{ color: 'red' }}` |
| `timeZone` | `Intl.DateTimeFormatOptions['timeZone']` | — | Time zone for current time indicator. | `timeZone="Asia/Shanghai"` |
| `currentDate` | `Date` | `new Date()` | Date to render. | `currentDate={date}` |
| `dateFormat` | `string` | — | Day.js header label format. | `dateFormat="YYYY-MM-DD"` |
| `eventWidth` | `number \| string` | `'100%'` | Event width (px or CSS length/percentage). | `eventWidth={85}` |
| `onDateChange` | `(date) => void` | — | Fired on header date change. | `onDateChange={setDate}` |
| `headerActions` | `ReactNode` | — | Custom actions in header. | `headerActions={<MyActions />}` |
| `showViewSwitcher` | `boolean` | `false` | Show Day/Week/Month switcher. | `showViewSwitcher` |
| `view` | `'day' \| 'week' \| 'month'` | — | Controlled view value for switcher. | `view="day"` |
| `onViewChange` | `(view) => void` | — | Fired when view switcher changes. | `onViewChange={setView}` |
| `onEventClick` | `(event, employee) => void` | — | Event click handler. | `onEventClick={(e, emp) => {}}` |
| `onEventDrag` | `(event, dx, dy) => void` | — | Event drag handler. | `onEventDrag={() => {}}` |
| `onEventDragEnd` | `(event, newEmployeeId, newStart) => void` | — | Event drag end handler. | `onEventDragEnd={() => {}}` |
| `onEventDrop` | `(event, next) => void` | — | Event drop handler. | `onEventDrop={(e, next) => {}}` |
| `onTimeLabelClick` | `(label, index, slot, employee) => void` | — | Time label click handler. | `onTimeLabelClick={() => {}}` |
| `onBlockTimeClick` | `(blockTime, slot, employee) => void` | — | Block time click handler. | `onBlockTimeClick={() => {}}` |
| `renderEvent` | `({ event, isDragging }) => ReactNode` | — | Custom event renderer. | `renderEvent={({ event }) => <div>{event.title}</div>}` |
| `renderBlockTime` | `(context) => ReactNode` | — | Custom block time renderer. | `renderBlockTime={() => <div />}` |
| `renderEmployee` | `(employee, index) => ReactNode` | — | Custom employee header renderer. | `renderEmployee={(emp) => <div>{emp.name}</div>}` |
| `employeeHeaderProps` | `DayViewEmployeeHeaderProps` | — | Props for EmployeeHeader (min width, className, style). | `employeeHeaderProps={{ minColumnWidth: 160 }}` |
| `timeColumnHeaderContent` | `ReactNode` | — | Custom content for time column header. | `timeColumnHeaderContent={<div>Local</div>}` |
| `timeColumnSlotContentRenderer` | `(time, index) => ReactNode` | — | Custom time slot content renderer. | `timeColumnSlotContentRenderer={() => null}` |
| `className` | `string` | — | Root className. | `className="day-view"` |
| `style` | `CSSProperties` | — | Root inline style. | `style={{ height: 600 }}` |
| `eventStyle` | `CSSProperties` | — | Style applied to all events. | `eventStyle={{ borderRadius: 8 }}` |
| `eventClassName` | `string` | — | ClassName applied to all events. | `eventClassName="event"` |

### WeekView Props (Full)

| Prop | Type | Default | Description | Example |
| --- | --- | --- | --- | --- |
| `startHour` | `number` | `7` | Start hour of the day (0-23). | `startHour={8}` |
| `endHour` | `number` | `23` | End hour of the day (0-23). | `endHour={18}` |
| `stepMinutes` | `number` | `30` | Time slot interval in minutes. | `stepMinutes={15}` |
| `cellHeight` | `number` | `40` | Pixel height per time slot. | `cellHeight={48}` |
| `use24HourFormat` | `boolean` | `false` | Render labels in 24-hour format. | `use24HourFormat` |
| `displayIntervalMinutes` | `number` | `30` | Label display interval. | `displayIntervalMinutes={60}` |
| `currentDate` | `Date` | `new Date()` | Any date within the week to display. | `currentDate={date}` |
| `weekStartsOn` | `0 \| 1` | `1` | Week start day (0=Sun, 1=Mon). | `weekStartsOn={0}` |
| `events` | `CalendarEventData[]` | `[]` | Events to render in the week. | `events={events}` |
| `showCurrentTimeLine` | `boolean` | `true` | Show current time line. | `showCurrentTimeLine={false}` |
| `currentTimeLineStyle` | `CSSProperties` | — | Inline style for current time line. | `currentTimeLineStyle={{ color: 'red' }}` |
| `timeZone` | `Intl.DateTimeFormatOptions['timeZone']` | — | Time zone for current time indicator. | `timeZone="Europe/London"` |
| `dateFormat` | `string` | — | Day.js header label format. | `dateFormat="MMM D"` |
| `eventWidth` | `number \| string` | `'100%'` | Event width (px or CSS length/percentage). | `eventWidth="90%"` |
| `onDateChange` | `(date) => void` | — | Fired on header date change. | `onDateChange={setDate}` |
| `headerActions` | `ReactNode` | — | Custom actions in header. | `headerActions={<MyActions />}` |
| `showViewSwitcher` | `boolean` | `false` | Show Day/Week/Month switcher. | `showViewSwitcher` |
| `view` | `'day' \| 'week' \| 'month'` | — | Controlled view value for switcher. | `view="week"` |
| `onViewChange` | `(view) => void` | — | Fired when view switcher changes. | `onViewChange={setView}` |
| `onEventClick` | `(event, date) => void` | — | Event click handler. | `onEventClick={() => {}}` |
| `onEventDrag` | `(event, dx, dy) => void` | — | Event drag handler. | `onEventDrag={() => {}}` |
| `onEventDragEnd` | `(event, newDate, newStart) => void` | — | Event drag end handler. | `onEventDragEnd={() => {}}` |
| `onEventDrop` | `(event, next) => void` | — | Event drop handler. | `onEventDrop={() => {}}` |
| `onCellClick` | `(timeSlot, date) => void` | — | Cell click handler. | `onCellClick={() => {}}` |
| `renderEvent` | `({ event, isDragging, date }) => ReactNode` | — | Custom event renderer. | `renderEvent={({ event }) => <div>{event.title}</div>}` |
| `renderDayHeader` | `(date, dayOfWeek) => ReactNode` | — | Custom day header renderer. | `renderDayHeader={(date) => <div>{date}</div>}` |
| `timeColumnHeaderContent` | `ReactNode` | — | Custom time column header. | `timeColumnHeaderContent={<div>Local</div>}` |
| `timeColumnSlotContentRenderer` | `(time, index) => ReactNode` | — | Custom time slot content. | `timeColumnSlotContentRenderer={() => null}` |
| `className` | `string` | — | Root className. | `className="week-view"` |
| `style` | `CSSProperties` | — | Root inline style. | `style={{ height: 600 }}` |
| `eventStyle` | `CSSProperties` | — | Style applied to events. | `eventStyle={{ borderRadius: 8 }}` |
| `eventClassName` | `string` | — | ClassName applied to events. | `eventClassName="event"` |

### MonthView Props (Full)

| Prop | Type | Default | Description | Example |
| --- | --- | --- | --- | --- |
| `currentDate` | `Date` | `new Date()` | Month to display. | `currentDate={date}` |
| `weekStartsOn` | `0 \| 1` | `1` | Week start day (0=Sun, 1=Mon). | `weekStartsOn={0}` |
| `timeZone` | `Intl.DateTimeFormatOptions['timeZone']` | — | Time zone for current time indicator. | `timeZone="Asia/Shanghai"` |
| `events` | `CalendarEventData[]` | `[]` | Events to render in the month. | `events={events}` |
| `maxEventsPerCell` | `number` | `3` | Max events per day cell before “+N more”. | `maxEventsPerCell={5}` |
| `dateFormat` | `string` | — | Day.js header label format. | `dateFormat="MMMM YYYY"` |
| `onDateChange` | `(date) => void` | — | Fired on header date change. | `onDateChange={setDate}` |
| `headerActions` | `ReactNode` | — | Custom actions in header. | `headerActions={<MyActions />}` |
| `showViewSwitcher` | `boolean` | `false` | Show Day/Week/Month switcher. | `showViewSwitcher` |
| `view` | `'day' \| 'week' \| 'month'` | — | Controlled view value for switcher. | `view="month"` |
| `onViewChange` | `(view) => void` | — | Fired when view switcher changes. | `onViewChange={setView}` |
| `onEventClick` | `(event, date) => void` | — | Event click handler. | `onEventClick={() => {}}` |
| `onDateClick` | `(date) => void` | — | Day cell click handler. | `onDateClick={(date) => {}}` |
| `onMoreClick` | `(date, events) => void` | — | “+N more” click handler. | `onMoreClick={() => {}}` |
| `renderEvent` | `({ event, date }) => ReactNode` | — | Custom event renderer. | `renderEvent={({ event }) => <div>{event.title}</div>}` |
| `renderCell` | `({ date, events, isCurrentMonth, isToday }) => ReactNode` | — | Custom cell renderer (overrides cell). | `renderCell={({ date }) => <div>{date}</div>}` |
| `renderDayOfWeekHeader` | `(dayOfWeek, label) => ReactNode` | — | Custom day header renderer. | `renderDayOfWeekHeader={(d, l) => <div>{l}</div>}` |
| `className` | `string` | — | Root className. | `className="month-view"` |
| `style` | `CSSProperties` | — | Root inline style. | `style={{ height: 600 }}` |
| `cellClassName` | `string` | — | ClassName for day cells. | `cellClassName="cell"` |
| `cellStyle` | `CSSProperties` | — | Inline style for day cells. | `cellStyle={{ minHeight: 120 }}` |
| `eventClassName` | `string` | — | ClassName for event items in cells. | `eventClassName="event"` |
| `eventStyle` | `CSSProperties` | — | Style for event items in cells. | `eventStyle={{ borderRadius: 6 }}` |

### CalendarHeader Props (Full)

| Prop | Type | Default | Description | Example |
| --- | --- | --- | --- | --- |
| `currentDate` | `Date` | `new Date()` | Current date used for label and picker. | `currentDate={date}` |
| `onDateChange` | `(date) => void` | — | Fired when date changes via header navigation/picker. | `onDateChange={setDate}` |
| `className` | `string` | — | Root className. | `className="header"` |
| `actionsSection` | `ReactNode` | — | Custom actions area on right. | `actionsSection={<MyActions />}` |
| `formatDateLabel` | `(date) => string` | — | Custom label formatter (overrides `dateFormat`). | `formatDateLabel={(d) => ...}` |
| `dateFormat` | `string` | — | Day.js format string for label. | `dateFormat="YYYY-MM-DD"` |
| `navigationUnit` | `'day' \| 'week' \| 'month'` | `'day'` | Prev/next step unit and picker mode. | `navigationUnit="week"` |
| `weekStartsOn` | `0 \| 1` | `1` | Week start day for week picker. | `weekStartsOn={0}` |
| `showViewSwitcher` | `boolean` | `false` | Show built-in Day/Week/Month switcher. | `showViewSwitcher` |
| `view` | `'day' \| 'week' \| 'month'` | — | Controlled view value for switcher. | `view="month"` |
| `onViewChange` | `(view) => void` | — | Fired when view switcher changes. | `onViewChange={setView}` |
| `onMonthChange` | `(visibleMonth) => void` | — | Fired when month picker navigates. | `onMonthChange={(d) => ...}` |
| `onToggleDatePicker` | `(isOpen) => void` | — | Fired when date picker opens/closes. | `onToggleDatePicker={(open) => ...}` |

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
  ScheduleCalendarProps,
  DayViewProps,
  WeekViewProps,
  MonthViewProps,
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
