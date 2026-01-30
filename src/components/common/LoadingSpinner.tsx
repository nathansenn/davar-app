/**
 * LoadingSpinner Component
 * Animated loading indicator
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../lib/theme';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  style?: ViewStyle;
}

export function LoadingSpinner({
  size = 'md',
  color,
  style,
}: LoadingSpinnerProps) {
  const { theme } = useTheme();
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spin.start();
    
    return () => spin.stop();
  }, [spinValue]);

  const spinnerColor = color || theme.primary;

  const getSize = (): number => {
    switch (size) {
      case 'sm':
        return 20;
      case 'md':
        return 32;
      case 'lg':
        return 48;
    }
  };

  const getBorderWidth = (): number => {
    switch (size) {
      case 'sm':
        return 2;
      case 'md':
        return 3;
      case 'lg':
        return 4;
    }
  };

  const spinnerSize = getSize();
  const borderWidth = getBorderWidth();

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: spinnerSize,
            height: spinnerSize,
            borderWidth: borderWidth,
            borderColor: theme.surfaceSecondary,
            borderTopColor: spinnerColor,
            borderRadius: spinnerSize / 2,
            transform: [{ rotate }],
          },
        ]}
      />
    </View>
  );
}

// Full-screen loading overlay
interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  const { theme } = useTheme();

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
      <View
        style={[
          styles.overlayContent,
          { backgroundColor: theme.surface },
        ]}
      >
        <LoadingSpinner size="lg" />
        {message && (
          <Animated.Text
            style={[styles.message, { color: theme.text }]}
          >
            {message}
          </Animated.Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderStyle: 'solid',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayContent: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 120,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default LoadingSpinner;
