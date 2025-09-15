# Schedule Calendar

A modern React calendar component library built with TypeScript and Tailwind CSS.

## Features

- 🎨 Modern design with customizable styles
- 📱 Responsive layout, mobile-friendly
- ♿ Accessibility support
- 🧪 Complete test coverage
- 📚 Interactive documentation
- 🎯 TypeScript support
- 🎨 Tailwind CSS + CSS Modules

## Installation

```bash
npm install schedule-calendar
```

## Usage

### Basic Usage

```tsx
import React, { useState } from 'react'
import { Calendar } from 'schedule-calendar'
// Works out of the box, no need to import additional styles!

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  return (
    <Calendar
      value={selectedDate}
      onChange={setSelectedDate}
    />
  )
}
```

### Local Development with npm link

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

# Install peer dependencies
npm install react react-dom
```

#### Usage in target project:

```tsx
import React, { useState } from 'react'
import { Calendar } from 'schedule-calendar'
// Works out of the box, no need to import additional styles!

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

### Features

- 🎨 **Out of the box** - No need to import additional style files
- 📱 **Responsive design** - Mobile-friendly
- ♿ **Accessibility** - Complete ARIA support
- 🧪 **Complete testing** - 100% test coverage
- 📚 **Interactive documentation** - Documentation system based on Ladle
- 🎯 **TypeScript** - Complete type support
- 🎨 **Modern styling** - Based on Tailwind CSS + CSS Modules

## Development

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
npm run test
```

### Documentation

```bash
npm run storybook
```

### Code Linting

```bash
npm run lint
npm run format
```

## Component API

### Calendar

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| value | Date | - | Currently selected date |
| onChange | (date: Date) => void | - | Date change callback |
| minDate | Date | - | Minimum date |
| maxDate | Date | - | Maximum date |
| disabled | boolean | false | Whether disabled |
| className | string | - | Custom class name |
| style | React.CSSProperties | - | Custom styles |

## License

MIT
