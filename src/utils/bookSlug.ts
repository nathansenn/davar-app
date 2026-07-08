/**
 * Canonical mapping between book IDs (e.g. "GEN"), URL slugs (e.g. "genesis"),
 * and testament. Single source of truth shared by the Read tab and the passage
 * reader so navigation stays consistent.
 */

export const BOOK_ID_TO_SLUG: Record<string, string> = {
  GEN: 'genesis', EXO: 'exodus', LEV: 'leviticus', NUM: 'numbers', DEU: 'deuteronomy',
  JOS: 'joshua', JDG: 'judges', RUT: 'ruth', '1SA': '1-samuel', '2SA': '2-samuel',
  '1KI': '1-kings', '2KI': '2-kings', '1CH': '1-chronicles', '2CH': '2-chronicles',
  EZR: 'ezra', NEH: 'nehemiah', EST: 'esther', JOB: 'job', PSA: 'psalm',
  PRO: 'proverbs', ECC: 'ecclesiastes', SNG: 'song-of-solomon', ISA: 'isaiah',
  JER: 'jeremiah', LAM: 'lamentations', EZK: 'ezekiel', DAN: 'daniel', HOS: 'hosea',
  JOL: 'joel', AMO: 'amos', OBA: 'obadiah', JON: 'jonah', MIC: 'micah', NAM: 'nahum',
  HAB: 'habakkuk', ZEP: 'zephaniah', HAG: 'haggai', ZEC: 'zechariah', MAL: 'malachi',
  MAT: 'matthew', MRK: 'mark', LUK: 'luke', JHN: 'john', ACT: 'acts', ROM: 'romans',
  '1CO': '1-corinthians', '2CO': '2-corinthians', GAL: 'galatians', EPH: 'ephesians',
  PHP: 'philippians', COL: 'colossians', '1TH': '1-thessalonians', '2TH': '2-thessalonians',
  '1TI': '1-timothy', '2TI': '2-timothy', TIT: 'titus', PHM: 'philemon', HEB: 'hebrews',
  JAS: 'james', '1PE': '1-peter', '2PE': '2-peter', '1JN': '1-john', '2JN': '2-john',
  '3JN': '3-john', JUD: 'jude', REV: 'revelation',
};

export const SLUG_TO_BOOK_ID: Record<string, string> = {
  ...Object.fromEntries(Object.entries(BOOK_ID_TO_SLUG).map(([id, slug]) => [slug, id])),
  // Common alternate slugs
  psalms: 'PSA',
};

// Book IDs belonging to the New Testament (canonical). Everything else is OT.
const NT_BOOK_IDS = new Set([
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP',
  'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE',
  '1JN', '2JN', '3JN', 'JUD', 'REV',
]);

export function bookIdToSlug(bookId: string): string {
  return BOOK_ID_TO_SLUG[bookId] || bookId.toLowerCase();
}

export function slugToBookId(slug: string): string | undefined {
  return SLUG_TO_BOOK_ID[slug.toLowerCase()];
}

export function getTestament(bookId: string): 'OT' | 'NT' {
  return NT_BOOK_IDS.has(bookId) ? 'NT' : 'OT';
}
