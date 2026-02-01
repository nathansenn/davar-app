/**
 * Services index
 */

export * from './bibleService';
export * from './strongsService';

// Export planService functions (excluding StreakInfo to avoid duplicate)
export {
  type Passage,
  type DayReading,
  type PlanWithProgress,
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

// Export database types and functions
export { 
  initDatabase,
  getDatabase,
  type Preferences,
  type ReadingPlan,
  type ReadingLog,
  type UserProgress,
  type DaySchedule,
  type PassageRef,
  type StreakInfo,
  type Highlight,
  type Note,
  type Bookmark,
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
} from './database';
