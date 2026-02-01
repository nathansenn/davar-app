/**
 * VerseText Component
 * Enhanced verse display with word study, highlighting, and formatting support
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, getHighlightColor } from '../../lib/theme';
import type { HighlightColor } from '../../types';

interface Verse {
  number: number;
  text: string;
  verse?: number;  // Alias for number
}

interface VerseTextProps {
  verse: Verse;
  bookId?: string;
  chapter?: number;
  isHighlighted?: boolean;
  highlightColor?: HighlightColor;
  hasNote?: boolean;
  hasBookmark?: boolean;
  fontSize?: number;
  lineHeight?: number;
  onWordPress?: (word: string, position: number) => void;
  onLongPress?: () => void;
  onVersePress?: () => void;
  showVerseNumber?: boolean;
  isRedLetter?: boolean;
  isParagraphStart?: boolean;
  isPoetry?: boolean;
  displayMode?: 'verse' | 'paragraph' | 'interlinear';
  style?: ViewStyle;
}

export function VerseText({
  verse,
  bookId,
  chapter,
  isHighlighted = false,
  highlightColor = 'yellow',
  hasNote = false,
  hasBookmark = false,
  fontSize = 18,
  lineHeight,
  onWordPress,
  onLongPress,
  onVersePress,
  showVerseNumber = true,
  isRedLetter = false,
  isParagraphStart = false,
  isPoetry = false,
  displayMode = 'verse',
  style,
}: VerseTextProps) {
  const { theme, isDark } = useTheme();
  const [pressedWordIndex, setPressedWordIndex] = useState<number | null>(null);

  const handleWordPress = useCallback(
    (word: string, index: number) => {
      if (onWordPress) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onWordPress(word, index);
      }
    },
    [onWordPress]
  );

  const handleLongPress = useCallback(() => {
    if (onLongPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    }
  }, [onLongPress]);

  const handleVersePress = useCallback(() => {
    if (onVersePress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onVersePress();
    }
  }, [onVersePress]);

  // Split text into words for individual word tapping
  const words = useMemo(() => verse.text.split(/(\s+)/), [verse.text]);

  const backgroundColor = isHighlighted
    ? getHighlightColor(highlightColor, isDark)
    : 'transparent';

  // Calculate line height based on font size
  const calculatedLineHeight = lineHeight || fontSize * 1.7;

  // Text color - red for Jesus' words if enabled
  const textColor = isRedLetter ? '#DC2626' : theme.text;

  // Poetry indentation
  const poetryStyle = isPoetry ? styles.poetryIndent : null;

  // Paragraph mode: no margin except for paragraph starts
  const paragraphStyle = displayMode === 'paragraph' 
    ? (isParagraphStart ? styles.paragraphStart : styles.paragraphContinue)
    : null;

  const verseNumber = verse.verse || verse.number;

  return (
    <TouchableOpacity
      onPress={handleVersePress}
      onLongPress={handleLongPress}
      activeOpacity={0.9}
      delayLongPress={500}
      style={[
        styles.container,
        {
          backgroundColor,
          borderRadius: isHighlighted ? 4 : 0,
          paddingHorizontal: isHighlighted ? 4 : 0,
          marginHorizontal: isHighlighted ? -4 : 0,
        },
        poetryStyle,
        paragraphStyle,
        style,
      ]}
    >
      <View style={styles.verseContent}>
        {/* Verse Number */}
        {showVerseNumber && (
          <Text
            style={[
              styles.verseNumber,
              {
                color: theme.verseNumber,
                fontSize: fontSize * 0.65,
                lineHeight: calculatedLineHeight,
              },
            ]}
          >
            {verseNumber}
          </Text>
        )}

        {/* Verse Text with Tappable Words */}
        <Text
          style={[
            styles.verseText,
            {
              fontSize,
              lineHeight: calculatedLineHeight,
              color: textColor,
            },
          ]}
        >
          {onWordPress
            ? words.map((segment, index) => {
                // Check if segment is whitespace
                if (/^\s+$/.test(segment)) {
                  return segment;
                }

                return (
                  <Text
                    key={index}
                    onPress={() => handleWordPress(segment, index)}
                    onPressIn={() => setPressedWordIndex(index)}
                    onPressOut={() => setPressedWordIndex(null)}
                    style={[
                      pressedWordIndex === index && {
                        backgroundColor: theme.surfaceSecondary,
                        borderRadius: 2,
                      },
                    ]}
                  >
                    {segment}
                  </Text>
                );
              })
            : verse.text}
        </Text>

        {/* Indicators */}
        <View style={styles.indicators}>
          {/* Note Indicator */}
          {hasNote && (
            <View
              style={[
                styles.indicator,
                { backgroundColor: theme.secondary },
              ]}
            >
              <Text style={styles.indicatorIcon}>📝</Text>
            </View>
          )}

          {/* Bookmark Indicator */}
          {hasBookmark && (
            <View
              style={[
                styles.indicator,
                { backgroundColor: theme.primary + '20' },
              ]}
            >
              <Text style={styles.indicatorIcon}>🔖</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 2,
  },
  verseContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  verseNumber: {
    fontWeight: '700',
    marginRight: 6,
    fontFamily: 'System',
    verticalAlign: 'top',
  },
  verseText: {
    flex: 1,
    fontFamily: 'System', // Will be replaced with Literata when loaded
  },
  indicators: {
    flexDirection: 'row',
    marginLeft: 4,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  indicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  indicatorIcon: {
    fontSize: 10,
  },
  // Poetry formatting
  poetryIndent: {
    paddingLeft: 24,
  },
  // Paragraph mode
  paragraphStart: {
    marginTop: 16,
  },
  paragraphContinue: {
    marginTop: 0,
  },
});

export default VerseText;
