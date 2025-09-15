import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Calendar from './Calendar'

describe('Calendar', () => {
  it('renders calendar component', () => {
    render(<Calendar />)
    expect(screen.getByTestId('calendar')).toBeInTheDocument()
  })

  it('displays current month and year', () => {
    const testDate = new Date(2024, 0, 15) // January 2024
    render(<Calendar value={testDate} />)
    
    expect(screen.getByText('January 2024')).toBeInTheDocument()
  })

  it('calls onChange when date is selected', () => {
    const onChange = vi.fn()
    const testDate = new Date(2024, 0, 15) // January 15, 2024
    render(<Calendar value={testDate} onChange={onChange} />)
    
    const dateButton = screen.getByLabelText(/2024-01-15/)
    fireEvent.click(dateButton)
    
    expect(onChange).toHaveBeenCalled()
  })

  it('disables interaction when disabled prop is true', () => {
    const onChange = vi.fn()
    const testDate = new Date(2024, 0, 15) // January 15, 2024
    render(<Calendar value={testDate} disabled onChange={onChange} />)
    
    const dateButton = screen.getByLabelText(/2024-01-15/)
    fireEvent.click(dateButton)
    
    expect(onChange).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    render(<Calendar className="custom-class" />)
    const calendar = screen.getByTestId('calendar')
    expect(calendar).toHaveClass('custom-class')
  })
})
