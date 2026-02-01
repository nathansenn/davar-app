/**
 * Passage Reading Screen
 * Full chapter display with interlinear, navigation, and word study
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore, useReadingStore } from '../../src/stores';
import { useUserDataStore } from '../../src/stores/userDataStore';
import { useTheme } from '../../src/lib/theme';
import { bibleService } from '../../src/services/bibleService';
import { ChapterView } from '../../src/components/reading/ChapterView';
import { WordDetailModal } from '../../src/components/study/WordDetailModal';
import { StrongsSearchModal } from '../../src/components/study/StrongsSearchModal';
import { HighlightMenu } from '../../src/components/study/HighlightMenu';
import { NoteEditor } from '../../src/components/study/NoteEditor';
import { AudioControls } from '../../src/components/reading/AudioControls';
import { parseReference, referenceToPath } from '../../src/utils/referenceParser';
import type { TranslationCode, Verse, Chapter, Book } from '../../src/types/bible';
import type { HighlightColor } from '../../src/types';

// Map URL slugs to book IDs
const SLUG_TO_BOOK_ID: Record<string, string> = {
  'genesis': 'GEN', 'exodus': 'EXO', 'leviticus': 'LEV', 'numbers': 'NUM',
  'deuteronomy': 'DEU', 'joshua': 'JOS', 'judges': 'JDG', 'ruth': 'RUT',
  '1-samuel': '1SA', '2-samuel': '2SA', '1-kings': '1KI', '2-kings': '2KI',
  '1-chronicles': '1CH', '2-chronicles': '2CH', 'ezra': 'EZR', 'nehemiah': 'NEH',
  'esther': 'EST', 'job': 'JOB', 'psalms': 'PSA', 'psalm': 'PSA',
  'proverbs': 'PRO', 'ecclesiastes': 'ECC', 'song-of-solomon': 'SNG',
  'isaiah': 'ISA', 'jeremiah': 'JER', 'lamentations': 'LAM', 'ezekiel': 'EZK',
  'daniel': 'DAN', 'hosea': 'HOS', 'joel': 'JOL', 'amos': 'AMO',
  'obadiah': 'OBA', 'jonah': 'JON', 'micah': 'MIC', 'nahum': 'NAM',
  'habakkuk': 'HAB', 'zephaniah': 'ZEP', 'haggai': 'HAG', 'zechariah': 'ZEC',
  'malachi': 'MAL', 'matthew': 'MAT', 'mark': 'MRK', 'luke': 'LUK',
  'john': 'JHN', 'acts': 'ACT', 'romans': 'ROM', '1-corinthians': '1CO',
  '2-corinthians': '2CO', 'galatians': 'GAL', 'ephesians': 'EPH',
  'philippians': 'PHP', 'colossians': 'COL', '1-thessalonians': '1TH',
  '2-thessalonians': '2TH', '1-timothy': '1TI', '2-timothy': '2TI',
  'titus': 'TIT', 'philemon': 'PHM', 'hebrews': 'HEB', 'james': 'JAS',
  '1-peter': '1PE', '2-peter': '2PE', '1-john': '1JN', '2-john': '2JN',
  '3-john': '3JN', 'jude': 'JUD', 'revelation': 'REV',
};

// Reverse mapping for display
const BOOK_ID_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_TO_BOOK_ID).map(([slug, id]) => [id, slug])
);

interface ParsedPassage {
  bookId: string;
  bookName: string;
  chapter: number;
}

function parsePassageSlug(slug: string): ParsedPassage | null {
  if (!slug) return null;
  
  // Handle formats: "genesis-1", "psalm-23", "1-john-3", "john-3-16"
  const parts = slug.toLowerCase().split('-');
  
  // Try to find where the chapter number is
  let bookParts: string[] = [];
  let chapter = 1;
  
  for (let i = 0; i < parts.length; i++) {
    const num = parseInt(parts[i], 10);
    
    // Check if this is a book number prefix (1, 2, 3 for numbered books)
    if (i === 0 && (num === 1 || num === 2 || num === 3) && parts.length > 1) {
      bookParts.push(parts[i]);
      continue;
    }
    
    // If it's a number and we have book parts, it's the chapter
    if (!isNaN(num) && bookParts.length > 0) {
      chapter = num;
      break;
    }
    
    bookParts.push(parts[i]);
  }
  
  const bookSlug = bookParts.join('-');
  const bookId = SLUG_TO_BOOK_ID[bookSlug];
  
  if (!bookId) {
    // Try without trailing numbers for verse references like "john-3-16"
    const altSlug = bookParts.slice(0, -1).join('-');
    const altBookId = SLUG_TO_BOOK_ID[altSlug];
    if (altBookId) {
      return {
        bookId: altBookId,
        bookName: bibleService.getBooks().find(b => b.id === altBookId)?.name || altBookId,
        chapter: parseInt(bookParts[bookParts.length - 1], 10) || 1,
      };
    }
    return null;
  }
  
  const bookMeta = bibleService.getBooks().find(b => b.id === bookId);
  
  return {
    bookId,
    bookName: bookMeta?.name || bookId,
    chapter: Math.max(1, Math.min(chapter, bookMeta?.chapters || 150)),
  };
}

export default function PassageScreen() {
  const { passage } = useLocalSearchParams<{ passage: string }>();
  const router = useRouter();
  const { theme, isDark } = useTheme();
  
  // Settings
  const {
    defaultTranslation,
    fontSizeValue,
    showOriginalLanguage,
    showVerseNumbers,
  } = useSettingsStore();
  
  const { markTodayComplete } = useReadingStore();
  
  // State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parsedPassage, setParsedPassage] = useState<ParsedPassage | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [originalChapter, setOriginalChapter] = useState<Chapter | null>(null);
  const [bookName, setBookName] = useState('');
  const [translation, setTranslation] = useState<TranslationCode>(defaultTranslation as TranslationCode);
  const [showInterlinear, setShowInterlinear] = useState(showOriginalLanguage);
  const [readingComplete, setReadingComplete] = useState(false);
  
  // Word study modal
  const [wordModalVisible, setWordModalVisible] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [selectedStrongsNumber, setSelectedStrongsNumber] = useState<string | undefined>();
  
  // Strong's search modal
  const [strongsSearchVisible, setStrongsSearchVisible] = useState(false);
  const [searchStrongsNumber, setSearchStrongsNumber] = useState('');
  
  // Audio controls
  const [showAudioControls, setShowAudioControls] = useState(false);
  const [highlightedVerse, setHighlightedVerse] = useState<number>(0);
  
  // Highlight/Notes menu
  const [highlightMenuVisible, setHighlightMenuVisible] = useState(false);
  const [noteEditorVisible, setNoteEditorVisible] = useState(false);
  const [selectedVerseForMenu, setSelectedVerseForMenu] = useState<Verse | null>(null);
  
  // User data store
  const {
    addHighlight,
    removeHighlightByRef,
    getHighlight,
    addBookmark,
    removeBookmarkByRef,
    isBookmarked,
    addNote,
    removeNoteByRef,
    getNote,
  } = useUserDataStore();
  
  // Parse passage and load data
  useEffect(() => {
    const loadChapter = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const parsed = parsePassageSlug(passage || '');
        
        if (!parsed) {
          setError('Invalid passage reference');
          setIsLoading(false);
          return;
        }
        
        setParsedPassage(parsed);
        setBookName(parsed.bookName);
        
        // Load main translation
        const chapterData = bibleService.getChapter(
          parsed.bookId,
          parsed.chapter,
          translation
        );
        
        if (!chapterData) {
          setError(`Chapter not found: ${parsed.bookName} ${parsed.chapter}`);
          setIsLoading(false);
          return;
        }
        
        setChapter(chapterData);
        
        // Load original language if enabled
        if (showInterlinear) {
          const originalTranslation = bibleService.getOriginalLanguageTranslation(parsed.bookId);
          const originalData = bibleService.getChapter(
            parsed.bookId,
            parsed.chapter,
            originalTranslation
          );
          setOriginalChapter(originalData);
        } else {
          setOriginalChapter(null);
        }
        
      } catch (err) {
        console.error('Error loading chapter:', err);
        setError('Failed to load chapter');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadChapter();
  }, [passage, translation, showInterlinear]);
  
  // Navigation helpers
  const navigateToChapter = useCallback((bookId: string, chapterNum: number) => {
    const slug = BOOK_ID_TO_SLUG[bookId] || bookId.toLowerCase();
    router.replace(`/read/${slug}-${chapterNum}`);
  }, [router]);
  
  const handlePreviousChapter = useCallback(() => {
    if (!parsedPassage) return;
    
    if (parsedPassage.chapter > 1) {
      navigateToChapter(parsedPassage.bookId, parsedPassage.chapter - 1);
    } else {
      // Go to previous book's last chapter
      const books = bibleService.getBooks();
      const currentIndex = books.findIndex(b => b.id === parsedPassage.bookId);
      if (currentIndex > 0) {
        const prevBook = books[currentIndex - 1];
        navigateToChapter(prevBook.id, prevBook.chapters);
      }
    }
  }, [parsedPassage, navigateToChapter]);
  
  const handleNextChapter = useCallback(() => {
    if (!parsedPassage) return;
    
    const maxChapters = bibleService.getChapterCount(parsedPassage.bookId);
    
    if (parsedPassage.chapter < maxChapters) {
      navigateToChapter(parsedPassage.bookId, parsedPassage.chapter + 1);
    } else {
      // Go to next book's first chapter
      const books = bibleService.getBooks();
      const currentIndex = books.findIndex(b => b.id === parsedPassage.bookId);
      if (currentIndex < books.length - 1) {
        const nextBook = books[currentIndex + 1];
        navigateToChapter(nextBook.id, 1);
      }
    }
  }, [parsedPassage, navigateToChapter]);
  
  // Word press handler
  const handleWordPress = useCallback((verse: Verse, word: string, position: number, strongsNumber?: string) => {
    setSelectedWord(word.replace(/[.,;:!?"'()]/g, '')); // Clean punctuation
    setSelectedVerse(verse);
    setSelectedStrongsNumber(strongsNumber);
    setWordModalVisible(true);
  }, []);
  
  // Navigate to a cross-reference
  const handleNavigateToReference = useCallback((reference: string) => {
    const parsed = parseReference(reference);
    if (parsed) {
      setWordModalVisible(false);
      const path = referenceToPath(parsed);
      // Use replace to avoid deep navigation stack
      router.push(path as any);
    } else {
      Alert.alert('Invalid Reference', `Could not parse reference: ${reference}`);
    }
  }, [router]);
  
  // Search Strong's number across the Bible
  const handleSearchStrongs = useCallback((strongsNumber: string) => {
    setWordModalVisible(false);
    setSearchStrongsNumber(strongsNumber);
    setStrongsSearchVisible(true);
  }, []);
  
  // Toggle interlinear
  const toggleInterlinear = useCallback(() => {
    setShowInterlinear(prev => !prev);
  }, []);
  
  // Mark complete
  const handleMarkComplete = useCallback(() => {
    if (parsedPassage) {
      markTodayComplete([`${bookName} ${parsedPassage.chapter}`]);
      setReadingComplete(true);
    }
  }, [parsedPassage, bookName, markTodayComplete]);
  
  // Translation picker
  const handleTranslationChange = useCallback(() => {
    const translations: TranslationCode[] = ['KJV', 'ASV', 'BBE', 'BSB'];
    const currentIndex = translations.indexOf(translation);
    const nextIndex = (currentIndex + 1) % translations.length;
    setTranslation(translations[nextIndex]);
  }, [translation]);
  
  // Verse long press handler - opens highlight menu
  const handleVerseLongPress = useCallback((verse: Verse) => {
    setSelectedVerseForMenu(verse);
    setHighlightMenuVisible(true);
  }, []);
  
  // Get current verse info for highlight menu
  const selectedVerseNum = selectedVerseForMenu?.number || 0;
  const selectedVerseRef = parsedPassage 
    ? `${bookName} ${parsedPassage.chapter}:${selectedVerseNum}`
    : '';
  const currentHighlight = parsedPassage 
    ? getHighlight(parsedPassage.bookId, parsedPassage.chapter, selectedVerseNum)
    : undefined;
  const currentBookmark = parsedPassage 
    ? isBookmarked(parsedPassage.bookId, parsedPassage.chapter, selectedVerseNum)
    : false;
  const currentNote = parsedPassage 
    ? getNote(parsedPassage.bookId, parsedPassage.chapter, selectedVerseNum)
    : undefined;
  
  // Highlight color selection handler
  const handleSelectHighlightColor = useCallback((color: HighlightColor) => {
    if (!parsedPassage || !selectedVerseForMenu) return;
    addHighlight(parsedPassage.bookId, parsedPassage.chapter, selectedVerseForMenu.number, color);
  }, [parsedPassage, selectedVerseForMenu, addHighlight]);
  
  // Remove highlight handler
  const handleRemoveHighlight = useCallback(() => {
    if (!parsedPassage || !selectedVerseForMenu) return;
    removeHighlightByRef(parsedPassage.bookId, parsedPassage.chapter, selectedVerseForMenu.number);
  }, [parsedPassage, selectedVerseForMenu, removeHighlightByRef]);
  
  // Bookmark handlers
  const handleAddBookmark = useCallback(() => {
    if (!parsedPassage || !selectedVerseForMenu) return;
    addBookmark(parsedPassage.bookId, parsedPassage.chapter, selectedVerseForMenu.number);
  }, [parsedPassage, selectedVerseForMenu, addBookmark]);
  
  const handleRemoveBookmark = useCallback(() => {
    if (!parsedPassage || !selectedVerseForMenu) return;
    removeBookmarkByRef(parsedPassage.bookId, parsedPassage.chapter, selectedVerseForMenu.number);
  }, [parsedPassage, selectedVerseForMenu, removeBookmarkByRef]);
  
  // Note handlers
  const handleAddNote = useCallback(() => {
    setHighlightMenuVisible(false);
    setNoteEditorVisible(true);
  }, []);
  
  const handleSaveNote = useCallback((content: string) => {
    if (!parsedPassage || !selectedVerseForMenu) return;
    addNote(parsedPassage.bookId, parsedPassage.chapter, selectedVerseForMenu.number, content);
  }, [parsedPassage, selectedVerseForMenu, addNote]);
  
  const handleDeleteNote = useCallback(() => {
    if (!parsedPassage || !selectedVerseForMenu) return;
    removeNoteByRef(parsedPassage.bookId, parsedPassage.chapter, selectedVerseForMenu.number);
  }, [parsedPassage, selectedVerseForMenu, removeNoteByRef]);
  
  // Chapter data for ChapterView
  const chapterViewData = useMemo(() => {
    if (!chapter || !parsedPassage) return null;
    
    return {
      book: bookName,
      bookId: parsedPassage.bookId,
      chapter: parsedPassage.chapter,
      verses: chapter.verses,
      translation,
    };
  }, [chapter, parsedPassage, bookName, translation]);
  
  const originalChapterViewData = useMemo(() => {
    if (!originalChapter || !parsedPassage) return undefined;
    
    const originalTranslation = bibleService.getOriginalLanguageTranslation(parsedPassage.bookId);
    return {
      book: bookName,
      bookId: parsedPassage.bookId,
      chapter: parsedPassage.chapter,
      verses: originalChapter.verses,
      translation: originalTranslation,
    };
  }, [originalChapter, parsedPassage, bookName]);
  
  // Determine original language for current book
  const originalLanguage = useMemo(() => {
    if (!parsedPassage) return 'greek';
    return bibleService.getOriginalLanguageForBook(parsedPassage.bookId);
  }, [parsedPassage]);
  
  // Loading state
  if (isLoading) {
    return (
      <View style={[passageStyles.centerContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[passageStyles.loadingText, { color: theme.textMuted }]}>
          Loading scripture...
        </Text>
      </View>
    );
  }
  
  // Error state
  if (error || !chapterViewData) {
    return (
      <>
        <Stack.Screen
          options={{
            headerTitle: 'Error',
          }}
        />
        <View style={[passageStyles.centerContainer, { backgroundColor: theme.background, paddingHorizontal: 24 }]}>
          <Ionicons name="alert-circle" size={64} color={theme.error} />
          <Text style={[passageStyles.errorTitle, { color: theme.error }]}>
            {error || 'Chapter not found'}
          </Text>
          <Text style={[passageStyles.errorSubtitle, { color: theme.textMuted }]}>
            Please try a different passage
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[passageStyles.errorButton, { backgroundColor: theme.primary }]}
          >
            <Text style={passageStyles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }
  
  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: `${bookName} ${parsedPassage?.chapter}`,
          headerRight: () => (
            <View className="flex-row items-center gap-2 mr-2">
              {/* Interlinear Toggle */}
              <TouchableOpacity
                onPress={toggleInterlinear}
                className={`p-2 rounded-lg ${showInterlinear ? 'bg-white/20' : ''}`}
              >
                <Text className="text-white text-xs font-bold">
                  {originalLanguage === 'hebrew' ? 'עב' : 'ελ'}
                </Text>
              </TouchableOpacity>
              
              {/* Translation Badge */}
              <TouchableOpacity
                onPress={handleTranslationChange}
                className="bg-white/20 px-2 py-1 rounded"
              >
                <Text className="text-white text-xs font-semibold">
                  {translation}
                </Text>
              </TouchableOpacity>
              
              {/* Audio Button */}
              <TouchableOpacity
                onPress={() => setShowAudioControls(!showAudioControls)}
                className={`p-2 rounded-lg ${showAudioControls ? 'bg-white/20' : ''}`}
              >
                <Ionicons 
                  name={showAudioControls ? "volume-high" : "volume-medium-outline"} 
                  size={22} 
                  color="#FFFFFF" 
                />
              </TouchableOpacity>
              
              {/* Bookmark */}
              <TouchableOpacity>
                <Ionicons name="bookmark-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <View style={[passageStyles.mainContainer, { backgroundColor: theme.background }]}>
        {/* Chapter View */}
        <ChapterView
          chapter={chapterViewData}
          bookId={parsedPassage!.bookId}
          originalChapter={showInterlinear ? originalChapterViewData : undefined}
          fontSize={fontSizeValue}
          displayMode={showInterlinear ? 'interlinear' : 'verse'}
          onWordPress={handleWordPress}
          onVerseLongPress={handleVerseLongPress}
          onPreviousChapter={handlePreviousChapter}
          onNextChapter={handleNextChapter}
        />
        
        {/* Bottom Bar */}
        <View 
          style={[
            passageStyles.bottomBar,
            { backgroundColor: theme.surface, borderTopColor: theme.border }
          ]}
        >
          <View style={passageStyles.bottomBarContent}>
            {/* Prev/Next Navigation */}
            <TouchableOpacity
              onPress={handlePreviousChapter}
              style={passageStyles.navButton}
            >
              <Ionicons name="chevron-back" size={20} color={theme.primary} />
              <Text style={[passageStyles.navText, { color: theme.primary }]}>Prev</Text>
            </TouchableOpacity>
            
            {/* Complete Button */}
            {readingComplete ? (
              <View style={passageStyles.completeContainer}>
                <Ionicons name="checkmark-circle" size={24} color={theme.success} />
                <Text style={[passageStyles.completeText, { color: theme.success }]}>
                  Complete! 🎉
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleMarkComplete}
                style={[passageStyles.markCompleteBtn, { backgroundColor: theme.primary + '15' }]}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color={theme.primary} />
                <Text style={[passageStyles.markCompleteText, { color: theme.primary }]}>
                  Mark Complete
                </Text>
              </TouchableOpacity>
            )}
            
            {/* Next Navigation */}
            <TouchableOpacity
              onPress={handleNextChapter}
              style={passageStyles.navButton}
            >
              <Text style={[passageStyles.navText, { color: theme.primary }]}>Next</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Audio Controls */}
        {chapter && (
          <AudioControls
            verses={chapter.verses}
            chapterTitle={`${bookName} ${parsedPassage?.chapter}`}
            visible={showAudioControls}
            onVisibilityChange={setShowAudioControls}
            onVerseHighlight={setHighlightedVerse}
          />
        )}
        
        {/* Word Study Modal */}
        <WordDetailModal
          visible={wordModalVisible}
          onClose={() => setWordModalVisible(false)}
          word={selectedWord}
          strongsNumber={selectedStrongsNumber}
          context={selectedVerse ? {
            verse: `${bookName} ${parsedPassage?.chapter}:${selectedVerse.number}`,
            translation,
            bookId: parsedPassage?.bookId,
            chapter: parsedPassage?.chapter,
            verseNum: selectedVerse.number,
            verseText: selectedVerse.text,  // Pass the verse text!
          } : undefined}
          onNavigateToReference={handleNavigateToReference}
          onSearchStrongs={handleSearchStrongs}
        />
        
        {/* Strong's Search Modal */}
        <StrongsSearchModal
          visible={strongsSearchVisible}
          onClose={() => setStrongsSearchVisible(false)}
          strongsNumber={searchStrongsNumber}
          onNavigateToVerse={(ref) => {
            setStrongsSearchVisible(false);
            handleNavigateToReference(ref);
          }}
        />
        
        {/* Highlight Menu */}
        <HighlightMenu
          visible={highlightMenuVisible}
          onClose={() => setHighlightMenuVisible(false)}
          onSelectColor={handleSelectHighlightColor}
          onRemoveHighlight={handleRemoveHighlight}
          onAddBookmark={handleAddBookmark}
          onRemoveBookmark={handleRemoveBookmark}
          onAddNote={handleAddNote}
          currentColor={currentHighlight?.color}
          isBookmarked={currentBookmark}
          hasNote={!!currentNote}
          verse={selectedVerseRef}
        />
        
        {/* Note Editor */}
        <NoteEditor
          visible={noteEditorVisible}
          onClose={() => setNoteEditorVisible(false)}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
          verse={selectedVerseRef}
          verseText={selectedVerseForMenu?.text}
          initialContent={currentNote?.content || ''}
          isEditing={!!currentNote}
        />
      </View>
    </>
  );
}

const passageStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  errorSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  errorButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  bottomBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navText: {
    fontWeight: '500',
    marginHorizontal: 4,
  },
  completeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  completeText: {
    fontWeight: '600',
    marginLeft: 8,
  },
  markCompleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  markCompleteText: {
    fontWeight: '600',
    marginLeft: 8,
  },
});
