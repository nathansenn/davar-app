/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.tsx',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Davar Design System
        primary: {
          DEFAULT: '#1E3A5F',
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
        secondary: {
          DEFAULT: '#C9A227',
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
        background: {
          DEFAULT: '#FAFAF8',
          dark: '#1A1A1A',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#2D2D2D',
        },
        text: {
          DEFAULT: '#2D2D2D',
          muted: '#6B7280',
          dark: '#E8E8E8',
          'dark-muted': '#9CA3AF',
        },
        // Highlight colors for verses
        highlight: {
          yellow: '#FEF08A',
          green: '#BBF7D0',
          blue: '#BFDBFE',
          pink: '#FBCFE8',
          purple: '#DDD6FE',
          // Dark mode variants
          'yellow-dark': '#854D0E',
          'green-dark': '#166534',
          'blue-dark': '#1E40AF',
          'pink-dark': '#9D174D',
          'purple-dark': '#5B21B6',
        },
      },
      fontFamily: {
        // Serif for Scripture text
        serif: ['Literata', 'Georgia', 'Times New Roman', 'serif'],
        // Sans for UI
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'scripture-xs': '14px',
        'scripture-sm': '16px',
        'scripture-md': '18px',
        'scripture-lg': '20px',
        'scripture-xl': '22px',
        'scripture-2xl': '24px',
      },
      spacing: {
        'safe-top': 'var(--safe-area-inset-top)',
        'safe-bottom': 'var(--safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
