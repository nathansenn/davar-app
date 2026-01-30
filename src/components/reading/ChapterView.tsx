/**
 * ChapterView Component
 * Full chapter display with scrolling, gestures, and verse interactions
 */

import React, { useRef, useCallback, useMemo } from 'react';
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
import type { Chapter, Verse, HighlightColor } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface VerseAnnotation {
  verseRef: string;
  highlightColor?: HighlightColor;
  hasNote?: boolean;
}

interface ChapterViewProps {
  chapter: Chapter;
  annotations?: Map<string, VerseAnnotation>;
  fontSize?: number;
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
  annotations = new Map(),
  fontSize = 18,
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

  // Get annotation for a verse
  const getAnnotation = useCallback(
    (verse: Verse): VerseAnnotation | undefined => {
      const ref = `${verse.book} ${verse.chapter}:${verse.verse}`;
      return annotations.get(ref);
    },
    [annotations]
  );

  // Swipe gesture handler for chapter navigation
  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number }
  >({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      // Only allow horizontal swipe if at scroll boundaries
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

  // Memoize verses to prevent unnecessary re-renders
  const renderedVerses = useMemo(() => {
    return chapter.verses.map((verse) => {
      const annotation = getAnnotation(verse);
      return (
        <VerseText
          key={`${verse.chapter}:${verse.verse}`}
          verse={verse}
          fontSize={fontSize}
          isHighlighted={!!annotation?.highlightColor}
          highlightColor={annotation?.highlightColor}
          hasNote={annotation?.hasNote}
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
  }, [chapter.verses, fontSize, annotations, onWordPress, onVerseLongPress, onVersePress, getAnnotation]);

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

          {/* Verses */}
          <ScrollView
            ref={scrollRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
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
  translationBadge: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
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
  verse: {
    marginBottom: 8,
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
