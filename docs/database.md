# Davar Database Schema

## Philosophy: Offline-First, Self-Hosted

**No third-party platforms.** Everything we host ourselves.

- **MVP (Phase 1):** 100% local SQLite storage - app works completely offline
- **Phase 2:** Optional PostgreSQL sync server on Railway (self-hosted)
- **Never:** Supabase, Firebase, or other third-party backends

---

## Local Storage (SQLite / Expo SQLite)

The app stores all data locally using SQLite. This is the **primary** data store.

### Schema

```sql
-- ============================================
-- DAVAR LOCAL DATABASE SCHEMA
-- SQLite for React Native (Expo SQLite)
-- ============================================

-- User Preferences (single row, local only)
CREATE TABLE IF NOT EXISTS preferences (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  display_name TEXT,
  theme TEXT DEFAULT 'system',
  font_size INTEGER DEFAULT 16,
  font_family TEXT DEFAULT 'system',
  default_translation TEXT DEFAULT 'WEB',
  notifications_enabled INTEGER DEFAULT 1,
  daily_reminder_time TEXT, -- HH:MM format
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Reading Plans (built-in + user-created)
CREATE TABLE IF NOT EXISTS reading_plans (
  id TEXT PRIMARY KEY, -- UUID
  name TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  schedule TEXT NOT NULL, -- JSON array of daily readings
  is_built_in INTEGER DEFAULT 0, -- 1 for app-provided plans
  created_at TEXT DEFAULT (datetime('now'))
);

-- User Progress on Reading Plans
CREATE TABLE IF NOT EXISTS user_progress (
  id TEXT PRIMARY KEY, -- UUID
  plan_id TEXT NOT NULL REFERENCES reading_plans(id) ON DELETE CASCADE,
  start_date TEXT NOT NULL, -- YYYY-MM-DD
  current_day INTEGER DEFAULT 1,
  completed_days TEXT DEFAULT '[]', -- JSON array of day numbers
  status TEXT DEFAULT 'active', -- active, paused, completed, abandoned
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(plan_id) -- One active progress per plan
);

-- Daily Reading Logs (for streaks & history)
CREATE TABLE IF NOT EXISTS reading_logs (
  id TEXT PRIMARY KEY, -- UUID
  date TEXT NOT NULL, -- YYYY-MM-DD
  passages TEXT NOT NULL, -- JSON array of passage refs read
  duration_minutes INTEGER,
  plan_id TEXT REFERENCES reading_plans(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(date) -- One log entry per day
);

-- Verse Highlights
CREATE TABLE IF NOT EXISTS highlights (
  id TEXT PRIMARY KEY, -- UUID
  verse_ref TEXT NOT NULL, -- e.g., 'GEN.1.1' or 'GEN.1.1-3'
  color TEXT DEFAULT 'yellow', -- yellow, green, blue, pink, purple
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(verse_ref) -- One highlight per verse
);

-- Verse Notes
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY, -- UUID
  verse_ref TEXT NOT NULL, -- Can have multiple notes per verse
  content TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Bookmarks / Favorites
CREATE TABLE IF NOT EXISTS bookmarks (
  id TEXT PRIMARY KEY, -- UUID
  verse_ref TEXT NOT NULL,
  label TEXT, -- Optional user label
  category TEXT, -- prayer, study, memorize, share, etc.
  created_at TEXT DEFAULT (datetime('now')),
  UNIQUE(verse_ref)
);

-- Reading Streaks (calculated/cached)
CREATE TABLE IF NOT EXISTS streaks (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_read_date TEXT, -- YYYY-MM-DD
  total_days_read INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reading_logs_date ON reading_logs(date);
CREATE INDEX IF NOT EXISTS idx_highlights_verse ON highlights(verse_ref);
CREATE INDEX IF NOT EXISTS idx_notes_verse ON notes(verse_ref);
CREATE INDEX IF NOT EXISTS idx_bookmarks_verse ON bookmarks(verse_ref);
CREATE INDEX IF NOT EXISTS idx_bookmarks_category ON bookmarks(category);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
```

---

## Data Formats

### Verse Reference Format
Standard format: `BOOK.CHAPTER.VERSE` or `BOOK.CHAPTER.VERSE-VERSE`

