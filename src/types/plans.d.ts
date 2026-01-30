/**
 * Type declarations for reading plan JSON files
 */

declare module '*.json' {
  const value: {
    id: string;
    name: string;
    description: string;
    durationDays: number;
    isRepeating?: boolean;
    schedule: Array<{
      day: number;
      passages: Array<{
        bookId: string;
        startChapter: number;
        endChapter?: number;
      }>;
    }>;
  };
  export default value;
}
