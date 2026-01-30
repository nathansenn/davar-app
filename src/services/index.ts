/**
 * Services Index
 * 
 * Central export for all Davar services.
 */

// Database
export {
  initDatabase,
  getDatabase,
  getPreferences,
  updatePreferences,
  getHighlights,
  getHighlight,
  setHighlight,
  removeHighlight,
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  getBookmarks,
  addBookmark,
  removeBookmark,
  logReading,
  getReadingLogs,
  getStreaks,
  getReadingPlans,
  getReadingPlan,
  createReadingPlan,
  startPlan,
  getProgress,
  getAllProgress,
  completeDay,
  pausePlan,
  resumePlan,
  abandonPlan,
} from './database';

export type {
  Preferences,
  ReadingPlan,
  DaySchedule,
  PassageRef,
  UserProgress,
  ReadingLog,
  Highlight,
  Note,
  Bookmark,
  StreakInfo,
} from './database';

// Plan Service
export {
  getAvailablePlans,
  getPlanById,
  getTodaysReading,
  calculateProgress,
  calculateStreak,
  getPlansWithProgress,
  getDayReading,
  formatPassagesForDisplay,
  estimateReadingTime,
  seedBuiltInPlans,
} from './planService';

export type {
  Passage,
  DayReading,
  PlanWithProgress,
} from './planService';

// Bible Service
export { bibleService, BibleService } from './bibleService';

export type {
  BibleData,
  Book,
  Chapter,
  Verse,
  BookMetadata,
  BibleMetadata,
  SearchResult,
  VerseRef,
  TranslationCode,
  TranslationInfo,
} from '../types/bible';
