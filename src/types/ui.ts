/**
 * UI Types for Davar App
 * Design system types and component interfaces
 */

// ===========================================
// HIGHLIGHT COLORS
// ===========================================

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple';

export const HIGHLIGHT_COLORS: Record<HighlightColor, { light: string; dark: string; label: string }> = {
  yellow: { light: '#FEF08A', dark: '#854D0E', label: 'Yellow' },
  green: { light: '#BBF7D0', dark: '#166534', label: 'Green' },
  blue: { light: '#BFDBFE', dark: '#1E40AF', label: 'Blue' },
  pink: { light: '#FBCFE8', dark: '#9D174D', label: 'Pink' },
  purple: { light: '#DDD6FE', dark: '#5B21B6', label: 'Purple' },
};

// ===========================================
// FONT SIZES
// ===========================================

export type FontSize = 14 | 16 | 18 | 20 | 22 | 24;

export const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: 14, label: 'XS' },
  { value: 16, label: 'S' },
  { value: 18, label: 'M' },
  { value: 20, label: 'L' },
  { value: 22, label: 'XL' },
  { value: 24, label: '2XL' },
];

// ===========================================
// THEME
// ===========================================

export type Theme = 'light' | 'dark' | 'system';

// ===========================================
// TRANSLATION
// ===========================================

export type Translation = 'KJV' | 'WEB' | 'ASV';

export interface TranslationDetails {
  id: Translation;
  name: string;
  fullName: string;
  description: string;
  language: string;
  year: number;
  copyright: string;
}

export const TRANSLATIONS: Record<Translation, TranslationDetails> = {
  KJV: {
    id: 'KJV',
    name: 'KJV',
    fullName: 'King James Version',
    description: 'The classic 1611 translation',
    language: 'en',
    year: 1611,
    copyright: 'Public Domain',
  },
  WEB: {
    id: 'WEB',
    name: 'WEB',
    fullName: 'World English Bible',
    description: 'Modern English, public domain',
    language: 'en',
    year: 2000,
    copyright: 'Public Domain',
  },
  ASV: {
    id: 'ASV',
    name: 'ASV',
    fullName: 'American Standard Version',
    description: 'Literal translation from 1901',
    language: 'en',
    year: 1901,
    copyright: 'Public Domain',
  },
};

// ===========================================
// STRONGS REFERENCE
// ===========================================

export interface StrongsReference {
  id: string; // e.g., "H1234" or "G5678"
  lemma: string; // Original word
  transliteration: string;
  pronunciation: string;
  definition: string;
  shortDefinition: string;
  language: 'hebrew' | 'greek';
}

// ===========================================
// EXTENDED VERSE (for component use)
// ===========================================

export interface ExtendedVerse {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: Translation;
  words?: ExtendedWord[];
}

export interface ExtendedWord {
  text: string;
  position: number;
  strongs?: StrongsReference;
}

// ===========================================
// EXTENDED CHAPTER (for component use)
// ===========================================

export interface ExtendedChapter {
  book: string;
  chapter: number;
  verses: ExtendedVerse[];
  translation: Translation;
}
