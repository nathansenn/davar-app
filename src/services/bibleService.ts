/**
 * Bible Service for Davar app
 * Provides access to bundled Bible texts
 */

import {
  BibleData,
  Book,
  Chapter,
  Verse,
  BookMetadata,
  BibleMetadata,
  SearchResult,
  TranslationCode,
  TranslationInfo,
  VerseRef,
} from '../types/bible';

// Import bundled Bible data (using require for Metro bundler compatibility)
/* eslint-disable @typescript-eslint/no-var-requires */
const kjvData = require('../../assets/bibles/kjv.json') as BibleData;
const asvData = require('../../assets/bibles/asv.json') as BibleData;
const bbeData = require('../../assets/bibles/bbe.json') as BibleData;
const booksMetadata = require('../../assets/metadata/books.json') as BibleMetadata;
/* eslint-enable @typescript-eslint/no-var-requires */

// Type the imported data
const bibles: Record<TranslationCode, BibleData> = {
  KJV: kjvData,
  ASV: asvData,
  BBE: bbeData,
};

const metadata = booksMetadata;

// Translation info
const translations: Record<TranslationCode, TranslationInfo> = {
  KJV: {
    code: 'KJV',
    name: 'King James Version',
    description: 'The classic 1769 King James Version of the Bible',
  },
  ASV: {
    code: 'ASV',
    name: 'American Standard Version',
    description: 'The 1901 American Standard Version, known for its accuracy',
  },
  BBE: {
    code: 'BBE',
    name: 'Bible in Basic English',
    description: 'A translation using a limited vocabulary of 1000 words',
  },
};

class BibleService {
  private defaultTranslation: TranslationCode = 'KJV';

  /**
   * Get list of available translations
   */
  getTranslations(): TranslationInfo[] {
    return Object.values(translations);
  }

  /**
   * Get all books metadata
   */
  getBooks(): BookMetadata[] {
    return metadata.books;
  }

  /**
   * Get a specific book
   */
  getBook(bookId: string, translation: TranslationCode = this.defaultTranslation): Book | null {
    const bible = bibles[translation];
    if (!bible) return null;
    
    return bible.books.find(b => b.id === bookId) || null;
  }

  /**
   * Get a chapter from a book
   */
  getChapter(
    bookId: string,
    chapterNum: number,
    translation: TranslationCode = this.defaultTranslation
  ): Chapter | null {
    const book = this.getBook(bookId, translation);
    if (!book) return null;
    
    return book.chapters.find(c => c.number === chapterNum) || null;
  }

  /**
   * Get a specific verse
   */
  getVerse(
    bookId: string,
    chapterNum: number,
    verseNum: number,
    translation: TranslationCode = this.defaultTranslation
  ): Verse | null {
    const chapter = this.getChapter(bookId, chapterNum, translation);
    if (!chapter) return null;
    
    return chapter.verses.find(v => v.number === verseNum) || null;
  }

  /**
   * Get verse text only
   */
  getVerseText(
    bookId: string,
    chapterNum: number,
    verseNum: number,
    translation: TranslationCode = this.defaultTranslation
  ): string | null {
    const verse = this.getVerse(bookId, chapterNum, verseNum, translation);
    return verse?.text || null;
  }

  /**
   * Get a range of verses
   */
  getVerseRange(
    bookId: string,
    chapterNum: number,
    startVerse: number,
    endVerse: number,
    translation: TranslationCode = this.defaultTranslation
  ): Verse[] {
    const chapter = this.getChapter(bookId, chapterNum, translation);
    if (!chapter) return [];
    
    return chapter.verses.filter(
      v => v.number >= startVerse && v.number <= endVerse
    );
  }

  /**
   * Format a reference string
   */
  formatReference(bookId: string, chapter: number, verse?: number, endVerse?: number): string {
    const bookMeta = metadata.books.find(b => b.id === bookId);
    const bookName = bookMeta?.name || bookId;
    
    if (verse === undefined) {
      return `${bookName} ${chapter}`;
    }
    if (endVerse !== undefined && endVerse !== verse) {
      return `${bookName} ${chapter}:${verse}-${endVerse}`;
    }
    return `${bookName} ${chapter}:${verse}`;
  }

  /**
   * Parse a reference string (e.g., "John 3:16" or "Gen 1:1-5")
   */
  parseReference(reference: string): VerseRef | null {
    // Match patterns like "Genesis 1:1", "Gen 1:1", "1 John 3:16"
    const match = reference.match(/^(\d?\s?[A-Za-z]+)\s+(\d+)(?::(\d+))?/);
    if (!match) return null;

    const bookName = match[1].trim();
    const chapter = parseInt(match[2], 10);
    const verse = match[3] ? parseInt(match[3], 10) : 1;

    // Find book by name or abbreviation
    const book = this.findBook(bookName);
    if (!book) return null;

    return { bookId: book.id, chapter, verse };
  }

