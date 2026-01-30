#!/usr/bin/env node
/**
 * Verify Bible data integrity
 */

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

// Expected data
const EXPECTED_BOOKS = 66;
const EXPECTED_CHAPTERS = 1189;
const EXPECTED_VERSES = 31102;

const OLD_TESTAMENT = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT',
  '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH',
  'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG', 'ISA', 'JER',
  'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON',
  'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'
];

const NEW_TESTAMENT = [
  'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO',
  'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI',
  'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN',
  '3JN', 'JUD', 'REV'
];

function verifyBible(name, filePath) {
  console.log(`\n📖 Verifying ${name}...`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`  ❌ File not found: ${filePath}`);
    return false;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let errors = 0;

  // Check structure
  if (!data.translation || !data.name || !data.books) {
    console.error('  ❌ Missing required fields (translation, name, books)');
    errors++;
  }

  // Check book count
  if (data.books.length !== EXPECTED_BOOKS) {
    console.error(`  ❌ Book count: ${data.books.length} (expected ${EXPECTED_BOOKS})`);
    errors++;
  } else {
    console.log(`  ✓ Book count: ${data.books.length}`);
  }

  // Check all books present
  const bookIds = data.books.map(b => b.id);
  const missingOT = OLD_TESTAMENT.filter(id => !bookIds.includes(id));
  const missingNT = NEW_TESTAMENT.filter(id => !bookIds.includes(id));

  if (missingOT.length > 0) {
    console.error(`  ❌ Missing OT books: ${missingOT.join(', ')}`);
    errors++;
  } else {
    console.log(`  ✓ All 39 OT books present`);
  }

  if (missingNT.length > 0) {
    console.error(`  ❌ Missing NT books: ${missingNT.join(', ')}`);
    errors++;
  } else {
    console.log(`  ✓ All 27 NT books present`);
  }

  // Count chapters and verses
  let totalChapters = 0;
  let totalVerses = 0;
  let emptyVerses = 0;

  for (const book of data.books) {
    totalChapters += book.chapters.length;
    for (const chapter of book.chapters) {
      totalVerses += chapter.verses.length;
      for (const verse of chapter.verses) {
        if (!verse.text || verse.text.trim() === '') {
          emptyVerses++;
        }
      }
    }
  }

  if (totalChapters !== EXPECTED_CHAPTERS) {
    console.error(`  ❌ Chapter count: ${totalChapters} (expected ${EXPECTED_CHAPTERS})`);
    errors++;
  } else {
    console.log(`  ✓ Chapter count: ${totalChapters}`);
  }

  if (totalVerses !== EXPECTED_VERSES) {
    console.error(`  ❌ Verse count: ${totalVerses} (expected ${EXPECTED_VERSES})`);
    errors++;
  } else {
    console.log(`  ✓ Verse count: ${totalVerses}`);
  }

  if (emptyVerses > 0) {
    console.warn(`  ⚠ Empty verses: ${emptyVerses}`);
  }

  // Spot check some verses
  const genesis1_1 = data.books.find(b => b.id === 'GEN')?.chapters[0]?.verses[0]?.text;
  const john3_16 = data.books.find(b => b.id === 'JHN')?.chapters[2]?.verses[15]?.text;

  // Genesis 1:1 check - different translations vary ("beginning" vs "first")
  if (genesis1_1 && (genesis1_1.toLowerCase().includes('beginning') || genesis1_1.toLowerCase().includes('first'))) {
    console.log(`  ✓ Genesis 1:1 verified`);
  } else {
    console.error(`  ❌ Genesis 1:1 failed spot check`);
    errors++;
  }

  if (john3_16 && john3_16.toLowerCase().includes('god')) {
    console.log(`  ✓ John 3:16 verified`);
  } else {
    console.error(`  ❌ John 3:16 failed spot check`);
    errors++;
  }

  const size = fs.statSync(filePath).size;
  console.log(`  📊 File size: ${(size / 1024 / 1024).toFixed(2)} MB`);

  return errors === 0;
}

function verifyMetadata(filePath) {
  console.log(`\n📋 Verifying metadata...`);

  if (!fs.existsSync(filePath)) {
    console.error(`  ❌ File not found: ${filePath}`);
    return false;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let errors = 0;

  if (!data.books || data.books.length !== EXPECTED_BOOKS) {
    console.error(`  ❌ Book count in metadata: ${data.books?.length} (expected ${EXPECTED_BOOKS})`);
    errors++;
  } else {
    console.log(`  ✓ Book count: ${data.books.length}`);
  }

  // Check each book has required fields
  for (const book of data.books) {
    if (!book.id || !book.name || !book.chapters || !book.verses) {
      console.error(`  ❌ Book missing fields: ${book.id || 'unknown'}`);
      errors++;
    }
  }

  console.log(`  ✓ All books have required metadata fields`);

  return errors === 0;
}

// Main
console.log('🔍 Bible Data Verification\n' + '='.repeat(40));

const results = [
  verifyBible('KJV', path.join(assetsDir, 'bibles', 'kjv.json')),
  verifyBible('ASV', path.join(assetsDir, 'bibles', 'asv.json')),
  verifyBible('BBE', path.join(assetsDir, 'bibles', 'bbe.json')),
  verifyMetadata(path.join(assetsDir, 'metadata', 'books.json')),
];

console.log('\n' + '='.repeat(40));
if (results.every(r => r)) {
  console.log('✅ All verifications passed!');
  process.exit(0);
} else {
  console.log('❌ Some verifications failed!');
  process.exit(1);
}
