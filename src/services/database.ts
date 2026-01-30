/**
 * Davar Database Service
 * 
 * Local SQLite storage for offline-first Bible reading app.
 * No third-party backends - we own all data.
 */

import * as SQLite from 'expo-sqlite';
import { v4 as uuidv4 } from 'uuid';

// Database instance
let db: SQLite.SQLiteDatabase | null = null;

// Current schema version
const SCHEMA_VERSION = 1;

/**
 * Initialize the database
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  
  db = await SQLite.openDatabaseAsync('davar.db');
  
  // Run migrations
  await runMigrations(db);
  
  // Initialize default data if needed
  await initializeDefaults(db);
  
  return db;
}

/**
 * Get database instance (must call initDatabase first)
 */
export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Schema migrations
 */
const MIGRATIONS: { version: number; name: string; sql: string }[] = [
  {
    version: 1,
    name: 'initial_schema',
    sql: `
      -- User Preferences (single row)
      CREATE TABLE IF NOT EXISTS preferences (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        display_name TEXT,
        theme TEXT DEFAULT 'system',
        font_size INTEGER DEFAULT 16,
        font_family TEXT DEFAULT 'system',
        default_translation TEXT DEFAULT 'WEB',
        notifications_enabled INTEGER DEFAULT 1,
        daily_reminder_time TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Reading Plans
      CREATE TABLE IF NOT EXISTS reading_plans (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        duration_days INTEGER NOT NULL,
        schedule TEXT NOT NULL,
        is_built_in INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      );

      -- User Progress on Reading Plans
      CREATE TABLE IF NOT EXISTS user_progress (
        id TEXT PRIMARY KEY,
        plan_id TEXT NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
        start_date TEXT NOT NULL,
        current_day INTEGER DEFAULT 1,
        completed_days TEXT DEFAULT '[]',
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        UNIQUE(plan_id)
      );

      -- Daily Reading Logs
      CREATE TABLE IF NOT EXISTS reading_logs (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        passages TEXT NOT NULL,
        duration_minutes INTEGER,
        plan_id TEXT REFERENCES reading_plans(id) ON DELETE SET NULL,
        notes TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(date)
      );

      -- Verse Highlights
      CREATE TABLE IF NOT EXISTS highlights (
        id TEXT PRIMARY KEY,
        verse_ref TEXT NOT NULL,
        color TEXT DEFAULT 'yellow',
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(verse_ref)
      );

      -- Verse Notes
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        verse_ref TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Bookmarks
      CREATE TABLE IF NOT EXISTS bookmarks (
        id TEXT PRIMARY KEY,
        verse_ref TEXT NOT NULL,
        label TEXT,
        category TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(verse_ref)
      );

      -- Reading Streaks (cached)
      CREATE TABLE IF NOT EXISTS streaks (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_read_date TEXT,
        total_days_read INTEGER DEFAULT 0,
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_reading_logs_date ON reading_logs(date);
      CREATE INDEX IF NOT EXISTS idx_highlights_verse ON highlights(verse_ref);
      CREATE INDEX IF NOT EXISTS idx_notes_verse ON notes(verse_ref);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_verse ON bookmarks(verse_ref);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks(category);
      CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
    `,
  },
];

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  // Get current version
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = result?.user_version ?? 0;

  console.log(`Database version: ${currentVersion}, target: ${SCHEMA_VERSION}`);

  // Run pending migrations
  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      console.log(`Running migration ${migration.version}: ${migration.name}`);
      await db.execAsync(migration.sql);
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    }
  }
}

async function initializeDefaults(db: SQLite.SQLiteDatabase): Promise<void> {
  // Initialize preferences row if not exists
  await db.runAsync(
    'INSERT OR IGNORE INTO preferences (id) VALUES (1)'
  );

  // Initialize streaks row if not exists
  await db.runAsync(
    'INSERT OR IGNORE INTO streaks (id) VALUES (1)'
  );
}

// ===========================================
// TYPE DEFINITIONS
// ===========================================

export interface Preferences {
  displayName: string | null;
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  fontFamily: string;
  defaultTranslation: string;
  notificationsEnabled: boolean;
  dailyReminderTime: string | null;
}

export interface ReadingPlan {
  id: string;
  name: string;
  description: string | null;
  durationDays: number;
  schedule: DaySchedule[];
  isBuiltIn: boolean;
  createdAt: string;
}

export interface DaySchedule {
  day: number;
  passages: string[];
}

