/**
 * Davar Theme System
 * Design tokens and theme utilities
 */

import { useColorScheme } from 'react-native';
import { create } from 'zustand';

// ===========================================
// DESIGN TOKENS
// ===========================================

export const colors = {
  // Primary - Deep Navy
  primary: {
    50: '#E8EDF3',
    100: '#D1DBE7',
    200: '#A3B7CF',
    300: '#7593B7',
    400: '#476F9F',
    500: '#1E3A5F',
    600: '#182E4C',
    700: '#122339',
    800: '#0C1726',
    900: '#060C13',
  },
  // Secondary - Gold
  secondary: {
    50: '#FCF8E8',
    100: '#F9F1D1',
    200: '#F3E3A3',
    300: '#EDD575',
    400: '#E7C747',
    500: '#C9A227',
    600: '#A1821F',
    700: '#796117',
    800: '#51410F',
    900: '#282008',
  },
  // Neutrals
  gray: {
    50: '#FAFAF8',
    100: '#F4F4F2',
    200: '#E8E8E6',
    300: '#D4D4D2',
    400: '#A3A3A1',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#2D2D2D',
    900: '#1A1A1A',
  },
  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  // Highlight colors
  highlight: {
    yellow: { light: '#FEF08A', dark: '#854D0E' },
    green: { light: '#BBF7D0', dark: '#166534' },
    blue: { light: '#BFDBFE', dark: '#1E40AF' },
    pink: { light: '#FBCFE8', dark: '#9D174D' },
    purple: { light: '#DDD6FE', dark: '#5B21B6' },
    orange: { light: '#FED7AA', dark: '#C2410C' },
  },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  // Scripture-specific sizes
  scripture: {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22,
    '2xl': 24,
  },
} as const;

export const lineHeights = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
  scripture: 1.8, // Extra comfortable for reading
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// ===========================================
// THEME DEFINITIONS
// ===========================================

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceSecondary: string;
  
  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  
  // Brand
  primary: string;
  primaryText: string;
  secondary: string;
  secondaryText: string;
  
  // Borders
  border: string;
  borderLight: string;
  
  // Status
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Specific UI
  verseNumber: string;
  cardBackground: string;
  inputBackground: string;
  inputBorder: string;
  placeholder: string;
  
  // Highlight colors
  highlightYellow: string;
  highlightGreen: string;
  highlightBlue: string;
  highlightPink: string;
  highlightPurple: string;
  highlightOrange: string;
}

export const lightTheme: ThemeColors = {
  // Backgrounds
  background: '#FAFAF8',
  surface: '#FFFFFF',
  surfaceSecondary: '#F4F4F2',
  
  // Text - HIGH CONTRAST for readability
  text: '#1A1A1A',           // Darker for better contrast (was #2D2D2D)
  textSecondary: '#3D3D3D',  // Good secondary contrast (was #525252)
  textMuted: '#5C5C5C',      // Readable muted (was #737373)
  textInverse: '#FFFFFF',
  
  // Brand
  primary: '#1E3A5F',
  primaryText: '#FFFFFF',
  secondary: '#C9A227',
  secondaryText: '#2D2D2D',
  
  // Borders
  border: '#E8E8E6',
  borderLight: '#F4F4F2',
  
  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Specific UI
  verseNumber: '#C9A227',
  cardBackground: '#FFFFFF',
  inputBackground: '#FFFFFF',
  inputBorder: '#E8E8E6',
  placeholder: '#A3A3A1',
  
  // Highlights
  highlightYellow: '#FEF08A',
  highlightGreen: '#BBF7D0',
  highlightBlue: '#BFDBFE',
  highlightPink: '#FBCFE8',
  highlightPurple: '#DDD6FE',
  highlightOrange: '#FED7AA',
};

export const darkTheme: ThemeColors = {
  // Backgrounds
  background: '#121212',
  surface: '#1E1E1E',
  surfaceSecondary: '#2A2A2A',
  
  // Text - HIGH CONTRAST for readability
  text: '#F5F5F5',           // Very light for maximum readability
  textSecondary: '#BDBDBD',  // Softer but still readable
  textMuted: '#9E9E9E',      // Muted but visible (was #737373 - too dark!)
  textInverse: '#121212',
  
  // Brand
  primary: '#5A8BC4',        // Slightly brighter for dark mode visibility
  primaryText: '#FFFFFF',
  secondary: '#E7C747',
  secondaryText: '#121212',
  
  // Borders
  border: '#3A3A3A',
  borderLight: '#4A4A4A',
  
  // Status
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',
  
  // Specific UI
  verseNumber: '#F0D861',    // Brighter gold for dark mode
  cardBackground: '#1E1E1E',
  inputBackground: '#2A2A2A',
  inputBorder: '#4A4A4A',
  placeholder: '#8A8A8A',
  
  // Highlights (darker for dark mode)
  highlightYellow: '#854D0E',
  highlightGreen: '#166534',
  highlightBlue: '#1E40AF',
  highlightPink: '#9D174D',
  highlightPurple: '#5B21B6',
  highlightOrange: '#C2410C',
};

// ===========================================
// THEME STORE
// ===========================================

interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  setMode: (mode: 'light' | 'dark' | 'system') => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'system',
  setMode: (mode) => set({ mode }),
}));

// ===========================================
// THEME HOOK
// ===========================================

export function useTheme(): { theme: ThemeColors; isDark: boolean; mode: 'light' | 'dark' | 'system' } {
  const systemColorScheme = useColorScheme();
  const { mode } = useThemeStore();
  
  let isDark: boolean;
  if (mode === 'system') {
    isDark = systemColorScheme === 'dark';
  } else {
    isDark = mode === 'dark';
  }
  
  return {
    theme: isDark ? darkTheme : lightTheme,
    isDark,
    mode,
  };
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

export function getHighlightColor(
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange',
  isDark: boolean
): string {
  const colorMap = {
    yellow: isDark ? darkTheme.highlightYellow : lightTheme.highlightYellow,
    green: isDark ? darkTheme.highlightGreen : lightTheme.highlightGreen,
    blue: isDark ? darkTheme.highlightBlue : lightTheme.highlightBlue,
    pink: isDark ? darkTheme.highlightPink : lightTheme.highlightPink,
    purple: isDark ? darkTheme.highlightPurple : lightTheme.highlightPurple,
    orange: isDark ? darkTheme.highlightOrange : lightTheme.highlightOrange,
  };
  return colorMap[color];
}

export function getContrastText(backgroundColor: string): string {
  // Simple contrast calculation
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#2D2D2D' : '#FFFFFF';
}
