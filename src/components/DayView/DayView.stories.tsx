import { useCallback, useState } from 'react'
import type { Story } from '@ladle/react'
import DayView from './DayView'
import { CalendarEventData } from '../CalendarEvent/CalendarEvent'
import { Employee } from '../EmployeeHeader/EmployeeHeader'

const initialEvents: CalendarEventData[] = [
  {
    id: 'evt-1',
    title: 'Standup Meeting',
    start: '08:00',
    end: '09:00',
    employeeId: 'Carry',
    color: '#2563eb',
    description: 'Daily sync with the product squad',
  },
  {
    id: 'evt-2',
    title: 'Client Call',
    start: '09:30',
    end: '10:30',
    employeeId: 'Lucy',
    color: '#10b981',
    description: 'Review contract milestones',
  },
  {
    id: 'evt-3',
    title: 'Design Review',
    start: '11:00',
    end: '12:00',
    employeeId: 'John',
    color: '#f59e0b',
    description: 'UI/UX direction for upcoming sprint',
  },
  {
    id: 'evt-4',
    title: 'Design Review',
    start: '11:00',
    end: '12:00',
    employeeId: 'Tom',
  },
]

export const DayViews: Story = () => {
  const [events, setEvents] = useState<CalendarEventData[]>(initialEvents)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  // const [viewMode] = useState<'day' | 'week' | 'month'>('day')

  console.log('events', events)
  console.log('currentDate', currentDate)

  const handleDrop = useCallback(
    (
      event: CalendarEventData,
      next: { employeeId: string; start: string; end: string }
    ) => {
      setEvents(prev =>
        prev.map(item =>
          item.id === event.id
            ? {
                ...item,
                employeeId: next.employeeId,
                start: next.start,
                end: next.end,
              }
            : item
        )
      )
    },
    []
  )

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date)
    console.log('Date changed to:', date)
  }, [])

  // 自定义头部操作区域
  const headerActions = (
    <>
      <button
        className="primaryButton"
        onClick={() => console.log('Add event clicked')}
      >
        Add Event
      </button>
    </>
  )

  return (
    <div
      style={{
        height: '900px',
        width: '1200px',
        padding: '0',
        background: '#f9fafb',
      }}
    >
      <DayView
        startHour={7}
        endHour={23}
        stepMinutes={15}
        use24HourFormat
        employeeIds={['Carry', 'Lucy', 'John', 'Tom', 'Jerry', 'Alice', 'Bob']}
        renderEmployee={(employee, index) => (
          <div 
            style={{ 
              height: '80px', 
              background: index % 2 === 0 
                ? 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)' 
                : 'linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)',
              color: '#1e293b', 
              borderRadius: '8px', 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease-in-out',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
              {employee.name}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>
              Employee #{index + 1}
            </div>
          </div>
        )}
        employeeHeaderProps={{
          minColumnWidth: 120,
          style: {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
          }
        }}
        events={events}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        headerActions={headerActions}
        onEventDrop={handleDrop}
        renderEvent={({ event }) => (
          <div style={{ padding: '12px', color: '#ffffff' }}>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{event.title}</div>
            <div
              style={{ fontSize: 10, marginBottom: 4 }}
            >{`${event.start} - ${event.end}`}</div>
            {event.description && (
              <div style={{ fontSize: 10, opacity: 0.85 }}>
                {event.description}
              </div>
            )}
          </div>
        )}
      />
    </div>
  )
}