export interface UserProgress {
  id: string;
  planId: string;
  startDate: string;
  currentDay: number;
  completedDays: number[];
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

export interface ReadingLog {
  id: string;
  date: string;
  passages: string[];
  durationMinutes: number | null;
  planId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Highlight {
  id: string;
  verseRef: string;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  createdAt: string;
}

export interface Note {
  id: string;
  verseRef: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bookmark {
  id: string;
  verseRef: string;
  label: string | null;
  category: string | null;
  createdAt: string;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
  totalDaysRead: number;
}

// ===========================================
// PREFERENCES
// ===========================================

export async function getPreferences(): Promise<Preferences> {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM preferences WHERE id = 1'
  );
  
  return {
    displayName: row?.display_name ?? null,
    theme: row?.theme ?? 'system',
    fontSize: row?.font_size ?? 16,
    fontFamily: row?.font_family ?? 'system',
    defaultTranslation: row?.default_translation ?? 'WEB',
    notificationsEnabled: Boolean(row?.notifications_enabled ?? 1),
    dailyReminderTime: row?.daily_reminder_time ?? null,
  };
}

export async function updatePreferences(
  updates: Partial<Preferences>
): Promise<void> {
  const db = getDatabase();
  const sets: string[] = [];
  const values: any[] = [];

  if (updates.displayName !== undefined) {
    sets.push('display_name = ?');
    values.push(updates.displayName);
  }
  if (updates.theme !== undefined) {
    sets.push('theme = ?');
    values.push(updates.theme);
  }
  if (updates.fontSize !== undefined) {
    sets.push('font_size = ?');
    values.push(updates.fontSize);
  }
  if (updates.fontFamily !== undefined) {
    sets.push('font_family = ?');
    values.push(updates.fontFamily);
  }
  if (updates.defaultTranslation !== undefined) {
    sets.push('default_translation = ?');
    values.push(updates.defaultTranslation);
  }
  if (updates.notificationsEnabled !== undefined) {
    sets.push('notifications_enabled = ?');
    values.push(updates.notificationsEnabled ? 1 : 0);
  }
  if (updates.dailyReminderTime !== undefined) {
    sets.push('daily_reminder_time = ?');
    values.push(updates.dailyReminderTime);
  }

  if (sets.length > 0) {
    sets.push("updated_at = datetime('now')");
    await db.runAsync(
      `UPDATE preferences SET ${sets.join(', ')} WHERE id = 1`,
      values
    );
  }
}

// ===========================================
// HIGHLIGHTS
// ===========================================

export async function getHighlights(): Promise<Highlight[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>('SELECT * FROM highlights');
  return rows.map(row => ({
    id: row.id,
    verseRef: row.verse_ref,
    color: row.color,
    createdAt: row.created_at,
  }));
}

export async function getHighlight(verseRef: string): Promise<Highlight | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM highlights WHERE verse_ref = ?',
    [verseRef]
  );
  if (!row) return null;
  return {
    id: row.id,
    verseRef: row.verse_ref,
    color: row.color,
    createdAt: row.created_at,
  };
}

export async function setHighlight(
  verseRef: string,
  color: Highlight['color']
): Promise<Highlight> {
  const db = getDatabase();
  const id = uuidv4();
  
  await db.runAsync(
    `INSERT INTO highlights (id, verse_ref, color) VALUES (?, ?, ?)
     ON CONFLICT(verse_ref) DO UPDATE SET color = excluded.color`,
    [id, verseRef, color]
  );
  
  return (await getHighlight(verseRef))!;
}

export async function removeHighlight(verseRef: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM highlights WHERE verse_ref = ?', [verseRef]);
}

// ===========================================
// NOTES
// ===========================================

