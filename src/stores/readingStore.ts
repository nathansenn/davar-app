import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  isoDay,
  completeReading,
  currentStreak,
  addCompletedDay,
} from '../utils/streak';

export interface ReadingPlan {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  currentDay: number;
}

interface ReadingState {
  // Current active plan
  currentPlan: ReadingPlan | null;

  // Progress tracking
  completedDays: number[];
  streak: number;
  longestStreak: number;
  lastReadDate: string | null;
  totalDaysRead: number;

  // Today's reading
  todayPassages: string[];
  todayCompleted: boolean;

  // Actions
  setCurrentPlan: (plan: ReadingPlan | null) => void;
  markDayComplete: (day: number) => void;
  markTodayComplete: (passages: string[]) => void;
  completePlanDay: (day: number, passages: string[]) => void;
  updateStreak: () => void;
  setTodayPassages: (passages: string[]) => void;
  reset: () => void;
}

export const useReadingStore = create<ReadingState>()(
  persist(
    (set, get) => ({
      currentPlan: null,
      completedDays: [],
      streak: 0,
      longestStreak: 0,
      lastReadDate: null,
      totalDaysRead: 0,
      todayPassages: [],
      todayCompleted: false,

      setCurrentPlan: (plan) => {
        set({ currentPlan: plan, completedDays: [] });
      },

      markDayComplete: (day) => {
        const { completedDays, currentPlan } = get();
        set({
          completedDays: addCompletedDay(completedDays, day),
          currentPlan: currentPlan
            ? { ...currentPlan, currentDay: Math.min(day + 1, currentPlan.durationDays) }
            : null,
        });
      },

      markTodayComplete: (passages) => {
        const { streak, longestStreak, lastReadDate, totalDaysRead } = get();
        const next = completeReading(
          { streak, longestStreak, lastReadDate, totalDaysRead },
          isoDay()
        );
        set({ ...next, todayCompleted: true, todayPassages: passages });
      },

      // Complete a specific plan day: advances the plan pointer AND updates the
      // reading streak in one atomic action (previously nothing advanced plan
      // progress, so it was frozen at day 1).
      completePlanDay: (day, passages) => {
        const { streak, longestStreak, lastReadDate, totalDaysRead, completedDays, currentPlan } =
          get();
        const next = completeReading(
          { streak, longestStreak, lastReadDate, totalDaysRead },
          isoDay()
        );
        set({
          ...next,
          todayCompleted: true,
          todayPassages: passages,
          completedDays: addCompletedDay(completedDays, day),
          currentPlan: currentPlan
            ? { ...currentPlan, currentDay: Math.min(day + 1, currentPlan.durationDays) }
            : null,
        });
      },

      updateStreak: () => {
        const { lastReadDate, streak } = get();
        const today = isoDay();
        set({
          streak: currentStreak(lastReadDate, streak, today),
          todayCompleted: lastReadDate === today,
        });
      },

      setTodayPassages: (passages) => {
        set({ todayPassages: passages });
      },

      reset: () => {
        set({
          currentPlan: null,
          completedDays: [],
          streak: 0,
          longestStreak: 0,
          lastReadDate: null,
          totalDaysRead: 0,
          todayPassages: [],
          todayCompleted: false,
        });
      },
    }),
    {
      name: 'davar-reading',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
