/**
 * ReadingProgress Component
 * Progress bar showing reading completion
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
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../lib/theme';

interface ReadingProgressProps {
  current: number; // Current verse/chapter/day
  total: number; // Total verses/chapters/days
  label?: string;
  showPercentage?: boolean;
  showCount?: boolean;
  variant?: 'bar' | 'thin' | 'thick';
  animated?: boolean;
  color?: string;
  style?: ViewStyle;
}

export function ReadingProgress({
  current,
  total,
  label,
  showPercentage = true,
  showCount = false,
  variant = 'bar',
  animated = true,
  color,
  style,
}: ReadingProgressProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(0);

  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  useEffect(() => {
    if (animated) {
      progress.value = withSpring(percentage / 100, {
        damping: 15,
        stiffness: 100,
      });
    } else {
      progress.value = percentage / 100;
    }
  }, [percentage, animated]);

  const animatedWidth = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const progressColor = color || theme.primary;

  const getHeight = (): number => {
    switch (variant) {
      case 'thin':
        return 4;
      case 'bar':
        return 8;
      case 'thick':
        return 12;
    }
  };

  const height = getHeight();

  return (
    <View style={[styles.container, style]}>
      {/* Label row */}
      {(label || showPercentage || showCount) && (
        <View style={styles.labelRow}>
          {label && (
            <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
          )}
          <View style={styles.stats}>
            {showCount && (
              <Text style={[styles.count, { color: theme.textSecondary }]}>
                {current}/{total}
              </Text>
            )}
            {showPercentage && (
              <Text style={[styles.percentage, { color: theme.textMuted }]}>
                {Math.round(percentage)}%
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Progress bar */}
      <View
        style={[
          styles.track,
          {
            height,
            backgroundColor: theme.surfaceSecondary,
            borderRadius: height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: progressColor,
              borderRadius: height / 2,
            },
            animatedWidth,
          ]}
        />
      </View>
    </View>
  );
}

// Segmented progress (for reading plans)
interface SegmentedProgressProps {
  segments: boolean[]; // Array of completed/not completed
  currentIndex?: number;
  style?: ViewStyle;
}

export function SegmentedProgress({
  segments,
  currentIndex,
  style,
}: SegmentedProgressProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.segmentedContainer, style]}>
      {segments.map((completed, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            {
              backgroundColor: completed
                ? theme.primary
                : index === currentIndex
                ? theme.secondary
                : theme.surfaceSecondary,
              flex: 1,
            },
          ]}
        />
      ))}
    </View>
  );
}

// Chapter progress (dots)
interface ChapterDotsProps {
  total: number;
  current: number;
  onDotPress?: (chapter: number) => void;
  style?: ViewStyle;
}

export function ChapterDots({
  total,
  current,
  onDotPress,
  style,
}: ChapterDotsProps) {
  const { theme } = useTheme();

  // If too many chapters, show abbreviated version
  if (total > 30) {
    return (
      <View style={[styles.dotsContainer, style]}>
        <Text style={[styles.chapterText, { color: theme.text }]}>
          Chapter {current} of {total}
        </Text>
        <ReadingProgress
          current={current}
          total={total}
          variant="thin"
          showPercentage={false}
          style={{ flex: 1, marginLeft: 12 }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.dotsContainer, style]}>
      {Array.from({ length: total }, (_, i) => i + 1).map((chapter) => (
        <View
          key={chapter}
          style={[
            styles.dot,
            {
              backgroundColor:
                chapter < current
                  ? theme.primary
                  : chapter === current
                  ? theme.secondary
                  : theme.surfaceSecondary,
              borderColor:
                chapter === current ? theme.secondary : 'transparent',
              borderWidth: chapter === current ? 2 : 0,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  count: {
    fontSize: 14,
    fontWeight: '500',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },

  // Segmented
  segmentedContainer: {
    flexDirection: 'row',
    gap: 3,
    height: 6,
  },
  segment: {
    borderRadius: 3,
  },

  // Dots
  dotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chapterText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ReadingProgress;
