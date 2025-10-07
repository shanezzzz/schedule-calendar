import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import styles from './CurrentTimeLine.module.scss';
import type { CurrentTimeLineProps, CurrentTimeLinePosition } from './types';

const CurrentTimeLine: React.FC<CurrentTimeLineProps> = ({
  startHour,
  endHour,
  cellHeight,
  displayIntervalMinutes,
  isVisible = true,
  currentDate = new Date()
}) => {
  const [, setCurrentTime] = useState(new Date());

  // 每分钟更新一次时间
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date());
    };

    // 立即更新一次
    updateTime();

    // 设置定时器，每分钟更新
    const interval = setInterval(updateTime, 60000); // 60秒 = 60000毫秒

    return () => clearInterval(interval);
  }, []);

  // 计算当前时间在日历中的位置
  const calculatePosition = (): CurrentTimeLinePosition => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    // 检查当前时间是否在显示范围内
    if (currentHour < startHour || currentHour >= endHour) {
      return { top: -1000, isInRange: false }; // 超出范围时隐藏
    }

    // 计算从开始时间到当前时间的总分钟数
    const totalMinutesFromStart = (currentHour - startHour) * 60 + currentMinute;
    
    // 计算精确的像素位置
    // 每个时间槽的高度 = cellHeight
    // 每个时间槽代表 displayIntervalMinutes 分钟
    const positionInPixels = (totalMinutesFromStart / displayIntervalMinutes) * cellHeight;

    return { 
      top: positionInPixels, // CalendarGrid 容器本身没有额外的偏移
      isInRange: true 
    };
  };

  const position = calculatePosition();

  // 检查当前显示的日期是否是今天
  const isToday = dayjs(currentDate).isSame(dayjs(), 'day');

  if (!isVisible || !position.isInRange || !isToday) {
    return null;
  }

  return (
    <div 
      className={styles.currentTimeLine}
      style={{ top: position.top }}
    />
  );
};

export default CurrentTimeLine;
