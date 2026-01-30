/**
 * HighlightMenu Component
 * Color picker for verse highlights with quick actions
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  FadeIn,
  FadeOut,
  SlideInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme, getHighlightColor } from '../../lib/theme';
import type { HighlightColor } from '../../types';
import { HIGHLIGHT_COLORS } from '../../types';

interface HighlightMenuProps {
  visible: boolean;
  onClose: () => void;
  onSelectColor: (color: HighlightColor) => void;
  onRemoveHighlight?: () => void;
  onAddNote?: () => void;
  onCopy?: () => void;
  onShare?: () => void;
  currentColor?: HighlightColor;
  hasHighlight?: boolean;
  verseRef?: string;
}

export function HighlightMenu({
  visible,
  onClose,
  onSelectColor,
  onRemoveHighlight,
  onAddNote,
  onCopy,
  onShare,
  currentColor,
  hasHighlight = false,
  verseRef,
}: HighlightMenuProps) {
  const { theme, isDark } = useTheme();

  const handleSelectColor = useCallback(
    (color: HighlightColor) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onSelectColor(color);
      onClose();
    },
    [onSelectColor, onClose]
  );

  const handleRemoveHighlight = useCallback(() => {
    if (onRemoveHighlight) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onRemoveHighlight();
      onClose();
    }
  }, [onRemoveHighlight, onClose]);

  const handleAction = useCallback(
    (action: (() => void) | undefined) => {
      if (action) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        action();
        onClose();
      }
    },
    [onClose]
  );

  const colors = Object.entries(HIGHLIGHT_COLORS) as [HighlightColor, typeof HIGHLIGHT_COLORS[HighlightColor]][];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          entering={SlideInDown.springify().damping(15)}
          exiting={FadeOut.duration(150)}
          style={[styles.container, { backgroundColor: theme.surface }]}
          onStartShouldSetResponder={() => true}
        >
          {/* Handle */}
          <View style={styles.handleBar}>
            <View style={[styles.handle, { backgroundColor: theme.border }]} />
          </View>

          {/* Verse Reference */}
          {verseRef && (
            <Text style={[styles.verseRef, { color: theme.textMuted }]}>
              {verseRef}
            </Text>
          )}

          {/* Color Picker */}
          <View style={styles.colorPicker}>
            <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
              Highlight Color
            </Text>
            <View style={styles.colorsRow}>
              {colors.map(([colorKey, colorValue]) => (
                <ColorButton
                  key={colorKey}
                  color={isDark ? colorValue.dark : colorValue.light}
                  label={colorValue.label}
                  isSelected={currentColor === colorKey}
                  onPress={() => handleSelectColor(colorKey)}
                  theme={theme}
                />
              ))}
            </View>
          </View>

          {/* Remove Highlight */}
          {hasHighlight && onRemoveHighlight && (
            <TouchableOpacity
              onPress={handleRemoveHighlight}
              style={[
                styles.removeButton,
                { backgroundColor: theme.error + '15' },
              ]}
            >
              <Text style={[styles.removeButtonText, { color: theme.error }]}>
                Remove Highlight
              </Text>
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Quick Actions */}
          <View style={styles.actions}>
            {onAddNote && (
              <ActionButton
                icon="📝"
                label="Add Note"
                onPress={() => handleAction(onAddNote)}
                theme={theme}
              />
            )}
            {onCopy && (
              <ActionButton
                icon="📋"
                label="Copy"
                onPress={() => handleAction(onCopy)}
                theme={theme}
              />
            )}
            {onShare && (
              <ActionButton
                icon="🔗"
                label="Share"
                onPress={() => handleAction(onShare)}
                theme={theme}
              />
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

// Color button component
interface ColorButtonProps {
  color: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
}

function ColorButton({
  color,
  label,
  isSelected,
  onPress,
  theme,
}: ColorButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9);
      }}
      onPressOut={() => {
        scale.value = withSpring(1);
      }}
      style={styles.colorButtonContainer}
    >
      <Animated.View
        style={[
          styles.colorButton,
          {
            backgroundColor: color,
            borderWidth: isSelected ? 3 : 0,
            borderColor: theme.text,
          },
          animatedStyle,
        ]}
      >
        {isSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
      </Animated.View>
      <Text
        style={[
          styles.colorLabel,
          {
            color: isSelected ? theme.text : theme.textMuted,
            fontWeight: isSelected ? '600' : '400',
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// Action button component
interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof useTheme>['theme'];
}

function ActionButton({ icon, label, onPress, theme }: ActionButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.actionButton,
        { backgroundColor: theme.surfaceSecondary },
      ]}
    >
      <Text style={styles.actionIcon}>{icon}</Text>
      <Text style={[styles.actionLabel, { color: theme.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// Inline highlight menu (appears near selected text)
interface InlineHighlightMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  onSelectColor: (color: HighlightColor) => void;
  onClose: () => void;
}

export function InlineHighlightMenu({
  visible,
  position,
  onSelectColor,
  onClose,
}: InlineHighlightMenuProps) {
  const { theme, isDark } = useTheme();

  if (!visible) return null;

  const colors = Object.keys(HIGHLIGHT_COLORS) as HighlightColor[];

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(100)}
      style={[
        styles.inlineMenu,
        {
          backgroundColor: theme.surface,
          top: position.y,
          left: position.x,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 5,
        },
      ]}
    >
      {colors.map((color) => (
        <TouchableOpacity
          key={color}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectColor(color);
            onClose();
          }}
          style={[
            styles.inlineColorDot,
            { backgroundColor: getHighlightColor(color, isDark) },
          ]}
        />
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  handleBar: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  verseRef: {
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 16,
  },
  colorPicker: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  colorsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorButtonContainer: {
    alignItems: 'center',
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 20,
    color: '#000',
  },
  colorLabel: {
    marginTop: 6,
    fontSize: 11,
  },
  removeButton: {
    marginHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  removeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 80,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Inline menu
  inlineMenu: {
    position: 'absolute',
    flexDirection: 'row',
    padding: 8,
    borderRadius: 24,
    gap: 8,
  },
  inlineColorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
});

export default HighlightMenu;
