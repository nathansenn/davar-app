/**
 * Pure streak / reading-progress math, extracted from the reading store so it
 * can be unit-tested without React Native / AsyncStorage.
 */

export interface StreakState {
  streak: number;
  longestStreak: number;
  lastReadDate: string | null;
  totalDaysRead: number;
}

/** YYYY-MM-DD for a given Date (defaults to now). */
export function isoDay(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

export function dayBefore(day: string): string {
  return isoDay(new Date(new Date(day + 'T00:00:00.000Z').getTime() - 86400000));
}

/**
 * Compute the new streak state when the user completes a reading on `today`.
 * - continues the streak if the last read was yesterday
 * - leaves it unchanged if already read today (no double count)
 * - otherwise starts a fresh streak at 1
 */
export function completeReading(state: StreakState, today: string): StreakState {
  const yesterday = dayBefore(today);

  if (state.lastReadDate === today) {
    // Already counted today — nothing changes.
    return state;
  }

  const newStreak = state.lastReadDate === yesterday ? state.streak + 1 : 1;

  return {
    streak: newStreak,
    longestStreak: Math.max(state.longestStreak, newStreak),
    lastReadDate: today,
    totalDaysRead: state.totalDaysRead + 1,
  };
}

/**
 * Re-evaluate streak on app open: if the last read was before yesterday the
 * streak is broken. Returns the streak value (0 if broken).
 */
export function currentStreak(lastReadDate: string | null, streak: number, today: string): number {
  if (!lastReadDate) return 0;
  const yesterday = dayBefore(today);
  if (lastReadDate < yesterday) return 0;
  return streak;
}

/** Add a plan day to the completed set (sorted, deduped). */
export function addCompletedDay(completedDays: number[], day: number): number[] {
  if (completedDays.includes(day)) return completedDays;
  return [...completedDays, day].sort((a, b) => a - b);
}
