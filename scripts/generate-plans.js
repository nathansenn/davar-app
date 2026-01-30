#!/usr/bin/env node
/**
 * Generate Reading Plan Schedules
 * Run with: node scripts/generate-plans.js
 */

const fs = require('fs');
const path = require('path');

// Bible book structure with chapter counts
const OLD_TESTAMENT = [
  { id: 'GEN', name: 'Genesis', chapters: 50 },
  { id: 'EXO', name: 'Exodus', chapters: 40 },
  { id: 'LEV', name: 'Leviticus', chapters: 27 },
  { id: 'NUM', name: 'Numbers', chapters: 36 },
  { id: 'DEU', name: 'Deuteronomy', chapters: 34 },
  { id: 'JOS', name: 'Joshua', chapters: 24 },
  { id: 'JDG', name: 'Judges', chapters: 21 },
  { id: 'RUT', name: 'Ruth', chapters: 4 },
  { id: '1SA', name: '1 Samuel', chapters: 31 },
  { id: '2SA', name: '2 Samuel', chapters: 24 },
  { id: '1KI', name: '1 Kings', chapters: 22 },
  { id: '2KI', name: '2 Kings', chapters: 25 },
  { id: '1CH', name: '1 Chronicles', chapters: 29 },
  { id: '2CH', name: '2 Chronicles', chapters: 36 },
  { id: 'EZR', name: 'Ezra', chapters: 10 },
  { id: 'NEH', name: 'Nehemiah', chapters: 13 },
  { id: 'EST', name: 'Esther', chapters: 10 },
  { id: 'JOB', name: 'Job', chapters: 42 },
  { id: 'PSA', name: 'Psalms', chapters: 150 },
  { id: 'PRO', name: 'Proverbs', chapters: 31 },
  { id: 'ECC', name: 'Ecclesiastes', chapters: 12 },
  { id: 'SNG', name: 'Song of Solomon', chapters: 8 },
  { id: 'ISA', name: 'Isaiah', chapters: 66 },
  { id: 'JER', name: 'Jeremiah', chapters: 52 },
  { id: 'LAM', name: 'Lamentations', chapters: 5 },
  { id: 'EZK', name: 'Ezekiel', chapters: 48 },
  { id: 'DAN', name: 'Daniel', chapters: 12 },
  { id: 'HOS', name: 'Hosea', chapters: 14 },
  { id: 'JOL', name: 'Joel', chapters: 3 },
  { id: 'AMO', name: 'Amos', chapters: 9 },
  { id: 'OBA', name: 'Obadiah', chapters: 1 },
  { id: 'JON', name: 'Jonah', chapters: 4 },
  { id: 'MIC', name: 'Micah', chapters: 7 },
  { id: 'NAM', name: 'Nahum', chapters: 3 },
  { id: 'HAB', name: 'Habakkuk', chapters: 3 },
  { id: 'ZEP', name: 'Zephaniah', chapters: 3 },
  { id: 'HAG', name: 'Haggai', chapters: 2 },
  { id: 'ZEC', name: 'Zechariah', chapters: 14 },
  { id: 'MAL', name: 'Malachi', chapters: 4 },
];

const NEW_TESTAMENT = [
  { id: 'MAT', name: 'Matthew', chapters: 28 },
  { id: 'MRK', name: 'Mark', chapters: 16 },
  { id: 'LUK', name: 'Luke', chapters: 24 },
  { id: 'JHN', name: 'John', chapters: 21 },
  { id: 'ACT', name: 'Acts', chapters: 28 },
  { id: 'ROM', name: 'Romans', chapters: 16 },
  { id: '1CO', name: '1 Corinthians', chapters: 16 },
  { id: '2CO', name: '2 Corinthians', chapters: 13 },
  { id: 'GAL', name: 'Galatians', chapters: 6 },
  { id: 'EPH', name: 'Ephesians', chapters: 6 },
  { id: 'PHP', name: 'Philippians', chapters: 4 },
  { id: 'COL', name: 'Colossians', chapters: 4 },
  { id: '1TH', name: '1 Thessalonians', chapters: 5 },
  { id: '2TH', name: '2 Thessalonians', chapters: 3 },
  { id: '1TI', name: '1 Timothy', chapters: 6 },
  { id: '2TI', name: '2 Timothy', chapters: 4 },
  { id: 'TIT', name: 'Titus', chapters: 3 },
  { id: 'PHM', name: 'Philemon', chapters: 1 },
  { id: 'HEB', name: 'Hebrews', chapters: 13 },
  { id: 'JAS', name: 'James', chapters: 5 },
  { id: '1PE', name: '1 Peter', chapters: 5 },
  { id: '2PE', name: '2 Peter', chapters: 3 },
  { id: '1JN', name: '1 John', chapters: 5 },
  { id: '2JN', name: '2 John', chapters: 1 },
  { id: '3JN', name: '3 John', chapters: 1 },
  { id: 'JUD', name: 'Jude', chapters: 1 },
  { id: 'REV', name: 'Revelation', chapters: 22 },
];

