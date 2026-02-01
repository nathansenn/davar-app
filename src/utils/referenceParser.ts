/**
 * Bible Reference Parser
 * Parses human-readable references like "John 3:16" or "1 Corinthians 13:4-7"
 * into structured data for navigation
 */

export interface ParsedReference {
  bookName: string;
  bookSlug: string;
  chapter: number;
  verseStart?: number;
  verseEnd?: number;
}

// Book name variations mapped to URL slugs
const BOOK_ALIASES: Record<string, string> = {
  // Old Testament
  'genesis': 'genesis', 'gen': 'genesis', 'ge': 'genesis',
  'exodus': 'exodus', 'exod': 'exodus', 'exo': 'exodus', 'ex': 'exodus',
  'leviticus': 'leviticus', 'lev': 'leviticus', 'le': 'leviticus',
  'numbers': 'numbers', 'num': 'numbers', 'nu': 'numbers',
  'deuteronomy': 'deuteronomy', 'deut': 'deuteronomy', 'deu': 'deuteronomy', 'de': 'deuteronomy',
  'joshua': 'joshua', 'josh': 'joshua', 'jos': 'joshua',
  'judges': 'judges', 'judg': 'judges', 'jdg': 'judges',
  'ruth': 'ruth', 'rut': 'ruth', 'ru': 'ruth',
  '1 samuel': '1-samuel', '1samuel': '1-samuel', '1sam': '1-samuel', '1sa': '1-samuel',
  '2 samuel': '2-samuel', '2samuel': '2-samuel', '2sam': '2-samuel', '2sa': '2-samuel',
  '1 kings': '1-kings', '1kings': '1-kings', '1ki': '1-kings', '1kgs': '1-kings',
  '2 kings': '2-kings', '2kings': '2-kings', '2ki': '2-kings', '2kgs': '2-kings',
  '1 chronicles': '1-chronicles', '1chronicles': '1-chronicles', '1chr': '1-chronicles', '1ch': '1-chronicles',
  '2 chronicles': '2-chronicles', '2chronicles': '2-chronicles', '2chr': '2-chronicles', '2ch': '2-chronicles',
  'ezra': 'ezra', 'ezr': 'ezra',
  'nehemiah': 'nehemiah', 'neh': 'nehemiah', 'ne': 'nehemiah',
  'esther': 'esther', 'esth': 'esther', 'est': 'esther',
  'job': 'job',
  'psalms': 'psalm', 'psalm': 'psalm', 'psa': 'psalm', 'ps': 'psalm',
  'proverbs': 'proverbs', 'prov': 'proverbs', 'pro': 'proverbs', 'pr': 'proverbs',
  'ecclesiastes': 'ecclesiastes', 'eccl': 'ecclesiastes', 'ecc': 'ecclesiastes', 'ec': 'ecclesiastes',
  'song of solomon': 'song-of-solomon', 'song of songs': 'song-of-solomon', 'songofsolomon': 'song-of-solomon',
  'songs': 'song-of-solomon', 'sos': 'song-of-solomon', 'sng': 'song-of-solomon', 'ss': 'song-of-solomon',
  'isaiah': 'isaiah', 'isa': 'isaiah', 'is': 'isaiah',
  'jeremiah': 'jeremiah', 'jer': 'jeremiah', 'je': 'jeremiah',
  'lamentations': 'lamentations', 'lam': 'lamentations', 'la': 'lamentations',
  'ezekiel': 'ezekiel', 'ezek': 'ezekiel', 'eze': 'ezekiel',
  'daniel': 'daniel', 'dan': 'daniel', 'da': 'daniel',
  'hosea': 'hosea', 'hos': 'hosea', 'ho': 'hosea',
  'joel': 'joel', 'joe': 'joel',
  'amos': 'amos', 'amo': 'amos', 'am': 'amos',
  'obadiah': 'obadiah', 'obad': 'obadiah', 'oba': 'obadiah', 'ob': 'obadiah',
  'jonah': 'jonah', 'jon': 'jonah',
  'micah': 'micah', 'mic': 'micah',
  'nahum': 'nahum', 'nah': 'nahum', 'na': 'nahum',
  'habakkuk': 'habakkuk', 'hab': 'habakkuk',
  'zephaniah': 'zephaniah', 'zeph': 'zephaniah', 'zep': 'zephaniah',
  'haggai': 'haggai', 'hag': 'haggai',
  'zechariah': 'zechariah', 'zech': 'zechariah', 'zec': 'zechariah',
  'malachi': 'malachi', 'mal': 'malachi',
  
  // New Testament
  'matthew': 'matthew', 'matt': 'matthew', 'mat': 'matthew', 'mt': 'matthew',
  'mark': 'mark', 'mrk': 'mark', 'mk': 'mark',
  'luke': 'luke', 'luk': 'luke', 'lk': 'luke',
  'john': 'john', 'jhn': 'john', 'jn': 'john',
  'acts': 'acts', 'act': 'acts',
  'romans': 'romans', 'rom': 'romans', 'ro': 'romans',
  '1 corinthians': '1-corinthians', '1corinthians': '1-corinthians', '1cor': '1-corinthians', '1co': '1-corinthians',
  '2 corinthians': '2-corinthians', '2corinthians': '2-corinthians', '2cor': '2-corinthians', '2co': '2-corinthians',
  'galatians': 'galatians', 'gal': 'galatians', 'ga': 'galatians',
  'ephesians': 'ephesians', 'eph': 'ephesians',
  'philippians': 'philippians', 'phil': 'philippians', 'php': 'philippians',
  'colossians': 'colossians', 'col': 'colossians',
  '1 thessalonians': '1-thessalonians', '1thessalonians': '1-thessalonians', '1thess': '1-thessalonians', '1th': '1-thessalonians',
  '2 thessalonians': '2-thessalonians', '2thessalonians': '2-thessalonians', '2thess': '2-thessalonians', '2th': '2-thessalonians',
  '1 timothy': '1-timothy', '1timothy': '1-timothy', '1tim': '1-timothy', '1ti': '1-timothy',
  '2 timothy': '2-timothy', '2timothy': '2-timothy', '2tim': '2-timothy', '2ti': '2-timothy',
  'titus': 'titus', 'tit': 'titus',
  'philemon': 'philemon', 'phlm': 'philemon', 'phm': 'philemon',
  'hebrews': 'hebrews', 'heb': 'hebrews',
  'james': 'james', 'jas': 'james', 'jm': 'james',
  '1 peter': '1-peter', '1peter': '1-peter', '1pet': '1-peter', '1pe': '1-peter', '1pt': '1-peter',
  '2 peter': '2-peter', '2peter': '2-peter', '2pet': '2-peter', '2pe': '2-peter', '2pt': '2-peter',
  '1 john': '1-john', '1john': '1-john', '1jn': '1-john', '1jo': '1-john',
  '2 john': '2-john', '2john': '2-john', '2jn': '2-john', '2jo': '2-john',
  '3 john': '3-john', '3john': '3-john', '3jn': '3-john', '3jo': '3-john',
  'jude': 'jude', 'jud': 'jude',
  'revelation': 'revelation', 'rev': 'revelation', 're': 'revelation',
  'apocalypse': 'revelation',
};

