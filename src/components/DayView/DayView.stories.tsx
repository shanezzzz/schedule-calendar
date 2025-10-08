import { useCallback, useState } from 'react'
import type { Story } from '@ladle/react'
import DayView from './DayView'
import type { CalendarEventData } from '../CalendarEvent'
import type { Employee } from '../EmployeeHeader'
import type { EmployeeBlockTimes } from '../../types/blockTime'
import type {
  DayViewEventDropHandler,
  DayViewEventClickHandler,
  DayViewTimeLabelClickHandler,
} from './types'

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

const employees: Employee[] = [
  { id: 'Carry', name: 'Carry Johnson' },
  { id: 'Lucy', name: 'Lucy Tran' },
  { id: 'John', name: 'John Ikeda' },
  { id: 'Tom', name: 'Tomas Garcia' },
  { id: 'Jerry', name: 'Jerry Liu' },
  { id: 'Alice', name: 'Alice Muller' },
  { id: 'Bob', name: 'Bob Singh' },
]

const employeesWithWidths: Employee[] = [
  { id: 'Carry', name: 'Carry Johnson', columnWidth: 180 },
  { id: 'Lucy', name: 'Lucy Tran', columnWidth: 280 },
  { id: 'John', name: 'John Ikeda', columnWidth: 220 },
  { id: 'Tom', name: 'Tomas Garcia', columnWidth: '18rem' },
  { id: 'Jerry', name: 'Jerry Liu', columnWidth: 240 },
  { id: 'Alice', name: 'Alice Muller', columnWidth: 200 },
  { id: 'Bob', name: 'Bob Singh', columnWidth: '14rem' },
]

// 示例 Block Time 数据
const initialBlockTimes: EmployeeBlockTimes = {
  Carry: [
    {
      id: 'block-1',
      employeeId: 'Carry',
      start: '12:00',
      end: '13:00',
      title: 'Lunch Break',
      color: '#fef3c7',
      type: 'unavailable',
    },
  ],
  Lucy: [
    {
      id: 'block-2',
      employeeId: 'Lucy',
      start: '09:00',
      end: '16:00',
      // title: 'Maintenance',
      color: '#fee2e2',
      type: 'maintenance',
    },
  ],
  John: [
    {
      id: 'block-3',
      employeeId: 'John',
      start: '14:00',
      end: '15:00',
      title: 'Unavailable',
      color: '#f3f4f6',
      type: 'unavailable',
    },
  ],
}