  /**
   * Find a book by name or partial name
   */
  findBook(name: string): BookMetadata | null {
    const normalized = name.toLowerCase().replace(/\s+/g, '');
    
    // Common abbreviations
    const abbrevMap: Record<string, string> = {
      'gen': 'GEN', 'ex': 'EXO', 'exod': 'EXO', 'lev': 'LEV', 'num': 'NUM',
      'deut': 'DEU', 'josh': 'JOS', 'judg': 'JDG', 'ruth': 'RUT',
      '1sam': '1SA', '2sam': '2SA', '1ki': '1KI', '2ki': '2KI',
      '1chr': '1CH', '2chr': '2CH', 'ezr': 'EZR', 'neh': 'NEH',
      'est': 'EST', 'job': 'JOB', 'ps': 'PSA', 'psa': 'PSA', 'psalm': 'PSA',
      'prov': 'PRO', 'eccl': 'ECC', 'song': 'SNG', 'sos': 'SNG',
      'isa': 'ISA', 'jer': 'JER', 'lam': 'LAM', 'ezek': 'EZK', 'eze': 'EZK',
      'dan': 'DAN', 'hos': 'HOS', 'joel': 'JOL', 'amos': 'AMO', 'obad': 'OBA',
      'jon': 'JON', 'mic': 'MIC', 'nah': 'NAM', 'hab': 'HAB', 'zeph': 'ZEP',
      'hag': 'HAG', 'zech': 'ZEC', 'mal': 'MAL',
      'matt': 'MAT', 'mat': 'MAT', 'mk': 'MRK', 'lk': 'LUK', 'jn': 'JHN', 'joh': 'JHN',
      'acts': 'ACT', 'rom': 'ROM',
      '1cor': '1CO', '2cor': '2CO', 'gal': 'GAL', 'eph': 'EPH',
      'phil': 'PHP', 'col': 'COL', '1thess': '1TH', '2thess': '2TH',
      '1tim': '1TI', '2tim': '2TI', 'tit': 'TIT', 'phm': 'PHM', 'phlm': 'PHM',
      'heb': 'HEB', 'jas': 'JAS', 'jam': 'JAS',
      '1pet': '1PE', '2pet': '2PE', '1jn': '1JN', '2jn': '2JN', '3jn': '3JN',
      'jude': 'JUD', 'rev': 'REV',
    };

    // Check abbreviation map
    const abbrevId = abbrevMap[normalized];
    if (abbrevId) {
      return metadata.books.find(b => b.id === abbrevId) || null;
    }

    // Check exact ID match
    const byId = metadata.books.find(b => b.id.toLowerCase() === normalized);
    if (byId) return byId;

    // Check partial name match
    return metadata.books.find(b => 
      b.name.toLowerCase().replace(/\s+/g, '').startsWith(normalized)
    ) || null;
  }

  /**
   * Search for text in the Bible
   */
  search(
    query: string,
    translation: TranslationCode = this.defaultTranslation,
    options?: { limit?: number; bookId?: string }
  ): SearchResult[] {
    const bible = bibles[translation];
    if (!bible) return [];

    const results: SearchResult[] = [];
    const limit = options?.limit || 100;
    const searchLower = query.toLowerCase();

    for (const book of bible.books) {
      if (options?.bookId && book.id !== options.bookId) continue;

      for (const chapter of book.chapters) {
        for (const verse of chapter.verses) {
          if (verse.text.toLowerCase().includes(searchLower)) {
            results.push({
              bookId: book.id,
              bookName: book.name,
              chapter: chapter.number,
              verse: verse.number,
              text: verse.text,
              reference: this.formatReference(book.id, chapter.number, verse.number),
            });

            if (results.length >= limit) {
              return results;
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Get book chapter count
   */
  getChapterCount(bookId: string): number {
    const bookMeta = metadata.books.find(b => b.id === bookId);
    return bookMeta?.chapters || 0;
  }

  /**
   * Get verse count for a chapter
   */
  getVerseCount(bookId: string, chapter: number): number {
    const bookMeta = metadata.books.find(b => b.id === bookId);
    if (!bookMeta || chapter < 1 || chapter > bookMeta.verses.length) return 0;
    return bookMeta.verses[chapter - 1];
  }

  /**
   * Get total verse count
   */
  getTotalVerseCount(): number {
    return metadata.books.reduce(
      (total, book) => total + book.verses.reduce((sum, v) => sum + v, 0),
      0
    );
  }

  /**
   * Set default translation
   */
  setDefaultTranslation(code: TranslationCode): void {
    if (bibles[code]) {
      this.defaultTranslation = code;
    }
  }

  /**
   * Get default translation
   */
  getDefaultTranslation(): TranslationCode {
    return this.defaultTranslation;
  }
}

// Export singleton instance
export const bibleService = new BibleService();

// Export class for testing/custom instances
export { BibleService };