Examples:
- `GEN.1.1` - Genesis 1:1
- `JHN.3.16` - John 3:16
- `PSA.23.1-6` - Psalm 23:1-6
- `ROM.8.28-30` - Romans 8:28-30

Book abbreviations follow standard 3-letter codes (see `/docs/bible-books.md`).

### Schedule Format (Reading Plans)
JSON array where index = day number (0-indexed):

```json
[
  {"day": 1, "passages": ["GEN.1", "GEN.2", "PSA.1"]},
  {"day": 2, "passages": ["GEN.3", "GEN.4", "PSA.2"]},
  // ...
]
```

### Completed Days Format
JSON array of completed day numbers:

```json
[1, 2, 3, 5, 6, 8]  // Days 1-3, 5-6, 8 completed (skipped 4, 7)
```

---

## Streak Calculation Logic

```typescript
function calculateStreak(readingLogs: ReadingLog[]): StreakInfo {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = // ... calculate yesterday's date
  
  // Sort logs by date descending
  const sortedLogs = readingLogs.sort((a, b) => 
    b.date.localeCompare(a.date)
  );
  
  let currentStreak = 0;
  let checkDate = today;
  
  // If didn't read today, start checking from yesterday
  if (!sortedLogs.find(l => l.date === today)) {
    if (!sortedLogs.find(l => l.date === yesterday)) {
      // Streak broken
      return { currentStreak: 0, ... };
    }
    checkDate = yesterday;
  }
  
  // Count consecutive days backward
  for (const log of sortedLogs) {
    if (log.date === checkDate) {
      currentStreak++;
      checkDate = // previous day
    } else if (log.date < checkDate) {
      break; // Gap found, streak ends
    }
  }
  
  return {
    currentStreak,
    longestStreak: Math.max(currentStreak, previousLongest),
    lastReadDate: sortedLogs[0]?.date,
    totalDaysRead: sortedLogs.length
  };
}
```

---

## Phase 2: Cloud Sync (PostgreSQL on Railway)

When we add cloud sync, the schema will be similar but with:
- UUID primary keys
- `user_id` foreign key on all user data tables
- `synced_at` timestamp for conflict resolution
- Row Level Security equivalent in API layer

### Future PostgreSQL Schema

```sql
-- Users table (our own auth, not Supabase)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_sync_at TIMESTAMPTZ
);

-- All other tables get user_id + sync metadata
CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verse_ref TEXT NOT NULL,
  color TEXT DEFAULT 'yellow',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete for sync
  UNIQUE(user_id, verse_ref)
);

-- Sync uses updated_at for conflict resolution
-- "Last write wins" or manual conflict resolution
```

### Sync Strategy (Phase 2)

1. **Local-first:** All writes go to SQLite immediately
2. **Background sync:** Queue changes, sync when online
3. **Conflict resolution:** Last-write-wins with `updated_at`
4. **Soft deletes:** `deleted_at` column for sync, periodic cleanup

---

## Built-in Reading Plans

The app ships with these pre-loaded plans:

1. **Bible in a Year** (365 days) - 3-4 chapters/day
2. **New Testament in 90 Days** (90 days)
3. **Psalms & Proverbs Monthly** (31 days, repeatable)
4. **Gospels in 30 Days** (30 days)
5. **One Chapter a Day** (1189 days) - slow & steady

Plans stored in `/assets/reading-plans/` as JSON files, loaded into SQLite on first launch.

---

## Migration Strategy

For app updates that change schema:

```typescript
const MIGRATIONS = [
  // v1.0.0 - Initial schema
  { version: 1, sql: `CREATE TABLE IF NOT EXISTS...` },
  
  // v1.1.0 - Add category to bookmarks
  { version: 2, sql: `ALTER TABLE bookmarks ADD COLUMN category TEXT` },
  
  // etc.
];

async function runMigrations(db: SQLiteDatabase) {
  const currentVersion = await db.get('PRAGMA user_version');
  
  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      await db.exec(migration.sql);
      await db.exec(`PRAGMA user_version = ${migration.version}`);
    }
  }
}
```

---

## Security Notes

- **Local SQLite:** Data stored in app's private directory, protected by OS
- **No sensitive data:** Bible reading data isn't particularly sensitive
- **Phase 2 auth:** Will use bcrypt for passwords, JWT for sessions
- **No third parties:** We control all data, full stop