// Display names for slugs
const SLUG_TO_NAME: Record<string, string> = {
  'genesis': 'Genesis', 'exodus': 'Exodus', 'leviticus': 'Leviticus',
  'numbers': 'Numbers', 'deuteronomy': 'Deuteronomy', 'joshua': 'Joshua',
  'judges': 'Judges', 'ruth': 'Ruth', '1-samuel': '1 Samuel', '2-samuel': '2 Samuel',
  '1-kings': '1 Kings', '2-kings': '2 Kings', '1-chronicles': '1 Chronicles',
  '2-chronicles': '2 Chronicles', 'ezra': 'Ezra', 'nehemiah': 'Nehemiah',
  'esther': 'Esther', 'job': 'Job', 'psalm': 'Psalms', 'proverbs': 'Proverbs',
  'ecclesiastes': 'Ecclesiastes', 'song-of-solomon': 'Song of Solomon',
  'isaiah': 'Isaiah', 'jeremiah': 'Jeremiah', 'lamentations': 'Lamentations',
  'ezekiel': 'Ezekiel', 'daniel': 'Daniel', 'hosea': 'Hosea', 'joel': 'Joel',
  'amos': 'Amos', 'obadiah': 'Obadiah', 'jonah': 'Jonah', 'micah': 'Micah',
  'nahum': 'Nahum', 'habakkuk': 'Habakkuk', 'zephaniah': 'Zephaniah',
  'haggai': 'Haggai', 'zechariah': 'Zechariah', 'malachi': 'Malachi',
  'matthew': 'Matthew', 'mark': 'Mark', 'luke': 'Luke', 'john': 'John',
  'acts': 'Acts', 'romans': 'Romans', '1-corinthians': '1 Corinthians',
  '2-corinthians': '2 Corinthians', 'galatians': 'Galatians', 'ephesians': 'Ephesians',
  'philippians': 'Philippians', 'colossians': 'Colossians',
  '1-thessalonians': '1 Thessalonians', '2-thessalonians': '2 Thessalonians',
  '1-timothy': '1 Timothy', '2-timothy': '2 Timothy', 'titus': 'Titus',
  'philemon': 'Philemon', 'hebrews': 'Hebrews', 'james': 'James',
  '1-peter': '1 Peter', '2-peter': '2 Peter', '1-john': '1 John',
  '2-john': '2 John', '3-john': '3 John', 'jude': 'Jude', 'revelation': 'Revelation',
};

