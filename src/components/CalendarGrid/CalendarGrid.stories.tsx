import type { Story } from '@ladle/react';
import CalendarGrid from './CalendarGrid';

export const Default: Story = () => (
  <div style={{ height: '600px', width: '800px' }}>
    <CalendarGrid />
  </div>
);

export const CompactView: Story = () => (
  <div style={{ height: '400px', width: '600px' }}>
    <CalendarGrid />
  </div>
);

export const LargeView: Story = () => (
  <div style={{ height: '800px', width: '1200px' }}>
    <CalendarGrid />
  </div>
);