export async function getNotes(verseRef?: string): Promise<Note[]> {
  const db = getDatabase();
  const query = verseRef
    ? 'SELECT * FROM notes WHERE verse_ref = ? ORDER BY created_at DESC'
    : 'SELECT * FROM notes ORDER BY created_at DESC';
  const params = verseRef ? [verseRef] : [];
  
  const rows = await db.getAllAsync<any>(query, params);
  return rows.map(row => ({
    id: row.id,
    verseRef: row.verse_ref,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function createNote(verseRef: string, content: string): Promise<Note> {
  const db = getDatabase();
  const id = uuidv4();
  
  await db.runAsync(
    'INSERT INTO notes (id, verse_ref, content) VALUES (?, ?, ?)',
    [id, verseRef, content]
  );
  
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM notes WHERE id = ?',
    [id]
  );
  
  return {
    id: row.id,
    verseRef: row.verse_ref,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function updateNote(id: string, content: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    "UPDATE notes SET content = ?, updated_at = datetime('now') WHERE id = ?",
    [content, id]
  );
}

export async function deleteNote(id: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM notes WHERE id = ?', [id]);
}

// ===========================================
// BOOKMARKS
// ===========================================

export async function getBookmarks(category?: string): Promise<Bookmark[]> {
  const db = getDatabase();
  const query = category
    ? 'SELECT * FROM bookmarks WHERE category = ? ORDER BY created_at DESC'
    : 'SELECT * FROM bookmarks ORDER BY created_at DESC';
  const params = category ? [category] : [];
  
  const rows = await db.getAllAsync<any>(query, params);
  return rows.map(row => ({
    id: row.id,
    verseRef: row.verse_ref,
    label: row.label,
    category: row.category,
    createdAt: row.created_at,
  }));
}

export async function addBookmark(
  verseRef: string,
  options?: { label?: string; category?: string }
): Promise<Bookmark> {
  const db = getDatabase();
  const id = uuidv4();
  
  await db.runAsync(
    `INSERT INTO bookmarks (id, verse_ref, label, category) VALUES (?, ?, ?, ?)
     ON CONFLICT(verse_ref) DO UPDATE SET label = excluded.label, category = excluded.category`,
    [id, verseRef, options?.label ?? null, options?.category ?? null]
  );
  
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM bookmarks WHERE verse_ref = ?',
    [verseRef]
  );
  
  return {
    id: row.id,
    verseRef: row.verse_ref,
    label: row.label,
    category: row.category,
    createdAt: row.created_at,
  };
}

export async function removeBookmark(verseRef: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync('DELETE FROM bookmarks WHERE verse_ref = ?', [verseRef]);
}

// ===========================================
// READING LOGS & STREAKS
// ===========================================

export async function logReading(
  passages: string[],
  options?: { durationMinutes?: number; planId?: string; notes?: string }
): Promise<ReadingLog> {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];
  const id = uuidv4();
  
  // Upsert today's reading log
  await db.runAsync(
    `INSERT INTO reading_logs (id, date, passages, duration_minutes, plan_id, notes)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       passages = json_group_array(json_each.value) 
         FROM (SELECT value FROM json_each(reading_logs.passages) 
               UNION SELECT value FROM json_each(excluded.passages)),
       duration_minutes = COALESCE(reading_logs.duration_minutes, 0) + COALESCE(excluded.duration_minutes, 0),
       plan_id = COALESCE(excluded.plan_id, reading_logs.plan_id),
       notes = CASE WHEN excluded.notes IS NOT NULL 
         THEN COALESCE(reading_logs.notes || '\n', '') || excluded.notes 
         ELSE reading_logs.notes END`,
    [id, today, JSON.stringify(passages), options?.durationMinutes ?? null, 
     options?.planId ?? null, options?.notes ?? null]
  );
  
  // Update streaks
  await updateStreaks();
  
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM reading_logs WHERE date = ?',
    [today]
  );
  
  return {
    id: row.id,
    date: row.date,
    passages: JSON.parse(row.passages),
    durationMinutes: row.duration_minutes,
    planId: row.plan_id,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function getReadingLogs(limit = 30): Promise<ReadingLog[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM reading_logs ORDER BY date DESC LIMIT ?',
    [limit]
  );
  
  return rows.map(row => ({
    id: row.id,
    date: row.date,
    passages: JSON.parse(row.passages),
    durationMinutes: row.duration_minutes,
    planId: row.plan_id,
    notes: row.notes,
    createdAt: row.created_at,
  }));
}

export async function getStreaks(): Promise<StreakInfo> {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>(
    'SELECT * FROM streaks WHERE id = 1'
  );
  
  return {
    currentStreak: row?.current_streak ?? 0,
    longestStreak: row?.longest_streak ?? 0,
    lastReadDate: row?.last_read_date ?? null,
    totalDaysRead: row?.total_days_read ?? 0,
  };
}

async function updateStreaks(): Promise<void> {
  const db = getDatabase();
  
  // Get all reading log dates
  const logs = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM reading_logs ORDER BY date DESC'
  );
  
  if (logs.length === 0) {
    await db.runAsync(
      `UPDATE streaks SET current_streak = 0, last_read_date = NULL, 
       total_days_read = 0, updated_at = datetime('now') WHERE id = 1`
    );
    return;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  const dateSet = new Set(logs.map(l => l.date));
  
  // Calculate current streak
  let currentStreak = 0;
  let checkDate = today;
  
  // If didn't read today, check if read yesterday (streak still valid)
  if (!dateSet.has(today)) {
    if (!dateSet.has(yesterday)) {
      // Streak broken
      currentStreak = 0;
    } else {
      checkDate = yesterday;
    }
  }
  
  if (dateSet.has(checkDate)) {
    // Count consecutive days backward
    while (dateSet.has(checkDate)) {
      currentStreak++;
      const prevDate = new Date(checkDate);
      prevDate.setDate(prevDate.getDate() - 1);
      checkDate = prevDate.toISOString().split('T')[0];
    }
  }
  
  // Get current longest streak
  const current = await db.getFirstAsync<{ longest_streak: number }>(
    'SELECT longest_streak FROM streaks WHERE id = 1'
  );
  const longestStreak = Math.max(currentStreak, current?.longest_streak ?? 0);
  
  // Update
  await db.runAsync(
    `UPDATE streaks SET 
       current_streak = ?,
       longest_streak = ?,
       last_read_date = ?,
       total_days_read = ?,
       updated_at = datetime('now')
     WHERE id = 1`,
    [currentStreak, longestStreak, logs[0].date, logs.length]
  );
}

// ===========================================
// READING PLANS
// ===========================================

export async function getReadingPlans(): Promise<ReadingPlan[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    'SELECT * FROM reading_plans ORDER BY is_built_in DESC, name ASC'
  );
  
  return rows.map(row => ({
    id: row.id,
    name: row.name,
    description: row.description,
    durationDays: row.duration_days,
    schedule: JSON.parse(row.schedule),
    isBuiltIn: Boolean(row.is_built_in),
    createdAt: row.created_at,
  }));
}

export async function getReadingPlan(id: string): Promise<ReadingPlan | null> {
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
    isBuiltIn: Boolean(row.is_built_in),
    createdAt: row.created_at,
  };
}

