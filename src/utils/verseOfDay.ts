/**
 * Verse of the Day — deterministic rotation over a curated list of references,
 * with the text pulled from the bundled Bible so it stays real and offline.
 */

import { bibleService } from '../services/bibleService';
import type { TranslationCode } from '../types/bible';

interface VotdRef {
  bookId: string;
  chapter: number;
  verse: number;
  reference: string;
}

const CURATED: VotdRef[] = [
  { bookId: 'PSA', chapter: 23, verse: 1, reference: 'Psalm 23:1' },
  { bookId: 'JHN', chapter: 3, verse: 16, reference: 'John 3:16' },
  { bookId: 'PRO', chapter: 3, verse: 5, reference: 'Proverbs 3:5' },
  { bookId: 'ISA', chapter: 41, verse: 10, reference: 'Isaiah 41:10' },
  { bookId: 'PHP', chapter: 4, verse: 13, reference: 'Philippians 4:13' },
  { bookId: 'ROM', chapter: 8, verse: 28, reference: 'Romans 8:28' },
  { bookId: 'JOS', chapter: 1, verse: 9, reference: 'Joshua 1:9' },
  { bookId: 'PSA', chapter: 46, verse: 1, reference: 'Psalm 46:1' },
  { bookId: 'MAT', chapter: 6, verse: 33, reference: 'Matthew 6:33' },
  { bookId: 'JER', chapter: 29, verse: 11, reference: 'Jeremiah 29:11' },
  { bookId: 'PSA', chapter: 119, verse: 105, reference: 'Psalm 119:105' },
  { bookId: 'PRO', chapter: 16, verse: 3, reference: 'Proverbs 16:3' },
  { bookId: '2CO', chapter: 5, verse: 7, reference: '2 Corinthians 5:7' },
  { bookId: 'HEB', chapter: 11, verse: 1, reference: 'Hebrews 11:1' },
  { bookId: 'PSA', chapter: 27, verse: 1, reference: 'Psalm 27:1' },
  { bookId: 'ISA', chapter: 40, verse: 31, reference: 'Isaiah 40:31' },
  { bookId: 'MAT', chapter: 11, verse: 28, reference: 'Matthew 11:28' },
  { bookId: '1CO', chapter: 13, verse: 4, reference: '1 Corinthians 13:4' },
  { bookId: 'PSA', chapter: 121, verse: 1, reference: 'Psalm 121:1' },
  { bookId: 'ROM', chapter: 12, verse: 2, reference: 'Romans 12:2' },
  { bookId: 'GAL', chapter: 5, verse: 22, reference: 'Galatians 5:22' },
  { bookId: 'PSA', chapter: 37, verse: 4, reference: 'Psalm 37:4' },
  { bookId: 'PRO', chapter: 18, verse: 10, reference: 'Proverbs 18:10' },
  { bookId: 'JHN', chapter: 14, verse: 6, reference: 'John 14:6' },
  { bookId: 'PSA', chapter: 34, verse: 8, reference: 'Psalm 34:8' },
  { bookId: 'MAT', chapter: 5, verse: 16, reference: 'Matthew 5:16' },
  { bookId: 'ROM', chapter: 15, verse: 13, reference: 'Romans 15:13' },
  { bookId: 'PSA', chapter: 1, verse: 1, reference: 'Psalm 1:1' },
  { bookId: 'PHP', chapter: 4, verse: 6, reference: 'Philippians 4:6' },
  { bookId: '1PE', chapter: 5, verse: 7, reference: '1 Peter 5:7' },
  { bookId: 'PSA', chapter: 139, verse: 14, reference: 'Psalm 139:14' },
];

export interface VerseOfDay {
  reference: string;
  text: string;
}

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start;
  return Math.floor(diff / 86400000);
}

export function getVerseOfDay(
  date: Date = new Date(),
  translation: TranslationCode = 'KJV'
): VerseOfDay {
  const pick = CURATED[dayOfYear(date) % CURATED.length];
  const text = bibleService.getVerseText(pick.bookId, pick.chapter, pick.verse, translation);
  return {
    reference: pick.reference,
    text: text?.trim() || 'The Lord is my shepherd; I shall not want.',
  };
}
