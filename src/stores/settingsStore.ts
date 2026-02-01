/**
 * Settings Store
 * App preferences with AsyncStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Theme, DisplayMode, Translation } from '../types/ui';

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
  defaultTranslation: Translation;
  secondaryTranslation: Translation | null; // For interlinear/parallel
  showVerseNumbers: boolean;
  showCrossReferences: boolean;
  
  // Display mode
  displayMode: DisplayMode;
  
  // Formatting
  poetryFormatting: boolean;
  showRedLetter: boolean;
  lineSpacing: 'compact' | 'normal' | 'relaxed';
  
  // Original language options
  showOriginalLanguage: boolean;
  originalLanguagePosition: 'above' | 'below' | 'inline';
  showTransliteration: boolean;
  
  // Actions
  setTheme: (theme: Theme) => void;
  setFontSize: (size: FontSize) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setDailyReminderTime: (time: string | null) => void;
  setDefaultTranslation: (translation: Translation) => void;
  setSecondaryTranslation: (translation: Translation | null) => void;
  setShowVerseNumbers: (show: boolean) => void;
  setShowCrossReferences: (show: boolean) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setPoetryFormatting: (enabled: boolean) => void;
  setShowRedLetter: (show: boolean) => void;
  setLineSpacing: (spacing: 'compact' | 'normal' | 'relaxed') => void;
  setShowOriginalLanguage: (show: boolean) => void;
  setOriginalLanguagePosition: (position: 'above' | 'below' | 'inline') => void;
  setShowTransliteration: (show: boolean) => void;
  reset: () => void;
}

const fontSizeMap: Record<FontSize, number> = {
  small: 14,
  medium: 18,
  large: 20,
  xlarge: 24,
};

const initialState = {
  // Appearance
  theme: 'system' as Theme,
  fontSize: 'medium' as FontSize,
  fontSizeValue: 18,
  
  // Notifications
  notificationsEnabled: true,
  dailyReminderTime: '08:00',
  
  // Reading preferences
  defaultTranslation: 'KJV' as Translation,
  secondaryTranslation: null as Translation | null,
  showVerseNumbers: true,
  showCrossReferences: false,
  
  // Display mode
  displayMode: 'verse' as DisplayMode,
  
  // Formatting
  poetryFormatting: true,
  showRedLetter: false,
  lineSpacing: 'normal' as 'compact' | 'normal' | 'relaxed',
  
  // Original language options
  showOriginalLanguage: false,
  originalLanguagePosition: 'above' as 'above' | 'below' | 'inline',
  showTransliteration: true,
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

      setSecondaryTranslation: (secondaryTranslation) => {
        set({ secondaryTranslation });
      },

      setShowVerseNumbers: (showVerseNumbers) => {
        set({ showVerseNumbers });
      },

      setShowCrossReferences: (showCrossReferences) => {
        set({ showCrossReferences });
      },

      setDisplayMode: (displayMode) => {
        set({ displayMode });
      },

      setPoetryFormatting: (poetryFormatting) => {
        set({ poetryFormatting });
      },

      setShowRedLetter: (showRedLetter) => {
        set({ showRedLetter });
      },

      setLineSpacing: (lineSpacing) => {
        set({ lineSpacing });
      },

      setShowOriginalLanguage: (showOriginalLanguage) => {
        set({ showOriginalLanguage });
      },

      setOriginalLanguagePosition: (originalLanguagePosition) => {
        set({ originalLanguagePosition });
      },

      setShowTransliteration: (showTransliteration) => {
        set({ showTransliteration });
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

// Line height multipliers
export const LINE_SPACING_VALUES = {
  compact: 1.4,
  normal: 1.7,
  relaxed: 2.0,
};