// OT without Psalms/Proverbs (for main reading)
const OT_MAIN = OLD_TESTAMENT.filter(b => !['PSA', 'PRO'].includes(b.id));

/**
 * Flatten books into chapter array
 */
function flattenBooks(books) {
  const chapters = [];
  for (const book of books) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      chapters.push({ bookId: book.id, chapter: ch });
    }
  }
  return chapters;
}

/**
 * Distribute chapters evenly across days
 */
function distributeChapters(chapters, days) {
  const chaptersPerDay = Math.ceil(chapters.length / days);
  const result = [];
  
  for (let day = 1; day <= days; day++) {
    const startIdx = (day - 1) * chaptersPerDay;
    const dayChapters = chapters.slice(startIdx, startIdx + chaptersPerDay);
    if (dayChapters.length > 0) {
      result.push({ day, chapters: dayChapters });
    }
  }
  
  return result;
}

/**
 * Merge consecutive chapters from same book into passage
 */
function mergeChapters(chapters) {
  const passages = [];
  
  for (const ch of chapters) {
    const last = passages[passages.length - 1];
    if (last && last.bookId === ch.bookId && 
        (last.endChapter || last.startChapter) + 1 === ch.chapter) {
      last.endChapter = ch.chapter;
    } else {
      passages.push({
        bookId: ch.bookId,
        startChapter: ch.chapter,
      });
    }
  }
  
  return passages;
}

/**
 * Generate Bible in 1 Year plan
 * 
 * Strategy: 
 * - OT (excluding Psalms/Proverbs): 748 chapters / 365 days = ~2 chapters/day
 * - NT: 260 chapters / 365 days = ~0.7 chapters/day (read 1 per day, cycles ~1.4x)
 * - Psalms: 1 per day (150 chapters, so one reading per day cycles ~2.4x)
 * - Proverbs: chapter matching day of month (1-31), or interspersed
 */
function generateBible1Year() {
  const schedule = [];
  
  // Flatten all OT chapters (excluding Psalms/Proverbs)
  const otChapters = flattenBooks(OT_MAIN);
  const ntChapters = flattenBooks(NEW_TESTAMENT);
  
  console.log(`OT chapters (excl Psalms/Proverbs): ${otChapters.length}`);
  console.log(`NT chapters: ${ntChapters.length}`);
  
  // OT: ~2 chapters per day to complete in 365 days
  // We have 748 OT chapters (excl Ps/Pr), so ~2.05 per day
  const otPerDay = Math.ceil(otChapters.length / 365); // 3
  
  // NT cycles through; 1 chapter per day
  let otIndex = 0;
  let ntIndex = 0;
  
  for (let day = 1; day <= 365; day++) {
    const passages = [];
    
    // OT reading: 2-3 chapters per day
    // Variable pace: 3 chapters early, 2 chapters later to fit exactly
    const otRemaining = otChapters.length - otIndex;
    const daysRemaining = 365 - day + 1;
    const otToday = Math.ceil(otRemaining / daysRemaining);
    
    const dayOtChapters = [];
    for (let i = 0; i < otToday && otIndex < otChapters.length; i++) {
      dayOtChapters.push(otChapters[otIndex++]);
    }
    passages.push(...mergeChapters(dayOtChapters));
    
    // NT reading: 1 chapter per day (cycles)
    const ntCh = ntChapters[ntIndex % ntChapters.length];
    ntIndex++;
    passages.push({
      bookId: ntCh.bookId,
      startChapter: ntCh.chapter,
    });
    
    // Psalm: cycling through 150
    passages.push({
      bookId: 'PSA',
      startChapter: ((day - 1) % 150) + 1,
    });
    
    // Proverbs: match day of month (for variety, we'll do every ~12 days)
    // Or: include Proverbs chapter that matches (day % 31) + 1
    if (day % 12 === 1) {
      passages.push({
        bookId: 'PRO',
        startChapter: Math.min(Math.ceil(day / 12), 31),
      });
    }
    
    schedule.push({ day, passages });
  }
  
  // Verify coverage
  console.log(`Final OT index: ${otIndex} / ${otChapters.length}`);
  console.log(`Final NT cycles: ${Math.floor(ntIndex / ntChapters.length) + 1}`);
  
  return {
    id: 'bible-1-year',
    name: 'Bible in One Year',
    description: 'Read through the entire Bible in 365 days with daily readings from Old Testament, New Testament, Psalms, and Proverbs.',
    durationDays: 365,
    schedule,
  };
}

