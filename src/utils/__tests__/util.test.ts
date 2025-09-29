import { describe, expect, it } from 'vitest';
import { addMinutesToSlot, differenceInMinutes, slotToMinutes } from '../util';

describe('time utilities', () => {
  it('converts slot to minutes', () => {
    expect(slotToMinutes('08:30')).toBe(510);
  });

  it('adds minutes to slot with wrap-around', () => {
    expect(addMinutesToSlot('23:30', 90)).toBe('01:00');
  });

  it('calculates positive difference including overnight ranges', () => {
    expect(differenceInMinutes('08:00', '09:30')).toBe(90);
    expect(differenceInMinutes('22:00', '01:00')).toBe(180);
  });
});