/**
 * Parse a human-readable reference like "John 3:16" into structured data
 * Handles formats:
 * - "John 3" (whole chapter)
 * - "John 3:16" (single verse)
 * - "John 3:16-18" (verse range)
 * - "1 Cor 13:4" (abbreviated book names)
 * - "Ps 23" (abbreviated)
 */
export function parseReference(reference: string): ParsedReference | null {
  if (!reference || typeof reference !== 'string') return null;
  
  // Clean up the reference
  const clean = reference.trim();
  
  // Try to match patterns
  // Pattern: [BookName] [Chapter]:[Verse(s)]
  // The book name may have numbers (1 John, 2 Kings, etc.)
  
  // First, try to separate book name from chapter:verse
  // Look for the pattern where we have text followed by numbers
  
  // Handle numbered books: "1 John 3:16", "2 Kings 5:1"
  const numberedBookMatch = clean.match(/^(\d)\s*([a-zA-Z]+)\s+(\d+)(?::(\d+)(?:-(\d+))?)?$/i);
  if (numberedBookMatch) {
    const [, bookNum, bookName, chapter, verseStart, verseEnd] = numberedBookMatch;
    const fullBookName = `${bookNum} ${bookName.toLowerCase()}`;
    const slug = BOOK_ALIASES[fullBookName] || BOOK_ALIASES[`${bookNum}${bookName.toLowerCase()}`];
    
    if (slug) {
      return {
        bookName: SLUG_TO_NAME[slug] || fullBookName,
        bookSlug: slug,
        chapter: parseInt(chapter, 10),
        verseStart: verseStart ? parseInt(verseStart, 10) : undefined,
        verseEnd: verseEnd ? parseInt(verseEnd, 10) : undefined,
      };
    }
  }
  
  // Handle regular books: "John 3:16", "Genesis 1"
  const regularMatch = clean.match(/^([a-zA-Z\s]+?)\s*(\d+)(?::(\d+)(?:-(\d+))?)?$/i);
  if (regularMatch) {
    const [, bookName, chapter, verseStart, verseEnd] = regularMatch;
    const cleanBookName = bookName.trim().toLowerCase();
    const slug = BOOK_ALIASES[cleanBookName];
    
    if (slug) {
      return {
        bookName: SLUG_TO_NAME[slug] || bookName.trim(),
        bookSlug: slug,
        chapter: parseInt(chapter, 10),
        verseStart: verseStart ? parseInt(verseStart, 10) : undefined,
        verseEnd: verseEnd ? parseInt(verseEnd, 10) : undefined,
      };
    }
  }
  
  // Try abbreviated forms without space: "Jn3:16", "Gen1:1"
  const abbrevMatch = clean.match(/^([a-zA-Z]+)(\d+)(?::(\d+)(?:-(\d+))?)?$/i);
  if (abbrevMatch) {
    const [, bookName, chapter, verseStart, verseEnd] = abbrevMatch;
    const slug = BOOK_ALIASES[bookName.toLowerCase()];
    
    if (slug) {
      return {
        bookName: SLUG_TO_NAME[slug] || bookName,
        bookSlug: slug,
        chapter: parseInt(chapter, 10),
        verseStart: verseStart ? parseInt(verseStart, 10) : undefined,
        verseEnd: verseEnd ? parseInt(verseEnd, 10) : undefined,
      };
    }
  }
  
  return null;
}

/**
 * Convert a parsed reference to a URL path
 */
export function referenceToPath(ref: ParsedReference): string {
  let path = `/read/${ref.bookSlug}-${ref.chapter}`;
  if (ref.verseStart) {
    path += `?verse=${ref.verseStart}`;
    if (ref.verseEnd && ref.verseEnd !== ref.verseStart) {
      path += `-${ref.verseEnd}`;
    }
  }
  return path;
}

/**
 * Format a reference for display
 */
export function formatReference(ref: ParsedReference): string {
  let formatted = `${ref.bookName} ${ref.chapter}`;
  if (ref.verseStart) {
    formatted += `:${ref.verseStart}`;
    if (ref.verseEnd && ref.verseEnd !== ref.verseStart) {
      formatted += `-${ref.verseEnd}`;
    }
  }
  return formatted;
}

export default {
  parseReference,
  referenceToPath,
  formatReference,
  BOOK_ALIASES,
  SLUG_TO_NAME,
};
