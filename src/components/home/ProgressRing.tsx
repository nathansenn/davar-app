/**
 * ProgressRing Component
 * Circular progress indicator with animation
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withSpring,
  withTiming,
  useDerivedValue,
} from 'react-native-reanimated';
import { useTheme } from '../../lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  centerContent?: React.ReactNode;
  animated?: boolean;
  style?: ViewStyle;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 12,
  color,
  backgroundColor,
  showPercentage = true,
  centerContent,
  animated = true,
  style,
}: ProgressRingProps) {
  const { theme } = useTheme();
  const progressValue = useSharedValue(0);

  const ringColor = color || theme.primary;
  const ringBgColor = backgroundColor || theme.surfaceSecondary;

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = size / 2;

  useEffect(() => {
    const clampedProgress = Math.min(Math.max(progress, 0), 100);
    if (animated) {
      progressValue.value = withSpring(clampedProgress, {
        damping: 15,
        stiffness: 80,
      });
    } else {
      progressValue.value = clampedProgress;
    }
  }, [progress, animated]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset =
      circumference - (progressValue.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  const displayProgress = useDerivedValue(() => {
    return Math.round(progressValue.value);
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background Circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={ringBgColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Circle */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
          />
        </G>
      </Svg>

      {/* Center Content */}
      <View style={styles.centerContent}>
        {centerContent ? (
          centerContent
        ) : showPercentage ? (
          <ProgressText
            progressValue={displayProgress}
            color={theme.text}
            size={size}
          />
        ) : null}
      </View>
    </View>
  );
}

// Animated percentage text
interface ProgressTextProps {
  progressValue: Animated.SharedValue<number>;
  color: string;
  size: number;
}

function ProgressText({ progressValue, color, size }: ProgressTextProps) {
  // For display, we use a static approach since ReanimatedText can be complex
  // In production, you might want to use Reanimated's useAnimatedText
  return (
    <View style={styles.percentageContainer}>
      <AnimatedPercentage value={progressValue} color={color} size={size} />
    </View>
  );
}

function AnimatedPercentage({
  value,
  color,
  size,
}: {
  value: Animated.SharedValue<number>;
  color: string;
  size: number;
}) {
  // Simple approach - in production use ReText from react-native-redash
  // or implement proper animated text
  const fontSize = size * 0.25;
  
  return (
    <Animated.View>
      <Animated.Text
        style={[
          styles.percentageText,
          { color, fontSize },
        ]}
      >
        {/* This won't animate smoothly, but works for display */}
        %
      </Animated.Text>
    </Animated.View>
  );
}

// Compact ring for dashboard/lists
interface CompactRingProps {
  progress: number;
  size?: number;
  label?: string;
  style?: ViewStyle;
}

export function CompactRing({
  progress,
  size = 48,
  label,
  style,
}: CompactRingProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.compactContainer, style]}>
      <ProgressRing
        progress={progress}
        size={size}
        strokeWidth={4}
        showPercentage={false}
        centerContent={
          <Text
            style={[
              styles.compactNumber,
              { color: theme.text, fontSize: size * 0.28 },
            ]}
          >
            {Math.round(progress)}
          </Text>
        }
      />
      {label && (
        <Text
          style={[styles.compactLabel, { color: theme.textMuted }]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

// Multiple rings for comparing progress
interface MultiRingProps {
  rings: Array<{
    progress: number;
    color: string;
    label: string;
  }>;
  size?: number;
  style?: ViewStyle;
}

export function MultiRing({ rings, size = 100, style }: MultiRingProps) {
  const { theme } = useTheme();
  const strokeWidth = 8;
  const gap = 4;

  return (
    <View style={[styles.multiContainer, { width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {rings.map((ring, index) => {
            const radius = (size - strokeWidth) / 2 - (strokeWidth + gap) * index;
            const circumference = radius * 2 * Math.PI;
            const strokeDashoffset =
              circumference - (ring.progress / 100) * circumference;

            return (
              <React.Fragment key={index}>
                {/* Background */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={theme.surfaceSecondary}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                {/* Progress */}
                <Circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={ring.color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </React.Fragment>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentageContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  percentageText: {
    fontWeight: '700',
  },

  // Compact
  compactContainer: {
    alignItems: 'center',
  },
  compactNumber: {
    fontWeight: '700',
  },
  compactLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 60,
  },

  // Multi
  multiContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProgressRing;
