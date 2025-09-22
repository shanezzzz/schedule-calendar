import type { Story } from '@ladle/react';
import CalendarCell from './CalendarCell';

export const Default: Story = () => <CalendarCell />;

export const WithTimeSlot: Story = () => (
  <CalendarCell 
    timeSlot="09:00"
    stepMinutes={30}
    use24HourFormat={false}
  />
);

export const TwentyFourHourFormat: Story = () => (
  <CalendarCell 
    timeSlot="14:30"
    stepMinutes={15}
    use24HourFormat={true}
  />
);

export const CustomStepMinutes: Story = () => (
  <CalendarCell 
    timeSlot="10:00"
    stepMinutes={15}
    use24HourFormat={false}
  />
);