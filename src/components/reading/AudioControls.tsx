/**
 * AudioControls Component
 * Floating audio playback controls for scripture reading
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import { audioService, AudioState, AudioSettings } from '../../services/audioService';

interface AudioControlsProps {
  verses: Array<{ number: number; text: string }>;
  chapterTitle: string;
  visible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  onVerseHighlight?: (verseNumber: number) => void;
}

export function AudioControls({
  verses,
  chapterTitle,
  visible = false,
  onVisibilityChange,
  onVerseHighlight,
}: AudioControlsProps) {
  const { theme } = useTheme();
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isPaused: false,
    currentVerse: 1,
    totalVerses: verses.length,
  });
  const [expanded, setExpanded] = useState(visible);
  const [playbackRate, setPlaybackRate] = useState(1.0);

  const slideAnim = React.useRef(new Animated.Value(visible ? 0 : 100)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 100,
      useNativeDriver: true,
      tension: 100,
      friction: 15,
    }).start();
    setExpanded(visible);
  }, [visible]);

  const handlePlayPause = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (audioState.isPlaying) {
      await audioService.pause();
    } else if (audioState.isPaused) {
      await audioService.resume();
    } else {
      await audioService.speakVerses(verses, {
        startIndex: 0,
        onProgress: (state) => {
          setAudioState(state);
          if (onVerseHighlight && state.currentVerse > 0) {
            onVerseHighlight(state.currentVerse);
          }
        },
      });
    }
  }, [audioState.isPlaying, audioState.isPaused, verses, onVerseHighlight]);

  const handleStop = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await audioService.stop();
    setAudioState({
      isPlaying: false,
      isPaused: false,
      currentVerse: 1,
      totalVerses: verses.length,
    });
    onVerseHighlight?.(0); // Clear highlight
  }, [verses.length, onVerseHighlight]);

  const handlePrevious = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await audioService.previousVerse();
  }, []);

  const handleNext = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await audioService.nextVerse();
  }, []);

  const cyclePlaybackRate = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const rates = [0.75, 1.0, 1.25, 1.5];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    setPlaybackRate(newRate);
    audioService.setSettings({ rate: newRate });
  }, [playbackRate]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    handleStop();
    onVisibilityChange?.(false);
  }, [handleStop, onVisibilityChange]);

  if (!visible) return null;

  const progress = audioState.totalVerses > 0 
    ? ((audioState.currentVerse - 1) / audioState.totalVerses) * 100 
    : 0;

  return (
    <Animated.View
      style={[
        styles.container,
        { 
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Progress Bar */}
      <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
        <View 
          style={[
            styles.progressFill, 
            { backgroundColor: theme.primary, width: `${progress}%` }
          ]} 
        />
      </View>

      <View style={styles.content}>
        {/* Info */}
        <View style={styles.infoSection}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {chapterTitle}
          </Text>
          <Text style={[styles.verseInfo, { color: theme.textMuted }]}>
            Verse {audioState.currentVerse} of {audioState.totalVerses}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {/* Speed Button */}
          <TouchableOpacity
            style={[styles.speedButton, { backgroundColor: theme.surfaceSecondary }]}
            onPress={cyclePlaybackRate}
          >
            <Text style={[styles.speedText, { color: theme.text }]}>
              {playbackRate}x
            </Text>
          </TouchableOpacity>

          {/* Previous */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handlePrevious}
            disabled={audioState.currentVerse <= 1}
          >
            <Ionicons 
              name="play-skip-back" 
              size={24} 
              color={audioState.currentVerse <= 1 ? theme.textMuted : theme.text} 
            />
          </TouchableOpacity>

          {/* Play/Pause */}
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: theme.primary }]}
            onPress={handlePlayPause}
          >
            <Ionicons 
              name={audioState.isPlaying ? "pause" : "play"} 
              size={28} 
              color={theme.primaryText} 
            />
          </TouchableOpacity>

          {/* Next */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleNext}
            disabled={audioState.currentVerse >= audioState.totalVerses}
          >
            <Ionicons 
              name="play-skip-forward" 
              size={24} 
              color={audioState.currentVerse >= audioState.totalVerses ? theme.textMuted : theme.text} 
            />
          </TouchableOpacity>

          {/* Stop */}
          <TouchableOpacity
            style={styles.controlButton}
            onPress={handleStop}
          >
            <Ionicons name="stop" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={24} color={theme.textMuted} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // Above the navigation bar
    left: 0,
    right: 0,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  progressBar: {
    height: 3,
    width: '100%',
  },
  progressFill: {
    height: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  infoSection: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  verseInfo: {
    fontSize: 12,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
  speedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
});

export default AudioControls;
