/**
 * HighlightMenu Component
 * Popup menu for highlighting verses with color selection
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme, getHighlightColor } from '../../lib/theme';
import { HIGHLIGHT_COLORS, type HighlightColor } from '../../types';

interface HighlightMenuProps {
  visible: boolean;
  onClose: () => void;
  onSelectColor: (color: HighlightColor) => void;
  onRemoveHighlight: () => void;
  onAddBookmark: () => void;
  onRemoveBookmark: () => void;
  onAddNote: () => void;
  currentColor?: HighlightColor;
  isBookmarked?: boolean;
  hasNote?: boolean;
  verse?: string; // e.g., "John 3:16"
}

export function HighlightMenu({
  visible,
  onClose,
  onSelectColor,
  onRemoveHighlight,
  onAddBookmark,
  onRemoveBookmark,
  onAddNote,
  currentColor,
  isBookmarked = false,
  hasNote = false,
  verse,
}: HighlightMenuProps) {
  const { theme, isDark } = useTheme();

  const handleSelectColor = (color: HighlightColor) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectColor(color);
    onClose();
  };

  const handleRemoveHighlight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onRemoveHighlight();
    onClose();
  };

  const handleToggleBookmark = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isBookmarked) {
      onRemoveBookmark();
    } else {
      onAddBookmark();
    }
  };

  const handleAddNote = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddNote();
    onClose();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const colors = Object.entries(HIGHLIGHT_COLORS) as [HighlightColor, typeof HIGHLIGHT_COLORS[HighlightColor]][];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.overlay} onPress={handleClose}>
        <View
          style={[styles.container, { backgroundColor: theme.surface }]}
          onStartShouldSetResponder={() => true}
        >
          {/* Handle bar */}
          <View style={styles.handleBar}>
            <View
              style={[styles.handle, { backgroundColor: theme.border }]}
            />
          </View>

          {/* Header */}
          {verse && (
            <View style={styles.header}>
              <Text style={[styles.verseRef, { color: theme.text }]}>
                {verse}
              </Text>
            </View>
          )}

          {/* Highlight Colors */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
              Highlight
            </Text>
            <View style={styles.colorGrid}>
              {colors.map(([colorKey, colorValue]) => (
                <TouchableOpacity
                  key={colorKey}
                  style={[
                    styles.colorButton,
                    {
                      backgroundColor: getHighlightColor(colorKey, isDark),
                      borderWidth: currentColor === colorKey ? 3 : 0,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={() => handleSelectColor(colorKey)}
                >
                  {currentColor === colorKey && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
              
              {/* Remove highlight button */}
              {currentColor && (
                <TouchableOpacity
                  style={[
                    styles.colorButton,
                    styles.removeButton,
                    { backgroundColor: theme.surfaceSecondary },
                  ]}
                  onPress={handleRemoveHighlight}
                >
                  <Text style={[styles.removeIcon, { color: theme.textMuted }]}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {/* Bookmark */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: isBookmarked
                    ? theme.primary + '20'
                    : theme.surfaceSecondary,
                },
              ]}
              onPress={handleToggleBookmark}
            >
              <Text style={styles.actionIcon}>
                {isBookmarked ? '🔖' : '📑'}
              </Text>
              <Text style={[styles.actionLabel, { color: theme.text }]}>
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Text>
            </TouchableOpacity>

            {/* Note */}
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: hasNote
                    ? theme.secondary + '20'
                    : theme.surfaceSecondary,
                },
              ]}
              onPress={handleAddNote}
            >
              <Text style={styles.actionIcon}>📝</Text>
              <Text style={[styles.actionLabel, { color: theme.text }]}>
                {hasNote ? 'Edit Note' : 'Add Note'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={handleClose}
            style={[styles.cancelButton, { borderColor: theme.border }]}
          >
            <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
  header: {
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  verseRef: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  colorButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  removeIcon: {
    fontSize: 18,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  cancelButton: {
    marginHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HighlightMenu;
