#!/usr/bin/env node
/**
 * Convert scrollmapper Bible JSON to Davar format
 */

const fs = require('fs');
const path = require('path');

// Book ID mapping (with Roman numeral variations)
const BOOK_IDS = {
  'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM',
  'Deuteronomy': 'DEU', 'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT',
  '1 Samuel': '1SA', '2 Samuel': '2SA', 'I Samuel': '1SA', 'II Samuel': '2SA',
  '1 Kings': '1KI', '2 Kings': '2KI', 'I Kings': '1KI', 'II Kings': '2KI',
  '1 Chronicles': '1CH', '2 Chronicles': '2CH', 'I Chronicles': '1CH', 'II Chronicles': '2CH',
  'Ezra': 'EZR', 'Nehemiah': 'NEH', 'Esther': 'EST', 'Job': 'JOB',
  'Psalms': 'PSA', 'Psalm': 'PSA', 'Proverbs': 'PRO',
  'Ecclesiastes': 'ECC', 'Song of Solomon': 'SNG', 'Song of Songs': 'SNG',
  'Isaiah': 'ISA', 'Jeremiah': 'JER', 'Lamentations': 'LAM',
  'Ezekiel': 'EZK', 'Daniel': 'DAN', 'Hosea': 'HOS',
  'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON',
  'Micah': 'MIC', 'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP',
  'Haggai': 'HAG', 'Zechariah': 'ZEC', 'Malachi': 'MAL',
  'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN',
  'Acts': 'ACT', 'Romans': 'ROM',
  '1 Corinthians': '1CO', '2 Corinthians': '2CO', 'I Corinthians': '1CO', 'II Corinthians': '2CO',
  'Galatians': 'GAL', 'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL',
  '1 Thessalonians': '1TH', '2 Thessalonians': '2TH', 'I Thessalonians': '1TH', 'II Thessalonians': '2TH',
  '1 Timothy': '1TI', '2 Timothy': '2TI', 'I Timothy': '1TI', 'II Timothy': '2TI',
  'Titus': 'TIT', 'Philemon': 'PHM', 'Hebrews': 'HEB', 'James': 'JAS',
  '1 Peter': '1PE', '2 Peter': '2PE', 'I Peter': '1PE', 'II Peter': '2PE',
  '1 John': '1JN', '2 John': '2JN', '3 John': '3JN',
  'I John': '1JN', 'II John': '2JN', 'III John': '3JN',
  'Jude': 'JUD', 'Revelation': 'REV', 'Revelation of John': 'REV'
};

const TRANSLATION_INFO = {
  'KJV': { code: 'KJV', name: 'King James Version' },
  'ASV': { code: 'ASV', name: 'American Standard Version' },
  'BBE': { code: 'BBE', name: 'Bible in Basic English' },
  'WEB': { code: 'WEB', name: 'World English Bible' }
};

function convertBible(inputPath, outputPath, translationCode) {
  console.log(`Converting ${translationCode}...`);
  
  const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const info = TRANSLATION_INFO[translationCode] || { code: translationCode, name: translationCode };
  
  const converted = {
    translation: info.code,
    name: info.name,
    books: []
  };
  
  let totalVerses = 0;
  let totalChapters = 0;
  
  for (const book of rawData.books) {
    const bookId = BOOK_IDS[book.name];
    if (!bookId) {
      console.warn(`  Unknown book: ${book.name}`);
      continue;
    }
    
    const convertedBook = {
      id: bookId,
      name: book.name,
      chapters: []
    };
    
    for (const chapter of book.chapters) {
      const convertedChapter = {
        number: chapter.chapter,
        verses: chapter.verses.map(v => ({
          number: v.verse,
          text: v.text
        }))
      };
      convertedBook.chapters.push(convertedChapter);
      totalVerses += convertedChapter.verses.length;
      totalChapters++;
    }
    
    converted.books.push(convertedBook);
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(converted, null, 2));
  
  const stats = fs.statSync(outputPath);
  console.log(`  Books: ${converted.books.length}`);
  console.log(`  Chapters: ${totalChapters}`);
  console.log(`  Verses: ${totalVerses}`);
  console.log(`  Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  
  return converted;
}

function generateMetadata(bibles) {
  const metadata = {
    books: []
  };
  
  // Use first bible as reference
  const refBible = bibles[0];
  
  for (const book of refBible.books) {
    metadata.books.push({
      id: book.id,
      name: book.name,
      chapters: book.chapters.length,
      verses: book.chapters.map(c => c.verses.length)
    });
  }
  
  return metadata;
}

// Main execution
const assetsDir = path.join(__dirname, '..', 'assets');
const biblesDir = path.join(assetsDir, 'bibles');
const metadataDir = path.join(assetsDir, 'metadata');

fs.mkdirSync(biblesDir, { recursive: true });
fs.mkdirSync(metadataDir, { recursive: true });

const conversions = [
  { input: '/tmp/kjv_raw.json', output: path.join(biblesDir, 'kjv.json'), code: 'KJV' },
  { input: '/tmp/asv_raw.json', output: path.join(biblesDir, 'asv.json'), code: 'ASV' },
  { input: '/tmp/bbe_raw.json', output: path.join(biblesDir, 'bbe.json'), code: 'BBE' }
];

const convertedBibles = [];

for (const conv of conversions) {
  if (fs.existsSync(conv.input)) {
    const bible = convertBible(conv.input, conv.output, conv.code);
    convertedBibles.push(bible);
  } else {
    console.warn(`Missing: ${conv.input}`);
  }
}

if (convertedBibles.length > 0) {
  const metadata = generateMetadata(convertedBibles);
  const metadataPath = path.join(metadataDir, 'books.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`\nMetadata written to ${metadataPath}`);
}

console.log('\nDone!');
