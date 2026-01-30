import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark' | 'system';
type FontSize = 'small' | 'medium' | 'large' | 'xlarge';

interface SettingsState {
  // Appearance
  theme: Theme;
  fontSize: FontSize;
  fontSizeValue: number;
  
  // Notifications
  notificationsEnabled: boolean;
  dailyReminderTime: string | null; // "HH:MM" format
  
  // Reading preferences
  defaultTranslation: string;
  showVerseNumbers: boolean;
  showCrossReferences: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDailyReminderTime: (time: string | null) => void;
  setDefaultTranslation: (translation: string) => void;
  setShowVerseNumbers: (show: boolean) => void;
  setShowCrossReferences: (show: boolean) => void;
  reset: () => void;
}

const fontSizeMap: Record<FontSize, number> = {
  small: 14,
  medium: 16,
  large: 18,
  xlarge: 22,
};

const initialState = {
  theme: 'system' as Theme,
  fontSize: 'medium' as FontSize,
  fontSizeValue: 16,
  notificationsEnabled: true,
  dailyReminderTime: '08:00',
  defaultTranslation: 'WEB',
  showVerseNumbers: true,
  showCrossReferences: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,

      setTheme: (theme) => {
        set({ theme });
      },

      setFontSize: (fontSize) => {
        set({ 
          fontSize, 
          fontSizeValue: fontSizeMap[fontSize],
        });
      },

      setNotificationsEnabled: (notificationsEnabled) => {
        set({ notificationsEnabled });
      },

      setDailyReminderTime: (dailyReminderTime) => {
        set({ dailyReminderTime });
      },

      setDefaultTranslation: (defaultTranslation) => {
        set({ defaultTranslation });
      },

      setShowVerseNumbers: (showVerseNumbers) => {
        set({ showVerseNumbers });
      },

      setShowCrossReferences: (showCrossReferences) => {
        set({ showCrossReferences });
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'davar-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
