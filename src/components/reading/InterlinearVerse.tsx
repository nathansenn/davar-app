/**
 * InterlinearVerse Component
 * Shows original language text aligned with English translation
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import type { TaggedWord } from '../../types/bible';

interface InterlinearVerseProps {
  verseNumber: number;
  englishText: string;
  originalText?: string;
  originalLanguage?: 'hebrew' | 'greek';
  words?: TaggedWord[];
  fontSize?: number;
  showTransliteration?: boolean;
  originalPosition?: 'above' | 'below';
  onWordPress?: (word: TaggedWord, index: number) => void;
  style?: ViewStyle;
}

export function InterlinearVerse({
  verseNumber,
  englishText,
  originalText,
  originalLanguage = 'greek',
  words,
  fontSize = 18,
  showTransliteration = true,
  originalPosition = 'above',
  onWordPress,
  style,
}: InterlinearVerseProps) {
  const { theme } = useTheme();

  const handleWordPress = (word: TaggedWord, index: number) => {
    if (onWordPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onWordPress(word, index);
    }
  };

  // Calculate sizes
  const originalFontSize = fontSize * 1.1;
  const translitFontSize = fontSize * 0.7;
  const lineHeight = fontSize * 1.6;

  // If we have word-by-word data, render interlinear word grid
  if (words && words.length > 0) {
    return (
      <View style={[styles.container, style]}>
        {/* Verse Number */}
        <Text
          style={[
            styles.verseNumber,
            {
              color: theme.verseNumber,
              fontSize: fontSize * 0.65,
            },
          ]}
        >
          {verseNumber}
        </Text>

        {/* Word Grid */}
        <View style={styles.wordGrid}>
          {words.map((word, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.wordBlock,
                { backgroundColor: theme.surfaceSecondary },
              ]}
              onPress={() => handleWordPress(word, index)}
              activeOpacity={0.7}
            >
              {originalPosition === 'above' && (
                <>
                  {/* Original Word */}
                  <Text
                    style={[
                      styles.originalWord,
                      {
                        color: theme.primary,
                        fontSize: originalFontSize,
                        fontFamily: originalLanguage === 'hebrew' 
                          ? 'System' // Would use Hebrew font
                          : 'System', // Would use Greek font
                        textAlign: originalLanguage === 'hebrew' ? 'right' : 'center',
                      },
                    ]}
                  >
                    {word.lemma || word.text}
                  </Text>

                  {/* Transliteration */}
                  {showTransliteration && word.translit && (
                    <Text
                      style={[
                        styles.transliteration,
                        {
                          color: theme.textMuted,
                          fontSize: translitFontSize,
                        },
                      ]}
                    >
                      {word.translit}
                    </Text>
                  )}

                  {/* Strong's Number */}
                  {word.strongs && (
                    <Text
                      style={[
                        styles.strongsTag,
                        {
                          color: theme.secondary,
                          fontSize: translitFontSize * 0.9,
                        },
                      ]}
                    >
                      {word.strongs}
                    </Text>
                  )}

                  {/* English Word */}
                  <Text
                    style={[
                      styles.englishWord,
                      {
                        color: theme.text,
                        fontSize: fontSize * 0.85,
                      },
                    ]}
                  >
                    {word.text}
                  </Text>
                </>
              )}

              {originalPosition === 'below' && (
                <>
                  {/* English Word */}
                  <Text
                    style={[
                      styles.englishWord,
                      {
                        color: theme.text,
                        fontSize: fontSize * 0.85,
                      },
                    ]}
                  >
                    {word.text}
                  </Text>

                  {/* Original Word */}
                  <Text
                    style={[
                      styles.originalWord,
                      {
                        color: theme.primary,
                        fontSize: originalFontSize,
                        textAlign: originalLanguage === 'hebrew' ? 'right' : 'center',
                      },
                    ]}
                  >
                    {word.lemma || word.text}
                  </Text>

                  {/* Transliteration */}
                  {showTransliteration && word.translit && (
                    <Text
                      style={[
                        styles.transliteration,
                        {
                          color: theme.textMuted,
                          fontSize: translitFontSize,
                        },
                      ]}
                    >
                      {word.translit}
                    </Text>
                  )}
                </>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  // Fallback: Simple two-line display when no word-by-word data
  return (
    <View style={[styles.container, style]}>
      {/* Verse Number */}
      <Text
        style={[
          styles.verseNumber,
          {
            color: theme.verseNumber,
            fontSize: fontSize * 0.65,
            lineHeight,
          },
        ]}
      >
        {verseNumber}
      </Text>

      <View style={styles.textContainer}>
        {originalPosition === 'above' && originalText && (
          <Text
            style={[
              styles.originalLine,
              {
                color: theme.primary,
                fontSize: originalFontSize,
                lineHeight: originalFontSize * 1.5,
                textAlign: originalLanguage === 'hebrew' ? 'right' : 'left',
              },
            ]}
          >
            {originalText}
          </Text>
        )}

        <Text
          style={[
            styles.englishLine,
            {
              color: theme.text,
              fontSize,
              lineHeight,
            },
          ]}
        >
          {englishText}
        </Text>

        {originalPosition === 'below' && originalText && (
          <Text
            style={[
              styles.originalLine,
              {
                color: theme.primary,
                fontSize: originalFontSize,
                lineHeight: originalFontSize * 1.5,
                textAlign: originalLanguage === 'hebrew' ? 'right' : 'left',
              },
            ]}
          >
            {originalText}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  verseNumber: {
    fontWeight: '700',
    marginRight: 8,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  originalLine: {
    marginBottom: 4,
  },
  englishLine: {
    marginBottom: 4,
  },
  // Word grid styles
  wordGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  wordBlock: {
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 60,
  },
  originalWord: {
    fontWeight: '500',
    marginBottom: 2,
  },
  transliteration: {
    fontStyle: 'italic',
    marginBottom: 2,
  },
  strongsTag: {
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  englishWord: {
    marginTop: 4,
    fontWeight: '500',
  },
});

export default InterlinearVerse;
