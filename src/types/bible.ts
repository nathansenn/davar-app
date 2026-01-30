/**
 * Bible data types for Davar app
 */

export interface Verse {
  number: number;
  text: string;
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
  books: Book[];
}

export interface BookMetadata {
  id: string;
  name: string;
  chapters: number;
  verses: number[]; // verse count per chapter
}

export interface BibleMetadata {
  books: BookMetadata[];
}

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

export type TranslationCode = 'KJV' | 'ASV' | 'BBE';

export interface TranslationInfo {
  code: TranslationCode;
  name: string;
  description: string;
}