/**
 * Generate New Testament in 90 Days
 * ~3 chapters per day
 */
function generateNT90Days() {
  const schedule = [];
  const ntChapters = flattenBooks(NEW_TESTAMENT);
  
  let index = 0;
  for (let day = 1; day <= 90; day++) {
    const remaining = ntChapters.length - index;
    const daysLeft = 90 - day + 1;
    const todayCount = Math.ceil(remaining / daysLeft);
    
    const dayChapters = [];
    for (let i = 0; i < todayCount && index < ntChapters.length; i++) {
      dayChapters.push(ntChapters[index++]);
    }
    
    if (dayChapters.length === 0) break;
    
    schedule.push({
      day,
      passages: mergeChapters(dayChapters),
    });
  }
  
  // If we finish early (shouldn't with 260/90≈3), fill with review
  while (schedule.length < 90) {
    const reviewDay = schedule.length + 1;
    // Review key passages
    const reviewPassages = [
      { bookId: 'JHN', startChapter: (reviewDay % 21) + 1 },
    ];
    schedule.push({ day: reviewDay, passages: reviewPassages });
  }
  
  return {
    id: 'new-testament-90',
    name: 'New Testament in 90 Days',
    description: 'Read through the entire New Testament in 90 days, from Matthew to Revelation.',
    durationDays: 90,
    schedule: schedule.slice(0, 90),
  };
}

/**
 * Generate Psalms & Proverbs Daily (30-day cycle)
 * 5 Psalms per day (150 / 30 = 5)
 * 1 Proverbs per day (31 chapters, day 30 gets 2)
 */
function generatePsalmsProverbs() {
  const schedule = [];
  
  for (let day = 1; day <= 30; day++) {
    const passages = [];
    
    // 5 Psalms per day (spaced every 30 Psalms for variety)
    // Day 1: Psalms 1, 31, 61, 91, 121
    // Day 2: Psalms 2, 32, 62, 92, 122
    // etc.
    for (let i = 0; i < 5; i++) {
      const psalmNum = day + (i * 30);
      if (psalmNum <= 150) {
        passages.push({
          bookId: 'PSA',
          startChapter: psalmNum,
        });
      }
    }
    
    // 1 Proverbs per day
    passages.push({
      bookId: 'PRO',
      startChapter: day,
    });
    
    // Day 30 also includes Proverbs 31
    if (day === 30) {
      passages.push({
        bookId: 'PRO',
        startChapter: 31,
      });
    }
    
    schedule.push({ day, passages });
  }
  
  return {
    id: 'psalms-proverbs',
    name: 'Psalms & Proverbs Monthly',
    description: 'A 30-day cycle through Psalms and Proverbs. Perfect for monthly repetition to build wisdom and worship into your daily rhythm.',
    durationDays: 30,
    isRepeating: true,
    schedule,
  };
}

// Generate all plans
const plans = [
  generateBible1Year(),
  generateNT90Days(),
  generatePsalmsProverbs(),
];

// Write to files
const outDir = path.join(__dirname, '..', 'assets', 'plans');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const plan of plans) {
  const filename = `${plan.id}.json`;
  const filepath = path.join(outDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(plan, null, 2));
  console.log(`Generated: ${filename} (${plan.schedule.length} days)`);
}

console.log('\nAll plans generated successfully!');
