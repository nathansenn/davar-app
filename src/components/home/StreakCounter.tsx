/**
 * StreakCounter Component
 * 🔥 X Day Streak display with animation
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../lib/theme';

interface StreakCounterProps {
  currentStreak: number;
  longestStreak?: number;
  showLongest?: boolean;
  variant?: 'compact' | 'full' | 'minimal';
  animated?: boolean;
  style?: ViewStyle;
}

export function StreakCounter({
  currentStreak,
  longestStreak = 0,
  showLongest = false,
  variant = 'full',
  animated = true,
  style,
}: StreakCounterProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(0);
  const fireScale = useSharedValue(1);
  const numberOpacity = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      // Entrance animation
      scale.value = withSpring(1, { damping: 12, stiffness: 100 });
      numberOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));

      // Fire flicker animation
      fireScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      scale.value = 1;
      numberOpacity.value = 1;
    }
  }, [animated]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const fireStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fireScale.value }],
  }));

  const numberStyle = useAnimatedStyle(() => ({
    opacity: numberOpacity.value,
  }));

  // Determine fire color based on streak
  const getFireColor = (): string => {
    if (currentStreak >= 30) return '#FF4500'; // Orange-red (hot!)
    if (currentStreak >= 14) return '#FF6B35'; // Orange
    if (currentStreak >= 7) return '#FFA500'; // Light orange
    if (currentStreak >= 3) return '#FFD700'; // Gold
    return theme.secondary; // Default gold
  };

  const fireColor = getFireColor();

  // Minimal variant - just the number with fire
  if (variant === 'minimal') {
    return (
      <Animated.View style={[styles.minimalContainer, containerStyle, style]}>
        <Animated.Text style={[styles.minimalFire, fireStyle]}>🔥</Animated.Text>
        <Animated.Text
          style={[styles.minimalNumber, { color: theme.text }, numberStyle]}
        >
          {currentStreak}
        </Animated.Text>
      </Animated.View>
    );
  }

  // Compact variant - horizontal layout
  if (variant === 'compact') {
    return (
      <Animated.View style={[styles.compactContainer, containerStyle, style]}>
        <Animated.Text style={[styles.compactFire, fireStyle]}>🔥</Animated.Text>
        <View style={styles.compactText}>
          <Animated.Text
            style={[styles.compactNumber, { color: theme.text }, numberStyle]}
          >
            {currentStreak}
          </Animated.Text>
          <Text style={[styles.compactLabel, { color: theme.textMuted }]}>
            day{currentStreak !== 1 ? 's' : ''}
          </Text>
        </View>
      </Animated.View>
    );
  }

  // Full variant - centered with details
  return (
    <Animated.View style={[styles.fullContainer, containerStyle, style]}>
      {/* Fire Icon */}
      <Animated.View style={[styles.fireContainer, fireStyle]}>
        <Text style={styles.fullFire}>🔥</Text>
        {currentStreak >= 7 && (
          <View
            style={[
              styles.fireGlow,
              { backgroundColor: fireColor, opacity: 0.3 },
            ]}
          />
        )}
      </Animated.View>

      {/* Streak Count */}
      <Animated.View style={numberStyle}>
        <Text style={[styles.fullNumber, { color: theme.text }]}>
          {currentStreak}
        </Text>
        <Text style={[styles.fullLabel, { color: theme.textSecondary }]}>
          Day Streak
        </Text>
      </Animated.View>

      {/* Longest Streak */}
      {showLongest && longestStreak > 0 && (
        <View style={styles.longestContainer}>
          <Text style={[styles.longestLabel, { color: theme.textMuted }]}>
            Longest: {longestStreak} days
          </Text>
        </View>
      )}

      {/* Milestone Badge */}
      {currentStreak > 0 && currentStreak % 7 === 0 && (
        <View
          style={[
            styles.milestoneBadge,
            { backgroundColor: theme.secondary },
          ]}
        >
          <Text style={[styles.milestoneText, { color: theme.secondaryText }]}>
            🎉 {currentStreak / 7} Week{currentStreak >= 14 ? 's' : ''}!
          </Text>
        </View>
      )}
    </Animated.View>
  );
}

// Streak encouragement messages
export function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your reading journey today!";
  if (streak === 1) return "Great start! Keep it going!";
  if (streak < 3) return "Building momentum!";
  if (streak < 7) return "You're on a roll!";
  if (streak < 14) return "One week strong! 💪";
  if (streak < 30) return "Incredible consistency!";
  if (streak < 60) return "A month of faithfulness!";
  if (streak < 100) return "You're unstoppable!";
  return "Legendary reader! 🏆";
}

const styles = StyleSheet.create({
  // Minimal
  minimalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minimalFire: {
    fontSize: 20,
    marginRight: 4,
  },
  minimalNumber: {
    fontSize: 18,
    fontWeight: '700',
  },

  // Compact
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  compactFire: {
    fontSize: 28,
    marginRight: 8,
  },
  compactText: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  compactNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  compactLabel: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Full
  fullContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  fireContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  fullFire: {
    fontSize: 56,
  },
  fireGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: -10,
    left: -10,
    zIndex: -1,
  },
  fullNumber: {
    fontSize: 48,
    fontWeight: '800',
    textAlign: 'center',
  },
  fullLabel: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  longestContainer: {
    marginTop: 12,
  },
  longestLabel: {
    fontSize: 13,
  },
  milestoneBadge: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  milestoneText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default StreakCounter;
