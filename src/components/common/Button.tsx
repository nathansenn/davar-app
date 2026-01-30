/**
 * Button Component
 * Reusable button with multiple variants
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  haptic?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  haptic = true,
  style,
  textStyle,
}: ButtonProps) {
  const { theme, isDark } = useTheme();

  const handlePress = () => {
    if (disabled || loading) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getBackgroundColor = (): string => {
    if (disabled) return theme.surfaceSecondary;
    
    switch (variant) {
      case 'primary':
        return theme.primary;
      case 'secondary':
        return theme.secondary;
      case 'outline':
      case 'ghost':
        return 'transparent';
      case 'danger':
        return theme.error;
      default:
        return theme.primary;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return theme.textMuted;
    
    switch (variant) {
      case 'primary':
        return theme.primaryText;
      case 'secondary':
        return theme.secondaryText;
      case 'outline':
        return theme.primary;
      case 'ghost':
        return theme.text;
      case 'danger':
        return '#FFFFFF';
      default:
        return theme.primaryText;
    }
  };

  const getBorderColor = (): string | undefined => {
    if (variant === 'outline') {
      return disabled ? theme.border : theme.primary;
    }
    return undefined;
  };

  const getPadding = (): { paddingHorizontal: number; paddingVertical: number } => {
    switch (size) {
      case 'sm':
        return { paddingHorizontal: 12, paddingVertical: 6 };
      case 'md':
        return { paddingHorizontal: 16, paddingVertical: 10 };
      case 'lg':
        return { paddingHorizontal: 24, paddingVertical: 14 };
    }
  };

  const getFontSize = (): number => {
    switch (size) {
      case 'sm':
        return 14;
      case 'md':
        return 16;
      case 'lg':
        return 18;
    }
  };

  const padding = getPadding();
  const backgroundColor = getBackgroundColor();
  const textColor = getTextColor();
  const borderColor = getBorderColor();
  const fontSize = getFontSize();

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor,
          paddingHorizontal: padding.paddingHorizontal,
          paddingVertical: padding.paddingVertical,
          borderColor: borderColor,
          borderWidth: borderColor ? 1.5 : 0,
          opacity: disabled ? 0.6 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Text style={[styles.icon, { marginRight: 8 }]}>{icon}</Text>
          )}
          <Text
            style={[
              styles.text,
              { color: textColor, fontSize },
              textStyle,
            ]}
          >
            {children}
          </Text>
          {icon && iconPosition === 'right' && (
            <Text style={[styles.icon, { marginLeft: 8 }]}>{icon}</Text>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    minHeight: 44,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  icon: {
    fontSize: 18,
  },
});

export default Button;
