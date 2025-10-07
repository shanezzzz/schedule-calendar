import type { ReactNode } from 'react';

export interface CalendarHeaderProps {
  currentDate?: Date;
  onDateChange?: (date: Date) => void;
  className?: string;
  actionsSection?: ReactNode;
  formatDateLabel?: (date: Date) => string;
  onMonthChange?: (visibleMonth: Date) => void;
  onToggleDatePicker?: (isOpen: boolean) => void;
}
