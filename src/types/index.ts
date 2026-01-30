/**
 * Types index
 */

export * from './bible';
export * from './ui';

// Re-export extended types with simpler names for component use
export type { ExtendedVerse as Verse, ExtendedChapter as Chapter } from './ui';
