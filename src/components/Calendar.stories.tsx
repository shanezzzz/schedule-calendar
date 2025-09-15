import type { Story } from '@ladle/react'
import { useState } from 'react'
import Calendar from './Calendar'

export const Default: Story = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  return (
    <div className="p-8">
      <Calendar
        value={selectedDate}
        onChange={setSelectedDate}
      />
    </div>
  )
}

export const WithMinMaxDate: Story = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const minDate = new Date(2024, 0, 1)
  const maxDate = new Date(2024, 11, 31)
  
  return (
    <div className="p-8">
      <Calendar
        value={selectedDate}
        onChange={setSelectedDate}
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  )
}

export const Disabled: Story = () => {
  return (
    <div className="p-8">
      <Calendar
        disabled
        value={new Date()}
      />
    </div>
  )
}

export const CustomStyling: Story = () => {
  const [selectedDate, setSelectedDate] = useState(new Date())
  
  return (
    <div className="p-8">
      <Calendar
        value={selectedDate}
        onChange={setSelectedDate}
        className="border-2 border-blue-500 rounded-xl"
        style={{ boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      />
    </div>
  )
}
