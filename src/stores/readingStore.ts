import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  updateStreak: () => void;
  setTodayPassages: (passages: string[]) => void;
  reset: () => void;
}

const getToday = () => new Date().toISOString().split('T')[0];

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
        if (!completedDays.includes(day)) {
          const newCompletedDays = [...completedDays, day].sort((a, b) => a - b);
          set({ 
            completedDays: newCompletedDays,
            currentPlan: currentPlan ? {
              ...currentPlan,
              currentDay: Math.min(day + 1, currentPlan.durationDays),
            } : null,
          });
        }
      },

      markTodayComplete: (passages) => {
        const today = getToday();
        const { lastReadDate, streak, longestStreak, totalDaysRead } = get();
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        let newStreak = streak;
        
        // If last read was yesterday, continue streak
        if (lastReadDate === yesterday) {
          newStreak = streak + 1;
        } 
        // If last read was today, keep same streak
        else if (lastReadDate === today) {
          // Already counted today
        }
        // Otherwise, start new streak
        else {
          newStreak = 1;
        }
        
        set({
          todayCompleted: true,
          todayPassages: passages,
          lastReadDate: today,
          streak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
          totalDaysRead: lastReadDate === today ? totalDaysRead : totalDaysRead + 1,
        });
      },

      updateStreak: () => {
        const { lastReadDate, streak } = get();
        const today = getToday();
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        
        // If last read was before yesterday, streak is broken
        if (lastReadDate && lastReadDate < yesterday) {
          set({ streak: 0 });
        }
        
        // Check if today is already completed
        if (lastReadDate === today) {
          set({ todayCompleted: true });
        } else {
          set({ todayCompleted: false });
        }
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
