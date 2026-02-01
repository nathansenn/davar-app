/**
 * UI Types for Davar App
 * Design system types and component interfaces
 */

import type { TranslationCode, DisplayMode, TaggedWord } from './bible';

// ===========================================
// HIGHLIGHT COLORS
// ===========================================

export type HighlightColor = 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange';

export const HIGHLIGHT_COLORS: Record<HighlightColor, { light: string; dark: string; label: string }> = {
  yellow: { light: '#FEF08A', dark: '#854D0E', label: 'Yellow' },
  green: { light: '#BBF7D0', dark: '#166534', label: 'Green' },
  blue: { light: '#BFDBFE', dark: '#1E40AF', label: 'Blue' },
  pink: { light: '#FBCFE8', dark: '#9D174D', label: 'Pink' },
  purple: { light: '#DDD6FE', dark: '#5B21B6', label: 'Purple' },
  orange: { light: '#FED7AA', dark: '#C2410C', label: 'Orange' },
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

export type Translation = TranslationCode;

export interface TranslationDetails {
  id: Translation;
  name: string;
  fullName: string;
  description: string;
  language: 'en' | 'he' | 'grc';
  year: number;
  copyright: string;
  hasStrongs?: boolean;
  isOriginalLanguage?: boolean;
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
  ASV: {
    id: 'ASV',
    name: 'ASV',
    fullName: 'American Standard Version',
    description: 'Literal translation from 1901',
    language: 'en',
    year: 1901,
    copyright: 'Public Domain',
  },
  BBE: {
    id: 'BBE',
    name: 'BBE',
    fullName: 'Bible in Basic English',
    description: 'Simple English vocabulary',
    language: 'en',
    year: 1949,
    copyright: 'Public Domain',
  },
  BSB: {
    id: 'BSB',
    name: 'BSB',
    fullName: 'Berean Standard Bible',
    description: 'Modern translation with Strong\'s',
    language: 'en',
    year: 2016,
    copyright: 'Public Domain',
    hasStrongs: true,
  },
  WLC: {
    id: 'WLC',
    name: 'WLC',
    fullName: 'Westminster Leningrad Codex',
    description: 'Hebrew Old Testament',
    language: 'he',
    year: 2008,
    copyright: 'Public Domain',
    isOriginalLanguage: true,
  },
  TR: {
    id: 'TR',
    name: 'TR',
    fullName: 'Textus Receptus',
    description: 'Greek New Testament',
    language: 'grc',
    year: 1550,
    copyright: 'Public Domain',
    isOriginalLanguage: true,
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
  derivation?: string;
  kjvUsage?: string;
  language: 'hebrew' | 'greek';
}

// ===========================================
// USER DATA (Bookmarks, Highlights, Notes)
// ===========================================

export interface Bookmark {
  id: string;
  reference: string;  // "JHN 3:16"
  bookId: string;
  chapter: number;
  verse: number;
  createdAt: number;
  label?: string;
}

export interface Highlight {
  id: string;
  reference: string;  // "JHN 3:16"
  bookId: string;
  chapter: number;
  verse: number;
  color: HighlightColor;
  createdAt: number;
}

export interface Note {
  id: string;
  reference: string;  // "JHN 3:16"
  bookId: string;
  chapter: number;
  verse: number;
  content: string;
  createdAt: number;
  updatedAt: number;
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
  words?: TaggedWord[];
  isRedLetter?: boolean;
  isParagraphStart?: boolean;
  isPoetry?: boolean;
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
  bookId: string;
  chapter: number;
  verses: ExtendedVerse[];
  translation: Translation;
}

// ===========================================
// DISPLAY MODE OPTIONS
// ===========================================

export type { DisplayMode };

export const DISPLAY_MODES: { value: DisplayMode; label: string; icon: string }[] = [
  { value: 'verse', label: 'Verse by Verse', icon: '📋' },
  { value: 'paragraph', label: 'Paragraph', icon: '📄' },
  { value: 'interlinear', label: 'Interlinear', icon: '📑' },
];