// 自定义员工头部渲染示例
export const CustomEmployeeHeader: Story = () => {
  const [events, setEvents] = useState<CalendarEventData[]>(initialEvents)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  const handleDrop = useCallback(
    (
      event: CalendarEventData,
      next: { employeeId: string; start: string; end: string }
    ) => {
      setEvents(prev =>
        prev.map(item =>
          item.id === event.id
            ? {
                ...item,
                employeeId: next.employeeId,
                start: next.start,
                end: next.end,
              }
            : item
        )
      )
    },
    []
  )

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date)
    console.log('Date changed to:', date)
  }, [])

  // 自定义员工头部渲染函数
  const renderEmployee = (employee: Employee, index: number) => (
    <div
      key={employee.id}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 8px',
        background: index % 2 === 0 
          ? 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)' 
          : 'linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)',
        borderRight: '1px solid rgba(226, 232, 240, 0.6)',
        minHeight: '60px',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'linear-gradient(145deg, #dbeafe 0%, #bfdbfe 100%)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = index % 2 === 0 
          ? 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)' 
          : 'linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)'
      }}
    >
      <div style={{ 
        fontWeight: 600, 
        fontSize: '14px', 
        color: '#1e293b',
        marginBottom: '4px'
      }}>
        {employee.name}
      </div>
      <div style={{ 
        fontSize: '10px', 
        color: '#64748b',
        textAlign: 'center',
        lineHeight: '1.2'
      }}>
        Employee #{index + 1}
      </div>
      <div style={{ 
        fontSize: '8px', 
        color: '#94a3b8',
        marginTop: '2px'
      }}>
        Available
      </div>
    </div>
  )

  return (
    <div
      style={{
        height: '900px',
        width: '1200px',
        padding: '0',
        background: '#f9fafb',
      }}
    >
      <DayView
        startHour={7}
        endHour={23}
        stepMinutes={15}
        use24HourFormat
        employeeIds={['Carry', 'Lucy', 'John', 'Tom', 'Jerry', 'Alice', 'Bob']}
        events={events}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onEventDrop={handleDrop}
        renderEmployee={renderEmployee}
        employeeHeaderProps={{
          minColumnWidth: 150,
          style: {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }
        }}
        renderEvent={({ event }) => (
          <div style={{ padding: '12px', color: '#ffffff' }}>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{event.title}</div>
            <div
              style={{ fontSize: 10, marginBottom: 4 }}
            >{`${event.start} - ${event.end}`}</div>
            {event.description && (
              <div style={{ fontSize: 10, opacity: 0.85 }}>
                {event.description}
              </div>
            )}
          </div>
        )}
      />
    </div>
  )
}

// 复杂自定义员工头部示例
export const AdvancedEmployeeHeader: Story = () => {
  const [events, setEvents] = useState<CalendarEventData[]>(initialEvents)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  const handleDrop = useCallback(
    (
      event: CalendarEventData,
      next: { employeeId: string; start: string; end: string }
    ) => {
      setEvents(prev =>
        prev.map(item =>
          item.id === event.id
            ? {
                ...item,
                employeeId: next.employeeId,
                start: next.start,
                end: next.end,
              }
            : item
        )
      )
    },
    []
  )

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date)
    console.log('Date changed to:', date)
  }, [])

  // 高级自定义员工头部渲染函数
  const renderAdvancedEmployee = (employee: Employee, index: number) => {
    const statuses = ['Available', 'Busy', 'Away', 'Offline']
    const status = statuses[index % statuses.length]
    const statusColors = {
      'Available': '#10b981',
      'Busy': '#f59e0b', 
      'Away': '#ef4444',
      'Offline': '#6b7280'
    }

    return (
      <div
        key={employee.id}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 12px',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
          borderRight: '1px solid rgba(226, 232, 240, 0.6)',
          minHeight: '80px',
          transition: 'all 0.3s ease-in-out',
          cursor: 'pointer',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(145deg, #dbeafe 0%, #bfdbfe 100%)'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* 状态指示器 */}
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: statusColors[status as keyof typeof statusColors],
            border: '2px solid #ffffff',
            boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1)',
          }}
        />
        
        {/* 员工头像区域 */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '14px',
            marginBottom: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          {employee.name.charAt(0).toUpperCase()}
        </div>

        {/* 员工信息 */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <div style={{ 
            fontWeight: 600, 
            fontSize: '13px', 
            color: '#1e293b',
            marginBottom: '2px',
            lineHeight: '1.2'
          }}>
            {employee.name}
          </div>
          <div style={{ 
            fontSize: '9px', 
            color: '#64748b',
            marginBottom: '4px'
          }}>
            ID: {employee.id}
          </div>
          <div style={{ 
            fontSize: '8px', 
            color: statusColors[status as keyof typeof statusColors],
            fontWeight: '500',
            padding: '2px 6px',
            backgroundColor: `${statusColors[status as keyof typeof statusColors]}20`,
            borderRadius: '4px',
            display: 'inline-block'
          }}>
            {status}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        height: '900px',
        width: '1200px',
        padding: '0',
        background: '#f9fafb',
      }}
    >
      <DayView
        startHour={7}
        endHour={23}
        stepMinutes={15}
        use24HourFormat
        employeeIds={['Carry', 'Lucy', 'John', 'Tom', 'Jerry', 'Alice', 'Bob']}
        events={events}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onEventDrop={handleDrop}
        renderEmployee={renderAdvancedEmployee}
        employeeHeaderProps={{
          minColumnWidth: 120,
          style: {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            margin: '0 4px',
          }
        }}
        renderEvent={({ event }) => (
          <div style={{ padding: '12px', color: '#ffffff' }}>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>{event.title}</div>
            <div
              style={{ fontSize: 10, marginBottom: 4 }}
            >{`${event.start} - ${event.end}`}</div>
            {event.description && (
              <div style={{ fontSize: 10, opacity: 0.85 }}>
                {event.description}
              </div>
            )}
          </div>
        )}
      />
    </div>
  )
}
