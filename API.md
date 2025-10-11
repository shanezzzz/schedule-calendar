# API Documentation

Comprehensive reference for every public export in the `schedule-calendar` component library. All components are written in React + TypeScript and ship sensible defaults together with escape hatches for advanced scenarios.

## Table of Contents

- [Package Exports](#package-exports)
- [Components](#components)
  - [DayView](#dayview)
  - [CalendarGrid](#calendargrid)
  - [CalendarEvent](#calendarevent)
  - [CalendarCell](#calendarcell)
  - [TimeColumn](#timecolumn)
  - [EmployeeHeader](#employeeheader)
  - [CalendarHeader](#calendarheader)
  - [CurrentTimeLine](#currenttimeline)
- [Shared Types](#shared-types)
- [Utilities](#utilities)

---

## Package Exports

All public APIs are re-exported from `src/index.ts`.

| Export                                                                                                                                             | Kind      | Notes                                                                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------ |
| `DayView`                                                                                                                                          | Component | Complete day scheduler view.                                                                           |
| `DayViewProps`                                                                                                                                     | Type      | Props contract for `DayView`.                                                                          |
| `DayViewEmployee`, `DayViewEvent*` handlers, `DayViewEmployeeHeaderProps`                                                                          | Types     | Helper aliases for callbacks, employee metadata (with optional `columnWidth`), and derived structures. |
| `CalendarGrid`                                                                                                                                     | Component | Core time grid that powers `DayView`.                                                                  |
| `CalendarGridProps`, `CalendarGridDropResult`, `CalendarGridEmployee`                                                                              | Types     | Grid configuration, drag result payload, and employee descriptor (with optional `columnWidth`).        |
| `CalendarEvent`                                                                                                                                    | Component | Individual calendar event with optional drag-and-drop.                                                 |
| `CalendarEventProps`, `CalendarEventData`, `CalendarEventDragMeta`, `CalendarEventRenderContext`, `CalendarEventChildren`, `CalendarEventSnapGrid` | Types     | Event payloads and render contracts.                                                                   |
| `CalendarBlockTime`                                                                                                                                | Component | Visual block overlay rendered inside the grid.                                                         |
| `CalendarBlockTimeProps`, `CalendarBlockTimeRenderContext`                                                                                         | Types     | Block overlay configuration and custom render context.                                                 |
| `CalendarCell`                                                                                                                                     | Component | Low-level time-slot cell.                                                                              |
| `CalendarCellProps`, `CalendarCellEmployee`                                                                                                        | Types     | Cell props and lightweight employee descriptor.                                                        |
| `TimeColumn`                                                                                                                                       | Component | Timeline labels column.                                                                                |
| `TimeColumnProps`                                                                                                                                  | Type      | Time column configuration.                                                                             |
| `EmployeeHeader`                                                                                                                                   | Component | Header row for employees/resources.                                                                    |
| `EmployeeHeaderProps`, `Employee`, `EmployeeRenderer`                                                                                              | Types     | Employee data model (supports `columnWidth`), renderer contract.                                       |
| `CalendarHeader`                                                                                                                                   | Component | Navigation header with inline date picker.                                                             |
| `CalendarHeaderProps`                                                                                                                              | Type      | Header configuration and callbacks.                                                                    |
| `CurrentTimeLine`                                                                                                                                  | Component | Real-time indicator ribbon.                                                                            |
| `CurrentTimeLineProps`, `CurrentTimeLinePosition`                                                                                                  | Types     | Timeline configuration and computed position.                                                          |
| `CalendarEventData`                                                                                                                                | Type      | Event payload shared by multiple components.                                                           |
| `BlockTime`, `EmployeeBlockTimes`                                                                                                                  | Types     | Blocked time slots per employee.                                                                       |
| `isTimeBlocked`, `isTimeRangeBlocked`, `getEmployeeBlockTimes`                                                                                     | Utility   | Helpers for interacting with block-time data.                                                          |

---

## Components

### DayView

High-level composite that renders the navigation header, time column, employee header, grid, and optional current time indicator.

```ts
interface DayViewProps {
  startHour?: number
  endHour?: number
  stepMinutes?: number
  cellHeight?: number
  use24HourFormat?: boolean
  displayIntervalMinutes?: number
  employeeIds?: string[]
  employees?: DayViewEmployee[]
  events?: CalendarEventData[]
  blockTimes?: EmployeeBlockTimes
  showCurrentTimeLine?: boolean
  currentDate?: Date
  onDateChange?: (date: Date) => void
  headerActions?: React.ReactNode
  onEventClick?: DayViewEventClickHandler
  onEventDrag?: DayViewEventDragHandler
  onEventDragEnd?: DayViewEventDragEndHandler
  onEventDrop?: DayViewEventDropHandler
  onTimeLabelClick?: DayViewTimeLabelClickHandler
  renderEvent?: DayViewEventRenderer
  renderBlockTime?: DayViewBlockTimeRenderer
  renderEmployee?: EmployeeRenderer
  employeeHeaderProps?: DayViewEmployeeHeaderProps
  timeColumnHeaderContent?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}
```

| Prop                            | Type                                               | Default                               | Description                                                                            |
| ------------------------------- | -------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------------------- |
| `startHour`                     | `number`                                           | `7`                                   | Lower bound (inclusive) for the timetable (0–23).                                      |
| `endHour`                       | `number`                                           | `23`                                  | Upper bound (exclusive) for the timetable (0–23).                                      |
| `stepMinutes`                   | `number`                                           | `30`                                  | Base time increment in minutes used for layout calculations and drag snapping.         |
| `cellHeight`                    | `number`                                           | `40`                                  | Height in pixels for a single `stepMinutes` block.                                     |
| `use24HourFormat`               | `boolean`                                          | `false`                               | Enables 24-hour rendering when `true`; otherwise uses 12-hour clock.                   |
| `displayIntervalMinutes`        | `number`                                           | `30`                                  | Interval at which time labels are shown in the left column.                            |
| `employeeIds`                   | `string[]`                                         | `['1', '2', '3', '4', '5', '6', '7']` | Legacy identifier list. Ignored when `employees` is provided.                          |
| `employees`                     | `DayViewEmployee[]`                                | Derived from `employeeIds`            | Detailed employee/resource descriptors. Used for headers, events, and callbacks.       |
| `events`                        | `CalendarEventData[]`                              | `[]`                                  | Scheduled events to render.                                                            |
| `blockTimes`                    | `EmployeeBlockTimes`                               | `{}`                                  | Map of blocked intervals per employee.                                                 |
| `showCurrentTimeLine`           | `boolean`                                          | `true`                                | Toggles the live “current time” ribbon.                                                |
| `currentDate`                   | `Date`                                             | `new Date()`                          | Currently selected calendar date.                                                      |
| `onDateChange`                  | `(date: Date) => void`                             | –                                     | Fired when the user navigates to a different date.                                     |
| `headerActions`                 | `React.ReactNode`                                  | –                                     | Custom content rendered in the header actions slot.                                    |
| `onEventClick`                  | `DayViewEventClickHandler`                         | –                                     | Click handler that receives the event and resolved employee record.                    |
| `onEventDrag`                   | `DayViewEventDragHandler`                          | –                                     | Called continuously during drag gestures with delta offsets.                           |
| `onEventDragEnd`                | `DayViewEventDragEndHandler`                       | –                                     | Fired after dragging ends; useful for optimistic UI updates.                           |
| `onEventDrop`                   | `DayViewEventDropHandler`                          | –                                     | Invoked once an event is dropped on a new cell with normalized payload.                |
| `onTimeLabelClick`              | `DayViewTimeLabelClickHandler`                     | –                                     | Called when the user taps a time label within a cell.                                  |
| `renderEvent`                   | `DayViewEventRenderer`                             | –                                     | Custom renderer for events; receives `{ event, isDragging }`.                          |
| `renderBlockTime`               | `DayViewBlockTimeRenderer`                         | –                                     | Custom renderer for block overlays; receives `{ blockTime, employee }`.                |
| `renderEmployee`                | `EmployeeRenderer`                                 | –                                     | Replaces the default employee header renderer.                                         |
| `employeeHeaderProps`           | `DayViewEmployeeHeaderProps`                       | –                                     | Props forwarded to `EmployeeHeader` (`className`, `style`, `minColumnWidth`).          |
| `timeColumnHeaderContent`       | `React.ReactNode`                                  | `undefined`                           | Custom content rendered at the top of the time column (aligned with employee headers). |
| `timeColumnSlotContentRenderer` | `(time: string, index: number) => React.ReactNode` | `undefined`                           | Renderer invoked for each time slot to append additional context.                      |
| `className`                     | `string`                                           | –                                     | Optional wrapper class.                                                                |
| `style`                         | `React.CSSProperties`                              | –                                     | Inline styles for the root wrapper.                                                    |

#### Usage Example

```tsx
import { useState } from 'react';
import {
  DayView,
  type CalendarEventData,
  type DayViewEventDropHandler
} from 'schedule-calendar';

const initialEvents: CalendarEventData[] = [
  { id: 'evt-1', title: 'Product Sync', start: '09:00', end: '10:00', employeeId: 'alice', color: '#2563eb' },
  { id: 'evt-2', title: 'Client Call', start: '11:30', end: '12:30', employeeId: 'bob', color: '#16a34a' }
];

export function Scheduler() {
  const [events, setEvents] = useState(initialEvents);

  const handleDrop: DayViewEventDropHandler = (event, next) => {
    setEvents(prev =>
      prev.map(item =>
        item.id === event.id
          ? { ...item, employeeId: next.employeeId, start: next.start, end: next.end }
          : item
      )
    );
  };

  return (
    <DayView
      employees={[
        { id: 'alice', name: 'Alice Chen' },
        { id: 'bob', name: 'Bob Patel' }
      ]}
      events={events}
      onEventDrop={handleDrop}
      headerActions={<button className=\"primaryButton\">New Event</button>}
    />
  );
}
```

---

### CalendarGrid

Lower-level grid responsible for laying out events, handling drag/drop, and rendering block times.

```ts
interface CalendarGridProps {
  events?: CalendarEventData[]
  timeSlots?: string[]
  employeeIds?: string[]
  cellHeight?: number
  stepMinutes?: number
  use24HourFormat?: boolean
  blockTimes?: EmployeeBlockTimes
  employees?: CalendarGridEmployee[]
  defaultColumnWidth?: number
  onEventClick?: (
    event: CalendarEventData,
    employee: CalendarCellEmployee
  ) => void
  onEventDrag?: (
    event: CalendarEventData,
    deltaX: number,
    deltaY: number
  ) => void
  onEventDragEnd?: (
    event: CalendarEventData,
    newEmployeeId: string,
    newStart: string
  ) => void
  onEventDrop?: (event: CalendarEventData, next: CalendarGridDropResult) => void
  onTimeLabelClick?: (
    timeLabel: string,
    index: number,
    timeSlot: string,
    employee: CalendarCellEmployee
  ) => void
  onBlockTimeClick?: (
    blockTime: BlockTime,
    timeSlot: string,
    employee: CalendarCellEmployee
  ) => void
  renderEvent?: (context: CalendarEventRenderContext) => React.ReactNode
  renderBlockTime?: (
    context: CalendarBlockTimeRenderContext
  ) => React.ReactNode
}
```

| Prop               | Type                                       | Default | Description                                                                 |
| ------------------ | ------------------------------------------ | ------- | --------------------------------------------------------------------------- |
| `events`           | `CalendarEventData[]`                      | `[]`    | Events to render.                                                           |
| `timeSlots`        | `string[]`                                 | `[]`    | Ordered list of time slot labels (e.g. `['07:00', '07:30']`).               |
| `employeeIds`      | `string[]`                                 | `[]`    | Column identifiers. When omitted, `employees` drives both header and grid.  |
| `cellHeight`       | `number`                                   | `80`    | Height per `timeSlots` row (px).                                            |
| `stepMinutes`      | `number`                                   | `30`    | Base duration in minutes for layout calculations.                           |
| `use24HourFormat`  | `boolean`                                  | `false` | 24-hour label formatting.                                                   |
| `blockTimes`       | `EmployeeBlockTimes`                       | `{}`    | Map of blocked intervals per employee.                                      |
| `employees`        | `CalendarGridEmployee[]`                   | `[]`    | Optional employee descriptors used for callbacks and cell metadata.         |
| `defaultColumnWidth` | `number`                                 | `210`   | Fallback width (px) applied when an employee does not specify `columnWidth`. |
| `onEventClick`     | `(event, employee) => void`                | –       | Fired when an event is clicked.                                             |
| `onEventDrag`      | `(event, deltaX, deltaY) => void`          | –       | Continuous drag updates.                                                    |
| `onEventDragEnd`   | `(event, newEmployeeId, newStart) => void` | –       | Called after dragging stops; provides the snapped slot.                     |
| `onEventDrop`      | `(event, next) => void`                    | –       | Invoked once an event is dropped on a valid target with normalized payload. |
| `onTimeLabelClick` | `(label, index, slot, employee) => void`   | –       | Fired when an empty slot label is clicked.                                  |
| `onBlockTimeClick` | `(blockTime, slot, employee) => void`      | –       | Triggered when a block overlay is clicked.                                  |
| `renderEvent`      | `(context) => ReactNode`                   | –       | Custom renderer for events.                                                 |
| `renderBlockTime`  | `(context) => ReactNode`                   | –       | Custom renderer for block time overlays.                                    |

---

### CalendarEvent

Individual event block supporting optional drag-and-drop and custom rendering.

```ts
interface CalendarEventProps {
  event: CalendarEventData
  style?: React.CSSProperties
  className?: string
  draggable?: boolean
  isActive?: boolean
  use24HourFormat?: boolean
  employee?: { id: string; name: string }
  children?: CalendarEventChildren
  onClick?: (
    event: CalendarEventData,
    employee: { id: string; name: string }
  ) => void
  onDragStart?: (event: CalendarEventData, meta: CalendarEventDragMeta) => void
  onDrag?: (event: CalendarEventData, meta: CalendarEventDragMeta) => void
  onDragEnd?: (event: CalendarEventData, meta: CalendarEventDragMeta) => void
  snapToGrid?: CalendarEventSnapGrid
}
```

| Prop              | Type                                         | Default                                            | Description                                                 |
| ----------------- | -------------------------------------------- | -------------------------------------------------- | ----------------------------------------------------------- |
| `event`           | `CalendarEventData`                          | **required**                                       | Data driving the block.                                     |
| `style`           | `React.CSSProperties`                        | –                                                  | Inline overrides for positioning/appearance.                |
| `className`       | `string`                                     | –                                                  | Additional class names.                                     |
| `draggable`       | `boolean`                                    | `false`                                            | Enables pointer-based drag gestures.                        |
| `isActive`        | `boolean`                                    | `false`                                            | Forces active styling.                                      |
| `use24HourFormat` | `boolean`                                    | `false`                                            | Controls fallback time formatting for the default renderer. |
| `employee`        | `{ id: string; name: string }`               | `{ id: event.employeeId, name: event.employeeId }` | Employee context passed to callbacks.                       |
| `children`        | `CalendarEventChildren`                      | Default renderer                                   | Optional render function or React node to override content. |
| `onClick`         | `(event, employee) => void`                  | –                                                  | Fired when no drag occurred and the block was clicked.      |
| `onDragStart`     | `(event, meta) => void`                      | –                                                  | Triggered when a drag begins.                               |
| `onDrag`          | `(event, meta) => void`                      | –                                                  | Continuous drag updates with current pointer delta.         |
| `onDragEnd`       | `(event, meta) => void`                      | –                                                  | Called when drag ends (even if no movement happened).       |
| `snapToGrid`      | `{ columnWidth: number; rowHeight: number }` | –                                                  | Enables snapped dragging to grid units.                     |

---

### CalendarCell

Atomic time slot used inside the grid.

```ts
interface CalendarCellProps {
  timeSlot?: string
  stepMinutes?: number
  use24HourFormat?: boolean
  employeeId?: string
  employee?: CalendarCellEmployee
  blockTimes?: BlockTime[]
  onTimeLabelClick?: (
    timeLabel: string,
    index: number,
    timeSlot: string,
    employee: CalendarCellEmployee
  ) => void
}
```

| Prop               | Type                                     | Default                   | Description                                          |
| ------------------ | ---------------------------------------- | ------------------------- | ---------------------------------------------------- |
| `timeSlot`         | `string`                                 | –                         | Base slot label (e.g. `'07:00'`).                    |
| `stepMinutes`      | `number`                                 | `30`                      | Interval step for generating labels.                 |
| `use24HourFormat`  | `boolean`                                | `false`                   | Determines label format.                             |
| `employeeId`       | `string`                                 | –                         | Employee column identifier.                          |
| `employee`         | `CalendarCellEmployee`                   | Derived from `employeeId` | Detailed employee descriptor used for callbacks.     |
| `blockTimes`       | `BlockTime[]`                            | `[]`                      | Blocked intervals affecting this cell.               |
| `onTimeLabelClick` | `(label, index, slot, employee) => void` | –                         | Invoked when user interacts with an available label. |

---

### TimeColumn

Vertical time indicator column typically rendered on the left side of the grid.

```ts
interface TimeColumnProps {
  timeSlots?: string[]
  cellHeight?: number
  headerHeight?: number
  headerContent?: React.ReactNode
}
```

| Prop            | Type              | Default     | Description                                   |
| --------------- | ----------------- | ----------- | --------------------------------------------- |
| `timeSlots`     | `string[]`        | `[]`        | Labels to render vertically.                  |
| `cellHeight`    | `number`          | `80`        | Row height (px).                              |
| `headerHeight`  | `number`          | `40`        | Spacer height aligning with `EmployeeHeader`. |
| `headerContent` | `React.ReactNode` | `undefined` | Custom content rendered in the header spacer. |

---

### EmployeeHeader

Responsive header row for employee/resource metadata.

```ts
type Employee = {
  id: string
  name: string
  avatarUrl?: string
  role?: string
  metadata?: Record<string, unknown>
} & Record<string, unknown>

interface EmployeeHeaderProps {
  employees: Employee[]
  renderEmployee?: EmployeeRenderer
  className?: string
  style?: React.CSSProperties
  minColumnWidth?: number
}
```

| Prop             | Type                             | Default                                  | Description                                                |
| ---------------- | -------------------------------- | ---------------------------------------- | ---------------------------------------------------------- |
| `employees`      | `Employee[]`                     | **required**                             | Data records representing each column.                     |
| `renderEmployee` | `(employee, index) => ReactNode` | Default renderer showing `employee.name` | Custom cell renderer.                                      |
| `className`      | `string`                         | `''`                                     | Additional class names applied to the grid container.      |
| `style`          | `React.CSSProperties`            | `{}`                                     | Style overrides for the grid container.                    |
| `minColumnWidth` | `number`                         | `210`                                    | Minimum width for each column (used in CSS grid template). |

---

### CalendarHeader

Top navigation bar with day-level navigation and an inline date picker.

```ts
interface CalendarHeaderProps {
  currentDate?: Date
  onDateChange?: (date: Date) => void
  className?: string
  actionsSection?: React.ReactNode
  formatDateLabel?: (date: Date) => string
  onMonthChange?: (visibleMonth: Date) => void
  onToggleDatePicker?: (isOpen: boolean) => void
}
```

| Prop                 | Type                           | Default                                   | Description                                                   |
| -------------------- | ------------------------------ | ----------------------------------------- | ------------------------------------------------------------- |
| `currentDate`        | `Date`                         | `new Date()`                              | Day currently selected.                                       |
| `onDateChange`       | `(date: Date) => void`         | –                                         | Fired after user selects a new date.                          |
| `className`          | `string`                       | –                                         | Optional class for the header wrapper.                        |
| `actionsSection`     | `React.ReactNode`              | –                                         | Custom React node rendered in the trailing actions slot.      |
| `formatDateLabel`    | `(date: Date) => string`       | `dayjs(date).format('dddd, MMM D, YYYY')` | Custom formatter for the main date button label.              |
| `onMonthChange`      | `(visibleMonth: Date) => void` | –                                         | Called whenever the visible month in the date picker changes. |
| `onToggleDatePicker` | `(isOpen: boolean) => void`    | –                                         | Fired when the date picker popover opens or closes.           |

---

### CurrentTimeLine

Animated indicator showing the present time inside the grid.

```ts
interface CurrentTimeLineProps {
  startHour: number
  endHour: number
  cellHeight: number
  displayIntervalMinutes: number
  isVisible?: boolean
  currentDate?: Date
}
```

| Prop                     | Type      | Default      | Description                                                                |
| ------------------------ | --------- | ------------ | -------------------------------------------------------------------------- |
| `startHour`              | `number`  | **required** | Lower bound (inclusive) of the rendered schedule.                          |
| `endHour`                | `number`  | **required** | Upper bound (exclusive) of the rendered schedule.                          |
| `cellHeight`             | `number`  | **required** | Height (px) for each interval used to compute offsets.                     |
| `displayIntervalMinutes` | `number`  | **required** | Minutes represented by each row; used to translate current time to pixels. |
| `isVisible`              | `boolean` | `true`       | Enables or hides the indicator entirely.                                   |
| `currentDate`            | `Date`    | `new Date()` | When not equal to today, the indicator remains hidden.                     |

---

## Shared Types

### Calendar Events

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

interface CalendarEventDragMeta {
  delta: { x: number; y: number }
  pointer: { clientX: number; clientY: number }
  bounds: DOMRect | null
}

interface CalendarEventRenderContext {
  event: CalendarEventData
  isDragging: boolean
}

type CalendarEventChildren =
  | React.ReactNode
  | ((context: CalendarEventRenderContext) => React.ReactNode)

interface CalendarEventSnapGrid {
  columnWidth: number
  rowHeight: number
}
```

### Day View Helpers

```ts
type DayViewEmployee = {
  id: string
  name: string
  columnWidth?: number | string
} & Record<string, unknown>

type DayViewEventClickHandler = (
  event: CalendarEventData,
  employee: DayViewEmployee
) => void
type DayViewEventDragHandler = (
  event: CalendarEventData,
  deltaX: number,
  deltaY: number
) => void
type DayViewEventDragEndHandler = (
  event: CalendarEventData,
  newEmployeeId: string,
  newStart: string
) => void
type DayViewEventDropHandler = (
  event: CalendarEventData,
  next: CalendarGridDropResult
) => void
type DayViewTimeLabelClickHandler = (
  timeLabel: string,
  index: number,
  timeSlot: string,
  employee: DayViewEmployee
) => void
type DayViewEventRenderer = (params: {
  event: CalendarEventData
  isDragging: boolean
}) => React.ReactNode
```

### Calendar Grid Helpers

```ts
type CalendarGridEmployee = CalendarCellEmployee & {
  columnWidth?: number | string
}

interface CalendarGridDropResult {
  employeeId: string
  start: string
  end: string
}
```

### Employee Types

```ts
type Employee = {
  id: string
  name: string
  avatarUrl?: string
  role?: string
  metadata?: Record<string, unknown>
} & Record<string, unknown>

type EmployeeRenderer = (employee: Employee, index: number) => React.ReactNode

type CalendarCellEmployee = Pick<Employee, 'id' | 'name'>
```

### Time Column

```ts
interface TimeColumnProps {
  timeSlots?: string[]
  cellHeight?: number
  headerHeight?: number
}
```

### Current Time Line

```ts
interface CurrentTimeLinePosition {
  top: number
  isInRange: boolean
}
```

### Block Time

```ts
interface BlockTime {
  id: string
  employeeId: string
  start: string
  end: string
  title?: string
  description?: string
  color?: string
  type?: 'blocked' | 'unavailable' | 'maintenance'
}

type EmployeeBlockTimes = Record<string, BlockTime[]>
```

---

## Utilities

The following helper functions live in `src/types/blockTime.ts` and are re-exported.

| Function                | Signature                                                                  | Description                                                           |
| ----------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `isTimeBlocked`         | `(timeSlot: string, blockTimes: BlockTime[]) => boolean`                   | Returns `true` when the specified slot intersects any block interval. |
| `isTimeRangeBlocked`    | `(startTime: string, endTime: string, blockTimes: BlockTime[]) => boolean` | Tests if a range overlaps a block interval.                           |
| `getEmployeeBlockTimes` | `(employeeId: string, blockTimesMap: EmployeeBlockTimes) => BlockTime[]`   | Convenience accessor returning block times for a specific employee.   |

These utilities are leveraged internally by `CalendarGrid` and `CalendarCell`, and can be reused by consumers for validation or pre-processing.

---

For additional walkthroughs and live examples, see the Storybook stories in `src/components/**/` or check the guides in `EXAMPLES.md`.
