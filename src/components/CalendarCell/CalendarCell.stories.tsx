import type { Story } from '@ladle/react';
import CalendarCell from './CalendarCell';

export const Default: Story = () => <CalendarCell />;

export const WithCustomEvents: Story = () => (
  <CalendarCell 
    events={[
      { id: '1', time: '9:00 AM', title: 'Morning Meeting' },
      { id: '2', time: '2:00 PM', title: 'Project Review' },
      { id: '3', time: '4:30 PM', title: 'Team Standup' }
    ]}
    onEventClick={(eventId) => console.log('Clicked event:', eventId)}
  />
);

export const EmptyCell: Story = () => (
  <CalendarCell events={[]} />
);

export const SingleEvent: Story = () => (
  <CalendarCell 
    events={[
      { id: '1', time: '10:00 AM', title: 'Important Call' }
    ]}
  />
);

export const ManyEvents: Story = () => (
  <CalendarCell 
    events={[
      { id: '1', time: '8:00 AM', title: 'Breakfast Meeting' },
      { id: '2', time: '9:30 AM', title: 'Code Review' },
      { id: '3', time: '11:00 AM', title: 'Client Call' },
      { id: '4', time: '1:00 PM', title: 'Lunch' },
      { id: '5', time: '3:00 PM', title: 'Planning Session' },
      { id: '6', time: '5:00 PM', title: 'Wrap-up' }
    ]}
  />
);