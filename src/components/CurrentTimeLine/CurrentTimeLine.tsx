import React, { useState, useEffect, useRef, useMemo } from 'react'
import dayjs from 'dayjs'
import styles from './CurrentTimeLine.module.scss'
import type { CurrentTimeLineProps, CurrentTimeLinePosition } from './types'

const CurrentTimeLine: React.FC<CurrentTimeLineProps> = ({
  startHour,
  endHour,
  cellHeight,
  displayIntervalMinutes,
  isVisible = true,
  currentDate = new Date(),
  style,
  className,
}) => {
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const currentTimeLineRef = useRef<HTMLDivElement | null>(null)
  const hasAutoScrolledRef = useRef(false)

  // 每分钟更新一次时间
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date())
    }

    // 立即更新一次
    updateTime()

    // 设置定时器，每分钟更新
    const interval = setInterval(updateTime, 60000) // 60秒 = 60000毫秒

    return () => clearInterval(interval)
  }, [])

  const position = useMemo<CurrentTimeLinePosition>(() => {
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()

    if (currentHour < startHour || currentHour >= endHour) {
      return { top: -1000, isInRange: false }
    }

    const totalMinutesFromStart = (currentHour - startHour) * 60 + currentMinute
    const positionInPixels =
      (totalMinutesFromStart / displayIntervalMinutes) * cellHeight

    return {
      top: positionInPixels,
      isInRange: true,
    }
  }, [currentTime, startHour, endHour, displayIntervalMinutes, cellHeight])

  // 检查当前显示的日期是否是今天
  const isToday = dayjs(currentDate).isSame(dayjs(), 'day')

  useEffect(() => {
    if (
      !isVisible ||
      !isToday ||
      !position.isInRange ||
      hasAutoScrolledRef.current
    ) {
      return
    }

    const element = currentTimeLineRef.current
    if (!element) {
      return
    }

    const parent = element.parentElement
    if (parent) {
      const parentRect = parent.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()
      const isAlreadyVisible =
        elementRect.top >= parentRect.top &&
        elementRect.bottom <= parentRect.bottom

      if (isAlreadyVisible) {
        hasAutoScrolledRef.current = true
        return
      }
    }

    hasAutoScrolledRef.current = true
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    })
  }, [isVisible, isToday, position.isInRange, position.top])

  useEffect(() => {
    if (!isVisible || !isToday || !position.isInRange) {
      hasAutoScrolledRef.current = false
    }
  }, [isVisible, isToday, position.isInRange])

  if (!isVisible || !position.isInRange || !isToday) {
    return null
  }

  const finalClassName = className
    ? `${styles.currentTimeLine} ${className}`
    : styles.currentTimeLine

  const finalStyle: React.CSSProperties = {
    top: position.top,
    ...style,
  }

  return (
    <div
      ref={currentTimeLineRef}
      className={finalClassName}
      style={finalStyle}
    />
  )
}

export default CurrentTimeLine
