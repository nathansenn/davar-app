/**
 * ChapterView Component
 * Full chapter display with multiple display modes, gestures, and verse interactions
 */

import React, { useRef, useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../lib/theme';
import { VerseText } from './VerseText';
import { InterlinearVerse } from './InterlinearVerse';
import { useSettingsStore, LINE_SPACING_VALUES } from '../../stores/settingsStore';
import { useChapterAnnotations } from '../../stores/userDataStore';
import { POETRY_BOOKS, DEFAULT_PARAGRAPH_BREAKS } from '../../types/bible';
import type { HighlightColor, DisplayMode } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface Verse {
  number: number;
  text: string;
  verse?: number;
}

interface Chapter {
  book: string;
  bookId?: string;
  chapter: number;
  verses: Verse[];
  translation: string;
}

interface ChapterViewProps {
  chapter: Chapter;
  bookId: string;
  originalChapter?: Chapter; // Optional original language chapter for interlinear
  fontSize?: number;
  displayMode?: DisplayMode;
  onWordPress?: (verse: Verse, word: string, position: number) => void;
  onVerseLongPress?: (verse: Verse) => void;
  onVersePress?: (verse: Verse) => void;
  onPreviousChapter?: () => void;
  onNextChapter?: () => void;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
  style?: ViewStyle;
}

export function ChapterView({
  chapter,
  bookId,
  originalChapter,
  fontSize: propFontSize,
  displayMode: propDisplayMode,
  onWordPress,
  onVerseLongPress,
  onVersePress,
  onPreviousChapter,
  onNextChapter,
  onRefresh,
  isRefreshing = false,
  style,
}: ChapterViewProps) {
  const { theme } = useTheme();
  const scrollRef = useRef<ScrollView>(null);
  const translateX = useSharedValue(0);

  // Get settings
  const {
    fontSizeValue,
    displayMode: settingsDisplayMode,
    poetryFormatting,
    showRedLetter,
    lineSpacing,
    showVerseNumbers,
    showOriginalLanguage,
    originalLanguagePosition,
    showTransliteration,
  } = useSettingsStore();

  // Use prop values or fall back to settings
  const fontSize = propFontSize || fontSizeValue;
  const displayMode = propDisplayMode || settingsDisplayMode;

  // Get user annotations for this chapter
  const annotations = useChapterAnnotations(bookId, chapter.chapter);

  // Check if this is a poetry book
  const isPoetryBook = POETRY_BOOKS.includes(bookId);

  // Get paragraph breaks for this chapter
  const paragraphBreaks = DEFAULT_PARAGRAPH_BREAKS[bookId]?.[chapter.chapter] || [];

  // Calculate line height
  const lineHeight = fontSize * LINE_SPACING_VALUES[lineSpacing];

  // Swipe gesture handler for chapter navigation
  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number }
  >({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX * 0.3;
    },
    onEnd: (event) => {
      if (event.translationX > SWIPE_THRESHOLD && onPreviousChapter) {
        runOnJS(onPreviousChapter)();
      } else if (event.translationX < -SWIPE_THRESHOLD && onNextChapter) {
        runOnJS(onNextChapter)();
      }
      translateX.value = withSpring(0, { damping: 20 });
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      await onRefresh();
    }
  }, [onRefresh]);

  // Render verses based on display mode
  const renderedVerses = useMemo(() => {
    return chapter.verses.map((verse, index) => {
      const verseNum = verse.verse || verse.number;
      const ref = `${bookId} ${chapter.chapter}:${verseNum}`;
      const annotation = annotations.get(ref);
      
      const isHighlighted = !!annotation?.highlight;
      const highlightColor = annotation?.highlight?.color as HighlightColor | undefined;
      const hasNote = !!annotation?.note;
      const hasBookmark = !!annotation?.bookmark;
      
      // Poetry formatting (for poetry books)
      const isPoetry = poetryFormatting && isPoetryBook;
      
      // Paragraph starts (for paragraph mode)
      const isParagraphStart = paragraphBreaks.includes(verseNum) || verseNum === 1;

      // Interlinear mode
      if (displayMode === 'interlinear' && showOriginalLanguage) {
        const originalVerse = originalChapter?.verses.find(
          v => (v.verse || v.number) === verseNum
        );
        const originalLanguage = bookId.match(/^(GEN|EXO|LEV|NUM|DEU|JOS|JDG|RUT|1SA|2SA|1KI|2KI|1CH|2CH|EZR|NEH|EST|JOB|PSA|PRO|ECC|SNG|ISA|JER|LAM|EZK|DAN|HOS|JOL|AMO|OBA|JON|MIC|NAM|HAB|ZEP|HAG|ZEC|MAL)$/)
          ? 'hebrew' as const
          : 'greek' as const;

        return (
          <InterlinearVerse
            key={`${chapter.chapter}:${verseNum}`}
            verseNumber={verseNum}
            englishText={verse.text}
            originalText={originalVerse?.text}
            originalLanguage={originalLanguage}
            fontSize={fontSize}
            showTransliteration={showTransliteration}
            originalPosition={originalLanguagePosition === 'inline' ? 'above' : originalLanguagePosition}
            onWordPress={onWordPress ? (word, pos) => {
              // Convert TaggedWord to simple params
              onWordPress(verse, word.text, pos);
            } : undefined}
            style={styles.verse}
          />
        );
      }

      // Standard verse display
      return (
        <VerseText
          key={`${chapter.chapter}:${verseNum}`}
          verse={verse}
          bookId={bookId}
          chapter={chapter.chapter}
          fontSize={fontSize}
          lineHeight={lineHeight}
          isHighlighted={isHighlighted}
          highlightColor={highlightColor}
          hasNote={hasNote}
          hasBookmark={hasBookmark}
          showVerseNumber={showVerseNumbers}
          isPoetry={isPoetry}
          isParagraphStart={isParagraphStart}
          displayMode={displayMode}
          onWordPress={
            onWordPress
              ? (word, position) => onWordPress(verse, word, position)
              : undefined
          }
          onLongPress={
            onVerseLongPress
              ? () => onVerseLongPress(verse)
              : undefined
          }
          onVersePress={
            onVersePress
              ? () => onVersePress(verse)
              : undefined
          }
          style={styles.verse}
        />
      );
    });
  }, [
    chapter.verses,
    chapter.chapter,
    bookId,
    fontSize,
    lineHeight,
    displayMode,
    annotations,
    poetryFormatting,
    isPoetryBook,
    paragraphBreaks,
    showVerseNumbers,
    showOriginalLanguage,
    originalLanguagePosition,
    showTransliteration,
    originalChapter,
    onWordPress,
    onVerseLongPress,
    onVersePress,
  ]);

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <PanGestureHandler
        onGestureEvent={gestureHandler}
        activeOffsetX={[-20, 20]}
        failOffsetY={[-10, 10]}
      >
        <Animated.View style={[styles.container, animatedStyle, style]}>
          {/* Chapter Header */}
          <View style={styles.header}>
            <Text
              style={[
                styles.headerText,
                { color: theme.text },
              ]}
            >
              {chapter.book} {chapter.chapter}
            </Text>
            <View style={styles.headerBadges}>
              {displayMode !== 'verse' && (
                <Text
                  style={[
                    styles.modeBadge,
                    {
                      color: theme.textMuted,
                      backgroundColor: theme.surfaceSecondary,
                    },
                  ]}
                >
                  {displayMode === 'paragraph' ? '¶' : '≡'}
                </Text>
              )}
              <Text
                style={[
                  styles.translationBadge,
                  {
                    color: theme.textMuted,
                    backgroundColor: theme.surfaceSecondary,
                  },
                ]}
              >
                {chapter.translation}
              </Text>
            </View>
          </View>

          {/* Verses */}
          <ScrollView
            ref={scrollRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              displayMode === 'paragraph' && styles.paragraphContent,
            ]}
            showsVerticalScrollIndicator={false}
            refreshControl={
              onRefresh ? (
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={handleRefresh}
                  tintColor={theme.primary}
                  colors={[theme.primary]}
                />
              ) : undefined
            }
          >
            {renderedVerses}
            
            {/* Bottom padding for comfortable reading */}
            <View style={styles.bottomPadding} />
          </ScrollView>

          {/* Navigation hints */}
          {(onPreviousChapter || onNextChapter) && (
            <View style={styles.navHints}>
              {onPreviousChapter && (
                <Text style={[styles.navHint, { color: theme.textMuted }]}>
                  ← Swipe for previous
                </Text>
              )}
              {onNextChapter && (
                <Text style={[styles.navHint, { color: theme.textMuted }]}>
                  Swipe for next →
                </Text>
              )}
            </View>
          )}
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  translationBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modeBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  paragraphContent: {
    paddingHorizontal: 24,
  },
  verse: {
    marginBottom: 8,
  },
  paragraphVerse: {
    marginBottom: 0,
  },
  bottomPadding: {
    height: 100,
  },
  navHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  navHint: {
    fontSize: 12,
  },
});

export default ChapterView;