export async function createReadingPlan(
  plan: Omit<ReadingPlan, 'id' | 'createdAt' | 'isBuiltIn'>
): Promise<ReadingPlan> {
  const db = getDatabase();
  const id = uuidv4();
  
  await db.runAsync(
    `INSERT INTO reading_plans (id, name, description, duration_days, schedule, is_built_in)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [id, plan.name, plan.description, plan.durationDays, JSON.stringify(plan.schedule)]
  );
  
  return (await getReadingPlan(id))!;
}

// ===========================================
// USER PROGRESS
// ===========================================

export async function startPlan(planId: string): Promise<UserProgress> {
  const db = getDatabase();
  const id = uuidv4();
  const today = new Date().toISOString().split('T')[0];
  
  // Cancel any existing progress for this plan
  await db.runAsync(
    `UPDATE user_progress SET status = 'abandoned', updated_at = datetime('now')
     WHERE plan_id = ? AND status IN ('active', 'paused')`,
    [planId]
  );
  
  await db.runAsync(
    `INSERT INTO user_progress (id, plan_id, start_date, status)
     VALUES (?, ?, ?, 'active')`,
    [id, planId, today]
  );
  
  return (await getProgress(planId))!;
}

export async function getProgress(planId: string): Promise<UserProgress | null> {
  const db = getDatabase();
  const row = await db.getFirstAsync<any>(
    `SELECT * FROM user_progress WHERE plan_id = ? AND status IN ('active', 'paused')`,
    [planId]
  );
  
  if (!row) return null;
  
  return {
    id: row.id,
    planId: row.plan_id,
    startDate: row.start_date,
    currentDay: row.current_day,
    completedDays: JSON.parse(row.completed_days),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllProgress(): Promise<UserProgress[]> {
  const db = getDatabase();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM user_progress WHERE status IN ('active', 'paused') ORDER BY updated_at DESC`
  );
  
  return rows.map(row => ({
    id: row.id,
    planId: row.plan_id,
    startDate: row.start_date,
    currentDay: row.current_day,
    completedDays: JSON.parse(row.completed_days),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function completeDay(planId: string, day: number): Promise<void> {
  const db = getDatabase();
  
  const progress = await getProgress(planId);
  if (!progress) throw new Error('No active progress for this plan');
  
  const completedDays = [...progress.completedDays];
  if (!completedDays.includes(day)) {
    completedDays.push(day);
    completedDays.sort((a, b) => a - b);
  }
  
  // Check if plan is complete
  const plan = await getReadingPlan(planId);
  const isComplete = completedDays.length >= (plan?.durationDays ?? 0);
  
  await db.runAsync(
    `UPDATE user_progress SET 
       completed_days = ?,
       current_day = ?,
       status = ?,
       updated_at = datetime('now')
     WHERE id = ?`,
    [
      JSON.stringify(completedDays),
      Math.min(day + 1, plan?.durationDays ?? day + 1),
      isComplete ? 'completed' : 'active',
      progress.id,
    ]
  );
}

export async function pausePlan(planId: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `UPDATE user_progress SET status = 'paused', updated_at = datetime('now')
     WHERE plan_id = ? AND status = 'active'`,
    [planId]
  );
}

export async function resumePlan(planId: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `UPDATE user_progress SET status = 'active', updated_at = datetime('now')
     WHERE plan_id = ? AND status = 'paused'`,
    [planId]
  );
}

export async function abandonPlan(planId: string): Promise<void> {
  const db = getDatabase();
  await db.runAsync(
    `UPDATE user_progress SET status = 'abandoned', updated_at = datetime('now')
     WHERE plan_id = ? AND status IN ('active', 'paused')`,
    [planId]
  );
}
