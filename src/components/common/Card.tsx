/**
 * Card Component
 * Reusable card container with elevation and styling
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  haptic?: boolean;
}

export function Card({
  children,
  onPress,
  variant = 'elevated',
  padding = 'md',
  style,
  haptic = true,
}: CardProps) {
  const { theme, isDark } = useTheme();

  const handlePress = () => {
    if (onPress) {
      if (haptic) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress();
    }
  };

  const getBackgroundColor = (): string => {
    switch (variant) {
      case 'elevated':
      case 'outlined':
        return theme.cardBackground;
      case 'filled':
        return theme.surfaceSecondary;
      default:
        return theme.cardBackground;
    }
  };

  const getBorderColor = (): string | undefined => {
    if (variant === 'outlined') {
      return theme.border;
    }
    return undefined;
  };

  const getShadow = (): ViewStyle => {
    if (variant === 'elevated' && !isDark) {
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      };
    }
    if (variant === 'elevated' && isDark) {
      return {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
      };
    }
    return {};
  };

  const getPadding = (): number => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return 12;
      case 'md':
        return 16;
      case 'lg':
        return 24;
    }
  };

  const cardStyle: ViewStyle = {
    backgroundColor: getBackgroundColor(),
    borderColor: getBorderColor(),
    borderWidth: variant === 'outlined' ? 1 : 0,
    padding: getPadding(),
    borderRadius: 16,
    ...getShadow(),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[styles.card, cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, cardStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});

export default Card;
