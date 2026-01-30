/**
 * VerseText Component
 * Single verse display with tap-for-details and highlighting support
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, getHighlightColor } from '../../lib/theme';
import type { Verse, HighlightColor } from '../../types';

interface VerseTextProps {
  verse: Verse;
  isHighlighted?: boolean;
  highlightColor?: HighlightColor;
  hasNote?: boolean;
  fontSize?: number;
  onWordPress?: (word: string, position: number) => void;
  onLongPress?: () => void;
  onVersePress?: () => void;
  showVerseNumber?: boolean;
  style?: ViewStyle;
}

export function VerseText({
  verse,
  isHighlighted = false,
  highlightColor = 'yellow',
  hasNote = false,
  fontSize = 18,
  onWordPress,
  onLongPress,
  onVersePress,
  showVerseNumber = true,
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
  const words = verse.text.split(/(\s+)/);

  const backgroundColor = isHighlighted
    ? getHighlightColor(highlightColor, isDark)
    : 'transparent';

  // Calculate line height based on font size
  const lineHeight = fontSize * 1.8;

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
                fontSize: fontSize * 0.7,
                lineHeight,
              },
            ]}
          >
            {verse.verse}
          </Text>
        )}

        {/* Verse Text with Tappable Words */}
        <Text
          style={[
            styles.verseText,
            {
              fontSize,
              lineHeight,
              color: theme.text,
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

        {/* Note Indicator */}
        {hasNote && (
          <View
            style={[
              styles.noteIndicator,
              { backgroundColor: theme.secondary },
            ]}
          >
            <Text style={styles.noteIcon}>📝</Text>
          </View>
        )}
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
  },
  verseText: {
    flex: 1,
    fontFamily: 'System', // Will be replaced with Literata when loaded
  },
  noteIndicator: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  noteIcon: {
    fontSize: 10,
  },
});

export default VerseText;
