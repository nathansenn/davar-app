/**
 * User Data Store
 * Manages bookmarks, highlights, and notes with AsyncStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Bookmark, Highlight, Note, HighlightColor } from '../types/ui';

// Generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Create reference string
const createRef = (bookId: string, chapter: number, verse: number) => 
  `${bookId} ${chapter}:${verse}`;

interface UserDataState {
  // Data
  bookmarks: Bookmark[];
  highlights: Highlight[];
  notes: Note[];

  // Bookmark actions
  addBookmark: (bookId: string, chapter: number, verse: number, label?: string) => void;
  removeBookmark: (id: string) => void;
  removeBookmarkByRef: (bookId: string, chapter: number, verse: number) => void;
  isBookmarked: (bookId: string, chapter: number, verse: number) => boolean;
  getBookmark: (bookId: string, chapter: number, verse: number) => Bookmark | undefined;

  // Highlight actions
  addHighlight: (bookId: string, chapter: number, verse: number, color: HighlightColor) => void;
  updateHighlightColor: (id: string, color: HighlightColor) => void;
  removeHighlight: (id: string) => void;
  removeHighlightByRef: (bookId: string, chapter: number, verse: number) => void;
  getHighlight: (bookId: string, chapter: number, verse: number) => Highlight | undefined;
  getHighlightsByChapter: (bookId: string, chapter: number) => Highlight[];

  // Note actions
  addNote: (bookId: string, chapter: number, verse: number, content: string) => void;
  updateNote: (id: string, content: string) => void;
  removeNote: (id: string) => void;
  removeNoteByRef: (bookId: string, chapter: number, verse: number) => void;
  getNote: (bookId: string, chapter: number, verse: number) => Note | undefined;
  getNotesByChapter: (bookId: string, chapter: number) => Note[];

  // Bulk actions
  clearAllData: () => void;
  exportData: () => { bookmarks: Bookmark[]; highlights: Highlight[]; notes: Note[] };
  importData: (data: { bookmarks?: Bookmark[]; highlights?: Highlight[]; notes?: Note[] }) => void;
}

export const useUserDataStore = create<UserDataState>()(
  persist(
    (set, get) => ({
      // Initial state
      bookmarks: [],
      highlights: [],
      notes: [],

      // ==========================================
      // BOOKMARK ACTIONS
      // ==========================================

      addBookmark: (bookId, chapter, verse, label) => {
        const reference = createRef(bookId, chapter, verse);
        const existing = get().bookmarks.find(b => b.reference === reference);
        if (existing) return; // Don't duplicate

        const bookmark: Bookmark = {
          id: generateId(),
          reference,
          bookId,
          chapter,
          verse,
          createdAt: Date.now(),
          label,
        };

        set(state => ({
          bookmarks: [...state.bookmarks, bookmark].sort((a, b) => b.createdAt - a.createdAt),
        }));
      },

      removeBookmark: (id) => {
        set(state => ({
          bookmarks: state.bookmarks.filter(b => b.id !== id),
        }));
      },

      removeBookmarkByRef: (bookId, chapter, verse) => {
        const reference = createRef(bookId, chapter, verse);
        set(state => ({
          bookmarks: state.bookmarks.filter(b => b.reference !== reference),
        }));
      },

      isBookmarked: (bookId, chapter, verse) => {
        const reference = createRef(bookId, chapter, verse);
        return get().bookmarks.some(b => b.reference === reference);
      },

      getBookmark: (bookId, chapter, verse) => {
        const reference = createRef(bookId, chapter, verse);
        return get().bookmarks.find(b => b.reference === reference);
      },

      // ==========================================
      // HIGHLIGHT ACTIONS
      // ==========================================

      addHighlight: (bookId, chapter, verse, color) => {
        const reference = createRef(bookId, chapter, verse);
        const existing = get().highlights.find(h => h.reference === reference);
        
        if (existing) {
          // Update existing highlight color
          set(state => ({
            highlights: state.highlights.map(h =>
              h.reference === reference ? { ...h, color } : h
            ),
          }));
          return;
        }

        const highlight: Highlight = {
          id: generateId(),
          reference,
          bookId,
          chapter,
          verse,
          color,
          createdAt: Date.now(),
        };

        set(state => ({
          highlights: [...state.highlights, highlight],
        }));
      },

      updateHighlightColor: (id, color) => {
        set(state => ({
          highlights: state.highlights.map(h =>
            h.id === id ? { ...h, color } : h
          ),
        }));
      },

      removeHighlight: (id) => {
        set(state => ({
          highlights: state.highlights.filter(h => h.id !== id),
        }));
      },

      removeHighlightByRef: (bookId, chapter, verse) => {
        const reference = createRef(bookId, chapter, verse);
        set(state => ({
          highlights: state.highlights.filter(h => h.reference !== reference),
        }));
      },

      getHighlight: (bookId, chapter, verse) => {
        const reference = createRef(bookId, chapter, verse);
        return get().highlights.find(h => h.reference === reference);
      },

      getHighlightsByChapter: (bookId, chapter) => {
        return get().highlights.filter(
          h => h.bookId === bookId && h.chapter === chapter
        );
      },

      // ==========================================
      // NOTE ACTIONS
      // ==========================================

      addNote: (bookId, chapter, verse, content) => {
        const reference = createRef(bookId, chapter, verse);
        const existing = get().notes.find(n => n.reference === reference);
        
        if (existing) {
          // Update existing note
          set(state => ({
            notes: state.notes.map(n =>
              n.reference === reference
                ? { ...n, content, updatedAt: Date.now() }
                : n
            ),
          }));
          return;
        }

        const now = Date.now();
        const note: Note = {
          id: generateId(),
          reference,
          bookId,
          chapter,
          verse,
          content,
          createdAt: now,
          updatedAt: now,
        };

        set(state => ({
          notes: [...state.notes, note],
        }));
      },

      updateNote: (id, content) => {
        set(state => ({
          notes: state.notes.map(n =>
            n.id === id ? { ...n, content, updatedAt: Date.now() } : n
          ),
        }));
      },

      removeNote: (id) => {
        set(state => ({
          notes: state.notes.filter(n => n.id !== id),
        }));
      },

      removeNoteByRef: (bookId, chapter, verse) => {
        const reference = createRef(bookId, chapter, verse);
        set(state => ({
          notes: state.notes.filter(n => n.reference !== reference),
        }));
      },

      getNote: (bookId, chapter, verse) => {
        const reference = createRef(bookId, chapter, verse);
        return get().notes.find(n => n.reference === reference);
      },

      getNotesByChapter: (bookId, chapter) => {
        return get().notes.filter(
          n => n.bookId === bookId && n.chapter === chapter
        );
      },

      // ==========================================
      // BULK ACTIONS
      // ==========================================

      clearAllData: () => {
        set({ bookmarks: [], highlights: [], notes: [] });
      },

      exportData: () => {
        const state = get();
        return {
          bookmarks: state.bookmarks,
          highlights: state.highlights,
          notes: state.notes,
        };
      },

      importData: (data) => {
        set(state => ({
          bookmarks: data.bookmarks || state.bookmarks,
          highlights: data.highlights || state.highlights,
          notes: data.notes || state.notes,
        }));
      },
    }),
    {
      name: 'davar-user-data',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Hook to get all annotations for a chapter (for ChapterView)
export const useChapterAnnotations = (bookId: string, chapter: number) => {
  const { highlights, notes, bookmarks } = useUserDataStore();
  
  const chapterHighlights = highlights.filter(
    h => h.bookId === bookId && h.chapter === chapter
  );
  
  const chapterNotes = notes.filter(
    n => n.bookId === bookId && n.chapter === chapter
  );
  
  const chapterBookmarks = bookmarks.filter(
    b => b.bookId === bookId && b.chapter === chapter
  );

  // Create a map for quick lookup
  const annotationMap = new Map<string, {
    highlight?: Highlight;
    note?: Note;
    bookmark?: Bookmark;
  }>();

  chapterHighlights.forEach(h => {
    annotationMap.set(h.reference, { ...annotationMap.get(h.reference), highlight: h });
  });

  chapterNotes.forEach(n => {
    annotationMap.set(n.reference, { ...annotationMap.get(n.reference), note: n });
  });

  chapterBookmarks.forEach(b => {
    annotationMap.set(b.reference, { ...annotationMap.get(b.reference), bookmark: b });
  });

  return annotationMap;
};