export const DayViews: Story = () => {
  const [events, setEvents] = useState<CalendarEventData[]>(initialEvents)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  // const [viewMode] = useState<'day' | 'week' | 'month'>('day')

  console.log('events', events)
  console.log('currentDate', currentDate)

  const handleDrop = useCallback<DayViewEventDropHandler>((event, next) => {
    console.log('event drop', event, next)
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
  }, [])

  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date)
    console.log('Date changed to:', date)
  }, [])

  const handleTimeLabelClick = useCallback<DayViewTimeLabelClickHandler>(
    (timeLabel, index, timeSlot, employee) => {
      console.log('Time label clicked:', {
        timeLabel,
        index,
        timeSlot,
        employee,
      })
    },
    []
  )

  const handleEventClick = useCallback<DayViewEventClickHandler>(
    (event, employee) => {
      console.log('Event clicked:', { event, employee })
    },
    []
  )

  const handleAddEvent = useCallback(() => {
    setEvents(prev => [
      ...prev,
      {
        id: `evt-${prev.length + 1}`,
        title: 'New Event',
        start: '10:00',
        end: '11:00',
        employeeId: 'Carry',
        color: '#2563eb',
      },
    ])
  }, [])

  // 自定义头部操作区域
  const headerActions = (
    <>
      <button className="primaryButton" onClick={handleAddEvent}>
        Add Event
      </button>
    </>
  )

  const timeColumnHeaderContent = (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: '12px',
        color: '#0f172a',
      }}
    >
      Local Time
    </div>
  )

  const renderSlotContent = useCallback((time: string) => {
    return (
      <span
        style={{
          fontSize: '10px',
          color: '#94a3b8',
          fontWeight: 500,
        }}
      >
        {time}
      </span>
    )
  }, [])

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
        employees={employees}
        renderEmployee={(employee, index) => (
          <div
            style={{
              height: '80px',
              background:
                index % 2 === 0
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
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}
            >
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
          },
        }}
        events={events}
        blockTimes={initialBlockTimes}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onTimeLabelClick={handleTimeLabelClick}
        onEventClick={handleEventClick}
        headerActions={headerActions}
        timeColumnHeaderContent={timeColumnHeaderContent}
        timeColumnSlotContentRenderer={renderSlotContent}
        onEventDrop={handleDrop}
        renderEvent={({ event }) => (
          <div style={{ padding: '12px', color: '#ffffff' }}>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
              {event.title}
            </div>
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

  const handleTimeLabelClick = useCallback(
    (
      timeLabel: string,
      index: number,
      timeSlot: string,
      employee: { id: string; name: string }
    ) => {
      console.log('Time label clicked:', {
        timeLabel,
        index,
        timeSlot,
        employee,
      })
    },
    []
  )

  const handleEventClick = useCallback(
    (event: CalendarEventData, employee: { id: string; name: string }) => {
      console.log('Event clicked:', { event, employee })
    },
    []
  )

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
        background:
          index % 2 === 0
            ? 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
            : 'linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)',
        borderRight: '1px solid rgba(226, 232, 240, 0.6)',
        minHeight: '60px',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background =
          'linear-gradient(145deg, #dbeafe 0%, #bfdbfe 100%)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background =
          index % 2 === 0
            ? 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
            : 'linear-gradient(145deg, #f1f5f9 0%, #e2e8f0 100%)'
      }}
    >
      <div
        style={{
          fontWeight: 600,
          fontSize: '14px',
          color: '#1e293b',
          marginBottom: '4px',
        }}
      >
        {employee.name}
      </div>
      <div
        style={{
          fontSize: '10px',
          color: '#64748b',
          textAlign: 'center',
          lineHeight: '1.2',
        }}
      >
        Employee #{index + 1}
      </div>
      <div
        style={{
          fontSize: '8px',
          color: '#94a3b8',
          marginTop: '2px',
        }}
      >
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
        // use24HourFormat
        employeeIds={['Carry', 'Lucy', 'John', 'Tom', 'Jerry', 'Alice', 'Bob']}
        events={events}
        blockTimes={initialBlockTimes}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onTimeLabelClick={handleTimeLabelClick}
        onEventClick={handleEventClick}
        onEventDrop={handleDrop}
        renderEmployee={renderEmployee}
        employeeHeaderProps={{
          minColumnWidth: 150,
          style: {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          },
        }}
        renderEvent={({ event }) => (
          <div style={{ padding: '12px', color: '#ffffff' }}>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
              {event.title}
            </div>
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

export const VariableColumnWidths: Story = () => {
  const [events, setEvents] = useState<CalendarEventData[]>(initialEvents)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  const handleDrop = useCallback<DayViewEventDropHandler>((event, next) => {
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
  }, [])

  return (
    <div
      style={{
        height: '780px',
        width: '1280px',
        padding: '16px',
        background: '#e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        borderRadius: '20px',
      }}
    >
      <div>
        <h2 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>
          Variable Column Width Demo
        </h2>
        <p style={{ margin: 0, fontSize: '13px', color: '#475569' }}>
          每位员工的列宽都可以独立设置，CalendarGrid
          将自动对齐对应的时间单元格。
        </p>
      </div>
      <DayView
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        employees={employeesWithWidths}
        events={events}
        blockTimes={initialBlockTimes}
        onEventDrop={handleDrop}
        use24HourFormat
        employeeHeaderProps={{ minColumnWidth: 180 }}
        headerActions={
          <button type="button" onClick={() => setCurrentDate(new Date())}>
            返回今天
          </button>
        }
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

  const handleTimeLabelClick = useCallback(
    (
      timeLabel: string,
      index: number,
      timeSlot: string,
      employee: { id: string; name: string }
    ) => {
      console.log('Time label clicked:', {
        timeLabel,
        index,
        timeSlot,
        employee,
      })
    },
    []
  )

  const handleEventClick = useCallback(
    (event: CalendarEventData, employee: { id: string; name: string }) => {
      console.log('Event clicked:', { event, employee })
    },
    []
  )

  // 高级自定义员工头部渲染函数
  const renderAdvancedEmployee = (employee: Employee) => {
    // 模拟当前服务数量和总服务数量
    const currentServices = Math.floor(Math.random() * 8) + 1 // 1-8
    const maxServices = 10
    const servicePercentage = (currentServices / maxServices) * 100

    // 根据当前服务数量判断是否在服务中
    const isServing = currentServices > 2
    const status = isServing ? 'Serving' : 'Available'
    const statusColors = {
      Serving: '#f59e0b', // 橙色 - 正在服务
      Available: '#10b981', // 绿色 - 空闲
    }

    // 根据服务量计算进度条颜色
    const getProgressColor = (percentage: number) => {
      if (percentage >= 90) return '#ef4444' // 红色 - 高负载
      if (percentage >= 70) return '#f59e0b' // 橙色 - 中等负载
      return '#10b981' // 绿色 - 低负载
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
          minHeight: '100px',
          transition: 'all 0.3s ease-in-out',
          cursor: 'pointer',
          position: 'relative',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background =
            'linear-gradient(145deg, #dbeafe 0%, #bfdbfe 100%)'
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background =
            'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
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
        <div style={{ textAlign: 'center', flex: 1, width: '100%' }}>
          <div
            style={{
              fontWeight: 600,
              fontSize: '13px',
              color: '#1e293b',
              marginBottom: '4px',
              lineHeight: '1.2',
            }}
          >
            {employee.name}
          </div>

          <div
            style={{
              fontSize: '8px',
              color: statusColors[status as keyof typeof statusColors],
              fontWeight: '500',
              padding: '2px 6px',
              backgroundColor: `${statusColors[status as keyof typeof statusColors]}20`,
              borderRadius: '4px',
              display: 'inline-block',
              marginBottom: '6px',
            }}
          >
            {status}
          </div>

          {/* 服务数量展示 */}
          <div
            style={{
              marginBottom: '4px',
              fontSize: '9px',
              color: '#64748b',
              fontWeight: '500',
            }}
          >
            services: {currentServices}/{maxServices}
          </div>

          {/* 进度条 */}
          <div
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#e2e8f0',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '2px',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: `${servicePercentage}%`,
                height: '100%',
                backgroundColor: getProgressColor(servicePercentage),
                borderRadius: '2px',
                transition: 'all 0.3s ease-in-out',
                position: 'relative',
              }}
            >
              {/* 进度条光泽效果 */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '50%',
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                  borderRadius: '2px 2px 0 0',
                }}
              />
            </div>
          </div>

          {/* 百分比文字 */}
          <div
            style={{
              fontSize: '7px',
              color: getProgressColor(servicePercentage),
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {Math.round(servicePercentage)}%
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
        blockTimes={initialBlockTimes}
        currentDate={currentDate}
        onDateChange={handleDateChange}
        onTimeLabelClick={handleTimeLabelClick}
        onEventDrop={handleDrop}
        renderEmployee={renderAdvancedEmployee}
        employeeHeaderProps={{
          minColumnWidth: 120,
          style: {
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
          },
        }}
        renderEvent={({ event }) => (
          <div style={{ padding: '12px', color: '#ffffff' }}>
            <div style={{ fontWeight: 600, fontSize: 12, marginBottom: 4 }}>
              {event.title}
            </div>
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
        onEventClick={handleEventClick}
        headerActions={<button>Quick Book</button>}
      />
    </div>
  )
}
