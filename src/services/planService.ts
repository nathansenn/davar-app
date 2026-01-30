/**
 * Reading Plan Service
 * 
 * Manages Bible reading plans, progress calculation, and streak tracking.
 */

import { getDatabase, ReadingPlan, ReadingLog, UserProgress, DaySchedule, PassageRef } from './database';

// Import plan data (bundled with app)
// Using require for JSON to avoid tsconfig issues with resolveJsonModule
const bible1Year = require('../../assets/plans/bible-1-year.json');
const nt90Days = require('../../assets/plans/new-testament-90.json');
const psalmsProverbs = require('../../assets/plans/psalms-proverbs.json');

// ===========================================
// TYPES
// ===========================================

// Re-export PassageRef for convenience
export type Passage = PassageRef;

export interface DayReading {
  day: number;
  passages: Passage[];
  date: string;
  isCompleted: boolean;
}

export interface PlanWithProgress extends ReadingPlan {
  progress?: UserProgress | null;
  percentComplete: number;
  currentStreak: number;
  todaysReading?: DayReading;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
  totalDaysRead: number;
}

// ===========================================
// BUILT-IN PLANS (bundled with app)
// ===========================================

const BUILT_IN_PLANS: ReadingPlan[] = [
  {
    id: bible1Year.id,
    name: bible1Year.name,
    description: bible1Year.description,
    durationDays: bible1Year.durationDays,
    schedule: bible1Year.schedule as DaySchedule[],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: nt90Days.id,
    name: nt90Days.name,
    description: nt90Days.description,
    durationDays: nt90Days.durationDays,
    schedule: nt90Days.schedule as DaySchedule[],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: psalmsProverbs.id,
    name: psalmsProverbs.name,
    description: psalmsProverbs.description,
    durationDays: psalmsProverbs.durationDays,
    schedule: psalmsProverbs.schedule as DaySchedule[],
    isBuiltIn: true,
    createdAt: new Date().toISOString(),
  },
];

// ===========================================
// PLAN SERVICE
// ===========================================

/**
 * Get all available reading plans (built-in + custom)
 */
export async function getAvailablePlans(): Promise<ReadingPlan[]> {
  const db = getDatabase();
  
  // Get custom plans from database
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM reading_plans WHERE is_built_in = 0 ORDER BY name ASC'
  );
  
  const customPlans: ReadingPlan[] = rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    durationDays: row.duration_days,
    schedule: JSON.parse(row.schedule),
    isBuiltIn: false,
    createdAt: row.created_at,
  }));
  
  // Return built-in plans first, then custom
  return [...BUILT_IN_PLANS, ...customPlans];
}

/**
 * Get a specific reading plan by ID
 */
export async function getPlanById(id: string): Promise<ReadingPlan | null> {
  // Check built-in plans first
  const builtIn = BUILT_IN_PLANS.find(p => p.id === id);
  if (builtIn) return builtIn;
  
  // Check database for custom plans
  const db = getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM reading_plans WHERE id = ?',
    [id]
  );
  
  if (!row) return null;
  
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    durationDays: row.duration_days,
    schedule: JSON.parse(row.schedule),
    isBuiltIn: false,
    createdAt: row.created_at,
  };
}

/**
 * Get today's reading for a plan based on start date
 */
export function getTodaysReading(
  plan: ReadingPlan,
  startDate: Date,
  completedDays: number[] = []
): DayReading {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  // Calculate which day of the plan we're on (1-indexed)
  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // For repeating plans (like Psalms/Proverbs), cycle through
  let planDay = (diffDays % plan.durationDays) + 1;
  
  // For non-repeating plans, cap at the last day
  if (!(psalmsProverbs as any).isRepeating && plan.id !== 'psalms-proverbs') {
    planDay = Math.min(diffDays + 1, plan.durationDays);
  }
  
  const daySchedule = plan.schedule.find(d => d.day === planDay);
  
  return {
    day: planDay,
    passages: daySchedule?.passages ?? [],
    date: today.toISOString().split('T')[0],
    isCompleted: completedDays.includes(planDay),
  };
}

/**
 * Calculate progress percentage for a plan
 */
export function calculateProgress(
  durationDays: number,
  completedDays: number[]
): number {
  if (durationDays === 0) return 0;
  return Math.round((completedDays.length / durationDays) * 100);
}

/**
 * Calculate current reading streak from reading logs
 */
