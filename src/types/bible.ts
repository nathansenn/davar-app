/**
 * Bible data types for Davar app
 * Extended for Greek/Hebrew support and word studies
 */

// ===========================================
// CORE VERSE TYPES
// ===========================================

export interface Verse {
  number: number;
  text: string;
  // Optional word-level data for tagged texts
  words?: TaggedWord[];
}

export interface TaggedWord {
  text: string;           // Display text
  strongs?: string;       // Strong's number (H1234 or G5678)
  lemma?: string;         // Original Hebrew/Greek word
  morph?: string;         // Morphological code
  translit?: string;      // Transliteration
}

export interface Chapter {
  number: number;
  verses: Verse[];
}

export interface Book {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface BibleData {
  translation: string;
  name: string;
  language: 'en' | 'he' | 'grc';  // English, Hebrew, Greek
  books: Book[];
}

// ===========================================
// METADATA
// ===========================================

export interface BookMetadata {
  id: string;
  name: string;
  chapters: number;
  verses: number[]; // verse count per chapter
  testament: 'OT' | 'NT';
  category: 'law' | 'history' | 'poetry' | 'prophecy' | 'gospel' | 'epistle' | 'apocalypse';
}

export interface BibleMetadata {
  books: BookMetadata[];
}

// ===========================================
// SEARCH & REFERENCES
// ===========================================

export interface SearchResult {
  bookId: string;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
  reference: string;
}

export interface VerseRef {
  bookId: string;
  chapter: number;
  verse: number;
}

// ===========================================
// TRANSLATIONS
// ===========================================

export type TranslationCode = 'KJV' | 'ASV' | 'BBE' | 'WLC' | 'TR' | 'BSB';

export interface TranslationInfo {
  code: TranslationCode;
  name: string;
  description: string;
  language: 'en' | 'he' | 'grc';
  hasStrongs?: boolean;
  isOriginalLanguage?: boolean;
}

// ===========================================
// FORMATTING & DISPLAY
// ===========================================

export type DisplayMode = 'verse' | 'paragraph' | 'interlinear';

export interface FormattingOptions {
  displayMode: DisplayMode;
  showVerseNumbers: boolean;
  showRedLetter: boolean;  // Jesus' words in red
  poetryFormatting: boolean;
  fontSize: number;
}

// Poetry books for special formatting
export const POETRY_BOOKS = ['PSA', 'PRO', 'JOB', 'SNG', 'LAM', 'ECC'];

// Books containing Jesus' direct words (for red letter)
export const RED_LETTER_BOOKS = ['MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'REV'];

// ===========================================
// PARAGRAPH BREAKS (verse numbers where new paragraphs start)
// ===========================================

export interface ParagraphBreaks {
  [bookId: string]: {
    [chapter: number]: number[]; // verse numbers that start paragraphs
  };
}

// Default paragraph breaks for common narrative sections
export const DEFAULT_PARAGRAPH_BREAKS: ParagraphBreaks = {
  'GEN': {
    1: [1, 3, 6, 9, 11, 14, 20, 24, 26, 29],
    2: [1, 4, 8, 15, 18, 21, 24],
    3: [1, 6, 9, 14, 17, 20, 22],
  },
  'JHN': {
    1: [1, 6, 10, 14, 19, 29, 35, 43],
    3: [1, 9, 16, 22, 31],
  },
  // More can be added...
};
