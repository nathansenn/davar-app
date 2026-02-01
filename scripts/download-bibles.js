#!/usr/bin/env node

/**
 * Download Bible translations from scrollmapper/bible_databases
 * Run: node scripts/download-bibles.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BIBLES_DIR = path.join(__dirname, '..', 'assets', 'bibles');
const BASE_URL = 'https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json';

// Translations to download
const TRANSLATIONS = [
  // Original languages
  { code: 'WLC', name: 'Westminster Leningrad Codex (Hebrew OT)' },
  { code: 'TR', name: 'Textus Receptus (Greek NT)' },
  { code: 'Byz', name: 'Byzantine Textform (Greek NT)' },
  // Modern English with notes
  { code: 'BSB', name: 'Berean Standard Bible' },
];

// Book ID mapping from scrollmapper to our format
const BOOK_ID_MAP = {
  'Genesis': 'GEN',
  'Exodus': 'EXO',
  'Leviticus': 'LEV',
  'Numbers': 'NUM',
  'Deuteronomy': 'DEU',
  'Joshua': 'JOS',
  'Judges': 'JDG',
  'Ruth': 'RUT',
  '1 Samuel': '1SA',
  '2 Samuel': '2SA',
  '1 Kings': '1KI',
  '2 Kings': '2KI',
  '1 Chronicles': '1CH',
  '2 Chronicles': '2CH',
  'Ezra': 'EZR',
  'Nehemiah': 'NEH',
  'Esther': 'EST',
  'Job': 'JOB',
  'Psalms': 'PSA',
  'Psalm': 'PSA',
  'Proverbs': 'PRO',
  'Ecclesiastes': 'ECC',
  'Song of Solomon': 'SNG',
  'Isaiah': 'ISA',
  'Jeremiah': 'JER',
  'Lamentations': 'LAM',
  'Ezekiel': 'EZK',
  'Daniel': 'DAN',
  'Hosea': 'HOS',
  'Joel': 'JOL',
  'Amos': 'AMO',
  'Obadiah': 'OBA',
  'Jonah': 'JON',
  'Micah': 'MIC',
  'Nahum': 'NAM',
  'Habakkuk': 'HAB',
  'Zephaniah': 'ZEP',
  'Haggai': 'HAG',
  'Zechariah': 'ZEC',
  'Malachi': 'MAL',
  'Matthew': 'MAT',
  'Mark': 'MRK',
  'Luke': 'LUK',
  'John': 'JHN',
  'Acts': 'ACT',
  'Romans': 'ROM',
  '1 Corinthians': '1CO',
  '2 Corinthians': '2CO',
  'Galatians': 'GAL',
  'Ephesians': 'EPH',
  'Philippians': 'PHP',
  'Colossians': 'COL',
  '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH',
  '1 Timothy': '1TI',
  '2 Timothy': '2TI',
  'Titus': 'TIT',
  'Philemon': 'PHM',
  'Hebrews': 'HEB',
  'James': 'JAS',
  '1 Peter': '1PE',
  '2 Peter': '2PE',
  '1 John': '1JN',
  '2 John': '2JN',
  '3 John': '3JN',
  'Jude': 'JUD',
  'Revelation': 'REV',
};

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function convertToOurFormat(rawData) {
  /**
   * Convert scrollmapper JSON format to our format:
   * Input: { translation, books: [{ name, chapters: [{ chapter, verses: [{ verse, text }] }] }] }
   * Output: { translation, name, books: [{ id, name, chapters: [{ number, verses: [{ number, text }] }] }] }
   */
  return {
    translation: rawData.translation.split(':')[0].trim(),
    name: rawData.translation,
    books: rawData.books.map(book => ({
      id: BOOK_ID_MAP[book.name] || book.name.toUpperCase().slice(0, 3),
      name: book.name,
      chapters: book.chapters.map(chapter => ({
        number: chapter.chapter,
        verses: chapter.verses.map(verse => ({
          number: verse.verse,
          text: verse.text,
        })),
      })),
    })),
  };
}

async function downloadTranslation(code, name) {
  const url = `${BASE_URL}/${code}.json`;
  const outputPath = path.join(BIBLES_DIR, `${code.toLowerCase()}.json`);
  
  console.log(`Downloading ${name}...`);
  
  try {
    const raw = await fetch(url);
    const data = JSON.parse(raw);
    const converted = convertToOurFormat(data);
    
    // Write minified JSON
    fs.writeFileSync(outputPath, JSON.stringify(converted));
    
    const stats = fs.statSync(outputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`  ✓ Saved ${outputPath} (${sizeMB} MB)`);
    console.log(`    Books: ${converted.books.length}, Chapters: ${converted.books.reduce((sum, b) => sum + b.chapters.length, 0)}`);
    
    return true;
  } catch (error) {
    console.error(`  ✗ Failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('Bible Download Script');
  console.log('=====================\n');
  
  // Ensure directory exists
  if (!fs.existsSync(BIBLES_DIR)) {
    fs.mkdirSync(BIBLES_DIR, { recursive: true });
  }
  
  let success = 0;
  let failed = 0;
  
  for (const { code, name } of TRANSLATIONS) {
    if (await downloadTranslation(code, name)) {
      success++;
    } else {
      failed++;
    }
    console.log('');
  }
  
  console.log('=====================');
  console.log(`Done: ${success} succeeded, ${failed} failed`);
  
  if (success > 0) {
    console.log('\nNote: You may need to update bibleService.ts to import these new translations.');
  }
}

main().catch(console.error);
