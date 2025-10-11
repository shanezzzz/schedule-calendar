# Usage Guide

## Installation

```bash
npm install schedule-calendar
```

## Basic Usage

### 1. Out of the Box

```tsx
import React, { useState } from 'react'
import { Calendar } from 'schedule-calendar'
// Works out of the box, no need to import additional styles!

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  return (
    <div>
      <h1>My Calendar</h1>
      <Calendar value={selectedDate} onChange={setSelectedDate} />
    </div>
  )
}

export default App
```

### 2. Local Development with npm link

#### In the component library project:

```bash
# Build the component library
npm run build

# Create global link
npm link
```

#### In the target project:

```bash
# Link the component library
npm link schedule-calendar

# If the target project uses TypeScript, ensure peer dependencies are installed
npm install react react-dom
```

#### Usage in target project:

```tsx
import React, { useState } from 'react'
import { Calendar } from 'schedule-calendar'
// 开箱即用，无需额外导入样式！

function App() {
  const [date, setDate] = useState(new Date())

  return (
    <div>
      <Calendar
        value={date}
        onChange={setDate}
        minDate={new Date(2024, 0, 1)}
        maxDate={new Date(2024, 11, 31)}
      />
    </div>
  )
}
```

### 3. Out-of-the-Box Features

- ✅ **No additional configuration needed** - Styles are inlined into JS files
- ✅ **Automatic style injection** - Styles are automatically injected when component loads
- ✅ **Zero configuration usage** - Just import the component and use it
- ✅ **Style isolation** - Uses CSS Modules to avoid style conflicts

4. **CSS Modules Check**:
   - The component library uses CSS Modules, class names are automatically transformed
   - If you need custom styles, use the `className` property

### 4. Advanced Usage

```tsx
import React, { useState } from 'react'
import { Calendar } from 'schedule-calendar'
import 'schedule-calendar/styles'

function AdvancedCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  return (
    <div className="my-calendar-container">
      <Calendar
        value={selectedDate}
        onChange={setSelectedDate}
        minDate={new Date(2024, 0, 1)}
        maxDate={new Date(2024, 11, 31)}
        disabled={false}
        className="custom-calendar"
        style={{
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
        }}
      />
    </div>
  )
}
```

## Troubleshooting

### Styles Not Displaying

1. Ensure styles are imported: `import 'schedule-calendar/styles'`
2. Check if build was successful: `npm run build`
3. Confirm `dist/styles.css` file exists

### TypeScript Errors

1. Ensure peer dependencies are installed: `npm install react react-dom`
2. Check if TypeScript configuration is correct

### Build Errors

1. Ensure all dependencies are installed: `npm install`
2. Clean and rebuild: `rm -rf dist && npm run build`
