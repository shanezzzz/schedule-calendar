/**
 * Block Time 类型定义
 * 用于定义员工在特定时间段的不可操作时间
 */

export interface BlockTime {
  id: string;
  employeeId: string;
  start: string; // 时间格式，如 "09:00"
  end: string;   // 时间格式，如 "16:00"
  title?: string; // 可选的标题，如 "不可工作时间"
  description?: string; // 可选的描述
  color?: string; // 可选的背景颜色
  type?: 'blocked' | 'unavailable' | 'maintenance'; // 阻塞类型
}

export interface EmployeeBlockTimes {
  [employeeId: string]: BlockTime[];
}

/**
 * 检查给定时间是否在 Block Time 范围内
 */
export const isTimeBlocked = (
  timeSlot: string,
  blockTimes: BlockTime[]
): boolean => {
  return blockTimes.some(block => {
    return timeSlot >= block.start && timeSlot < block.end;
  });
};

/**
 * 检查给定时间范围是否与 Block Time 重叠
 */
export const isTimeRangeBlocked = (
  startTime: string,
  endTime: string,
  blockTimes: BlockTime[]
): boolean => {
  return blockTimes.some(block => {
    // 检查时间范围是否与 block time 重叠
    return (
      (startTime < block.end && endTime > block.start)
    );
  });
};

/**
 * 获取指定员工在指定时间段的 Block Time
 */
export const getEmployeeBlockTimes = (
  employeeId: string,
  blockTimesMap: EmployeeBlockTimes
): BlockTime[] => {
  return blockTimesMap[employeeId] || [];
};

