import { useMemo } from "react";
import dayjs from "dayjs";
import styles from './TimeColumn.module.scss';

interface TimeColumnProps {
  startHour?: number;
  endHour?: number;
  stepMinutes?: number;
  cellHeight?: number;
}

const TimeColumn: React.FC<TimeColumnProps> = ({
  startHour = 7,
  endHour = 25,
  stepMinutes = 30,
  cellHeight = 80,
}) => {
  const slots = useMemo(() => {
    const times: string[] = [];
    const start = dayjs().hour(startHour).minute(0);
    const end = dayjs().hour(endHour).minute(0);

    let current = start;
    while (current.isBefore(end) || current.isSame(end)) {
      times.push(current.format("HH:mm"));
      current = current.add(stepMinutes, "minute");
    }
    return times;
  }, [startHour, endHour, stepMinutes]);

  return (
    <div className={styles.timeColumn} style={{ paddingTop: '40px' }}>
      {slots.map((time, idx) => (
        <div
          key={idx}
          className={styles.timeSlot}
          style={{ height: `${cellHeight}px` }}
        >
          {time}
        </div>
      ))}
    </div>
  );
};

export default TimeColumn;