export function calculateStreak(readingLogs: ReadingLog[]): number {
  if (readingLogs.length === 0) return 0;
  
  // Sort by date descending
  const sortedLogs = [...readingLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  // Get unique dates
  const dateSet = new Set(sortedLogs.map(l => l.date));
  
  // Check if streak is still active (read today or yesterday)
  if (!dateSet.has(todayStr) && !dateSet.has(yesterdayStr)) {
    return 0;
  }
  
  // Count consecutive days backward from most recent
  let streak = 0;
  let checkDate = dateSet.has(todayStr) ? today : yesterday;
  
  while (dateSet.has(checkDate.toISOString().split('T')[0])) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  
  return streak;
}

/**
 * Get all plans with their current progress
 */
export async function getPlansWithProgress(): Promise<PlanWithProgress[]> {
  const plans = await getAvailablePlans();
  const db = getDatabase();
  
  // Get all active progress
  const progressRows = await db.getAllAsync<any>(
    `SELECT * FROM user_progress WHERE status IN ('active', 'paused')`
  );
  
  // Get recent reading logs for streak calculation
  const logs = await db.getAllAsync<any>(
    'SELECT * FROM reading_logs ORDER BY date DESC LIMIT 365'
  );
  const readingLogs: ReadingLog[] = logs.map(row => ({
    id: row.id,
    date: row.date,
    passages: JSON.parse(row.passages),
    durationMinutes: row.duration_minutes,
    planId: row.plan_id,
    notes: row.notes,
    createdAt: row.created_at,
  }));
  
  const currentStreak = calculateStreak(readingLogs);
  
  return plans.map(plan => {
    const progressRow = progressRows.find(p => p.plan_id === plan.id);
    const progress: UserProgress | null = progressRow
      ? {
          id: progressRow.id,
          planId: progressRow.plan_id,
          startDate: progressRow.start_date,
          currentDay: progressRow.current_day,
          completedDays: JSON.parse(progressRow.completed_days),
          status: progressRow.status,
          createdAt: progressRow.created_at,
          updatedAt: progressRow.updated_at,
        }
      : null;
    
    const completedDays = progress?.completedDays ?? [];
    const percentComplete = calculateProgress(plan.durationDays, completedDays);
    
    let todaysReading: DayReading | undefined;
    if (progress) {
      todaysReading = getTodaysReading(
        plan,
        new Date(progress.startDate),
        completedDays
      );
    }
    
    return {
      ...plan,
      progress,
      percentComplete,
      currentStreak,
      todaysReading,
    };
  });
}

/**
 * Get a specific day's reading from a plan
 */
export function getDayReading(plan: ReadingPlan, day: number): DaySchedule | null {
  return plan.schedule.find(d => d.day === day) ?? null;
}

/**
 * Format passages for display
 * e.g., "Genesis 1-3, Matthew 1, Psalm 1"
 */
export function formatPassagesForDisplay(passages: Passage[]): string {
  const BOOK_NAMES: Record<string, string> = {
    GEN: 'Genesis', EXO: 'Exodus', LEV: 'Leviticus', NUM: 'Numbers',
    DEU: 'Deuteronomy', JOS: 'Joshua', JDG: 'Judges', RUT: 'Ruth',
    '1SA': '1 Samuel', '2SA': '2 Samuel', '1KI': '1 Kings', '2KI': '2 Kings',
    '1CH': '1 Chronicles', '2CH': '2 Chronicles', EZR: 'Ezra', NEH: 'Nehemiah',
    EST: 'Esther', JOB: 'Job', PSA: 'Psalm', PRO: 'Proverbs',
    ECC: 'Ecclesiastes', SNG: 'Song of Solomon', ISA: 'Isaiah', JER: 'Jeremiah',
    LAM: 'Lamentations', EZK: 'Ezekiel', DAN: 'Daniel', HOS: 'Hosea',
    JOL: 'Joel', AMO: 'Amos', OBA: 'Obadiah', JON: 'Jonah',
    MIC: 'Micah', NAM: 'Nahum', HAB: 'Habakkuk', ZEP: 'Zephaniah',
    HAG: 'Haggai', ZEC: 'Zechariah', MAL: 'Malachi',
    MAT: 'Matthew', MRK: 'Mark', LUK: 'Luke', JHN: 'John',
    ACT: 'Acts', ROM: 'Romans', '1CO': '1 Corinthians', '2CO': '2 Corinthians',
    GAL: 'Galatians', EPH: 'Ephesians', PHP: 'Philippians', COL: 'Colossians',
    '1TH': '1 Thessalonians', '2TH': '2 Thessalonians', '1TI': '1 Timothy',
    '2TI': '2 Timothy', TIT: 'Titus', PHM: 'Philemon', HEB: 'Hebrews',
    JAS: 'James', '1PE': '1 Peter', '2PE': '2 Peter', '1JN': '1 John',
    '2JN': '2 John', '3JN': '3 John', JUD: 'Jude', REV: 'Revelation',
  };
  
  return passages
    .map(p => {
      const bookName = BOOK_NAMES[p.bookId] || p.bookId;
      if (p.endChapter && p.endChapter !== p.startChapter) {
        return `${bookName} ${p.startChapter}-${p.endChapter}`;
      }
      return `${bookName} ${p.startChapter}`;
    })
    .join(', ');
}

/**
 * Get estimated reading time in minutes based on passage count
 * Rough estimate: ~3-4 minutes per chapter
 */
export function estimateReadingTime(passages: Passage[]): number {
  let totalChapters = 0;
  for (const p of passages) {
    const end = p.endChapter ?? p.startChapter;
    totalChapters += end - p.startChapter + 1;
  }
  return Math.ceil(totalChapters * 3.5);
}

// ===========================================
// PLAN SEEDING (for database initialization)
// ===========================================

/**
 * Seed built-in plans into database (called during initialization)
 * This allows user progress to reference them via foreign key
 */
export async function seedBuiltInPlans(): Promise<void> {
  const db = getDatabase();
  
  for (const plan of BUILT_IN_PLANS) {
    await db.runAsync(
      `INSERT OR REPLACE INTO reading_plans 
       (id, name, description, duration_days, schedule, is_built_in)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [
        plan.id,
        plan.name,
        plan.description,
        plan.durationDays,
        JSON.stringify(plan.schedule),
      ]
    );
  }
  
  console.log(`Seeded ${BUILT_IN_PLANS.length} built-in reading plans`);
}
