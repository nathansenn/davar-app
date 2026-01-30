/**
 * TodaysReading Component
 * Card showing today's reading passages from active plan
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
import { Card } from '../common/Card';
import { ReadingProgress } from '../reading/ReadingProgress';

interface Passage {
  reference: string; // e.g., "John 3:1-21"
  isCompleted?: boolean;
}

interface TodaysReadingProps {
  planName: string;
  day: number;
  totalDays: number;
  passages: Passage[];
  completedPassages?: number;
  onPress?: () => void;
  onPassagePress?: (passage: Passage, index: number) => void;
  style?: ViewStyle;
}

export function TodaysReading({
  planName,
  day,
  totalDays,
  passages,
  completedPassages = 0,
  onPress,
  onPassagePress,
  style,
}: TodaysReadingProps) {
  const { theme } = useTheme();

  const allCompleted = completedPassages >= passages.length;

  const handlePassagePress = (passage: Passage, index: number) => {
    if (onPassagePress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPassagePress(passage, index);
    }
  };

  return (
    <Card
      variant="elevated"
      padding="none"
      onPress={onPress}
      style={style}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.planName, { color: theme.textSecondary }]}>
            {planName}
          </Text>
          <Text style={[styles.dayLabel, { color: theme.text }]}>
            Day {day} of {totalDays}
          </Text>
        </View>
        
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: allCompleted
                ? theme.success + '20'
                : theme.surfaceSecondary,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: allCompleted ? theme.success : theme.textMuted,
              },
            ]}
          >
            {allCompleted ? '✓ Complete' : `${completedPassages}/${passages.length}`}
          </Text>
        </View>
      </View>

      {/* Passages */}
      <View style={styles.passagesContainer}>
        {passages.map((passage, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handlePassagePress(passage, index)}
            disabled={!onPassagePress}
            style={[
              styles.passageItem,
              {
                backgroundColor: passage.isCompleted
                  ? theme.success + '15'
                  : 'transparent',
                borderBottomColor: theme.border,
                borderBottomWidth: index < passages.length - 1 ? 1 : 0,
              },
            ]}
          >
            <View style={styles.passageLeft}>
              <View
                style={[
                  styles.passageCheck,
                  {
                    backgroundColor: passage.isCompleted
                      ? theme.success
                      : theme.surfaceSecondary,
                    borderColor: passage.isCompleted
                      ? theme.success
                      : theme.border,
                  },
                ]}
              >
                {passage.isCompleted && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </View>
              <Text
                style={[
                  styles.passageText,
                  {
                    color: theme.text,
                    textDecorationLine: passage.isCompleted
                      ? 'line-through'
                      : 'none',
                    opacity: passage.isCompleted ? 0.7 : 1,
                  },
                ]}
              >
                {passage.reference}
              </Text>
            </View>
            
            <Text style={[styles.chevron, { color: theme.textMuted }]}>
              →
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <ReadingProgress
          current={day}
          total={totalDays}
          variant="thin"
          showPercentage={false}
        />
      </View>
    </Card>
  );
}

// Empty state when no active plan
interface NoPlanCardProps {
  onStartPlan?: () => void;
  style?: ViewStyle;
}

export function NoPlanCard({ onStartPlan, style }: NoPlanCardProps) {
  const { theme } = useTheme();

  return (
    <Card variant="outlined" padding="lg" onPress={onStartPlan} style={style}>
      <View style={styles.noPlanContainer}>
        <Text style={styles.noPlanIcon}>📖</Text>
        <Text style={[styles.noPlanTitle, { color: theme.text }]}>
          Start a Reading Plan
        </Text>
        <Text style={[styles.noPlanDescription, { color: theme.textSecondary }]}>
          Choose a plan to guide your daily Bible reading and build a consistent habit.
        </Text>
        <View
          style={[
            styles.noPlanButton,
            { backgroundColor: theme.primary },
          ]}
        >
          <Text style={[styles.noPlanButtonText, { color: theme.primaryText }]}>
            Browse Plans
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {},
  planName: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dayLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Passages
  passagesContainer: {
    padding: 8,
  },
  passageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  passageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  passageCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkIcon: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  passageText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  chevron: {
    fontSize: 16,
  },

  // Progress
  progressContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },

  // No Plan
  noPlanContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  noPlanIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noPlanTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  noPlanDescription: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  noPlanButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  noPlanButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TodaysReading;
