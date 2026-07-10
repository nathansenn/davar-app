import {
  isoDay,
  dayBefore,
  completeReading,
  currentStreak,
  addCompletedDay,
  StreakState,
} from '../streak';

const base: StreakState = { streak: 0, longestStreak: 0, lastReadDate: null, totalDaysRead: 0 };

describe('streak math', () => {
  it('dayBefore subtracts a day across month boundaries', () => {
    expect(dayBefore('2026-03-01')).toBe('2026-02-28');
    expect(dayBefore('2026-01-01')).toBe('2025-12-31');
  });

  it('starts a streak at 1 on first completion', () => {
    const next = completeReading(base, '2026-07-08');
    expect(next).toMatchObject({ streak: 1, longestStreak: 1, totalDaysRead: 1, lastReadDate: '2026-07-08' });
  });

  it('continues the streak when last read was yesterday', () => {
    const state: StreakState = { streak: 3, longestStreak: 5, lastReadDate: '2026-07-07', totalDaysRead: 10 };
    const next = completeReading(state, '2026-07-08');
    expect(next).toMatchObject({ streak: 4, longestStreak: 5, totalDaysRead: 11 });
  });

  it('bumps longestStreak when surpassed', () => {
    const state: StreakState = { streak: 5, longestStreak: 5, lastReadDate: '2026-07-07', totalDaysRead: 10 };
    expect(completeReading(state, '2026-07-08').longestStreak).toBe(6);
  });

  it('does not double count when already read today', () => {
    const state: StreakState = { streak: 4, longestStreak: 5, lastReadDate: '2026-07-08', totalDaysRead: 11 };
    expect(completeReading(state, '2026-07-08')).toEqual(state);
  });

  it('resets to 1 after a gap', () => {
    const state: StreakState = { streak: 9, longestStreak: 9, lastReadDate: '2026-07-01', totalDaysRead: 20 };
    const next = completeReading(state, '2026-07-08');
    expect(next.streak).toBe(1);
    expect(next.longestStreak).toBe(9);
    expect(next.totalDaysRead).toBe(21);
  });

  it('currentStreak breaks when last read was before yesterday', () => {
    expect(currentStreak('2026-07-01', 9, '2026-07-08')).toBe(0);
    expect(currentStreak('2026-07-07', 9, '2026-07-08')).toBe(9);
    expect(currentStreak('2026-07-08', 9, '2026-07-08')).toBe(9);
    expect(currentStreak(null, 9, '2026-07-08')).toBe(0);
  });

  it('addCompletedDay dedupes and sorts', () => {
    expect(addCompletedDay([1, 3], 2)).toEqual([1, 2, 3]);
    expect(addCompletedDay([1, 2], 2)).toEqual([1, 2]);
  });

  it('isoDay formats a date', () => {
    expect(isoDay(new Date('2026-07-08T12:34:00Z'))).toBe('2026-07-08');
  });
});
