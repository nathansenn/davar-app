/**
 * NoteEditor Component
 * Modal for adding and editing verse notes
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';

interface NoteEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  onDelete?: () => void;
  verse?: string; // e.g., "John 3:16"
  verseText?: string; // The actual verse text
  initialContent?: string;
  isEditing?: boolean;
}

export function NoteEditor({
  visible,
  onClose,
  onSave,
  onDelete,
  verse,
  verseText,
  initialContent = '',
  isEditing = false,
}: NoteEditorProps) {
  const { theme } = useTheme();
  const [content, setContent] = useState(initialContent);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible) {
      setContent(initialContent);
      // Focus the input after a short delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [visible, initialContent]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (content.trim()) {
      onSave(content.trim());
    }
    onClose();
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    if (onDelete) {
      onDelete();
    }
    onClose();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Keyboard.dismiss();
    onClose();
  };

  const hasChanges = content.trim() !== initialContent.trim();
  const canSave = content.trim().length > 0 && (hasChanges || !isEditing);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <View
            style={[
              styles.container,
              { backgroundColor: theme.surface },
              keyboardVisible && styles.containerKeyboard,
            ]}
            onStartShouldSetResponder={() => true}
          >
            {/* Handle bar */}
            <View style={styles.handleBar}>
              <View
                style={[styles.handle, { backgroundColor: theme.border }]}
              />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                <Text style={[styles.cancelText, { color: theme.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <View style={styles.headerCenter}>
                <Text style={[styles.title, { color: theme.text }]}>
                  {isEditing ? 'Edit Note' : 'Add Note'}
                </Text>
                {verse && (
                  <Text style={[styles.verseRef, { color: theme.textMuted }]}>
                    {verse}
                  </Text>
                )}
              </View>
              
              <TouchableOpacity
                onPress={handleSave}
                style={styles.headerButton}
                disabled={!canSave}
              >
                <Text
                  style={[
                    styles.saveText,
                    { color: canSave ? theme.primary : theme.textMuted },
                  ]}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            {/* Verse Preview */}
            {verseText && !keyboardVisible && (
              <View
                style={[
                  styles.versePreview,
                  { backgroundColor: theme.surfaceSecondary },
                ]}
              >
                <Text
                  style={[styles.verseText, { color: theme.textSecondary }]}
                  numberOfLines={3}
                >
                  "{verseText}"
                </Text>
              </View>
            )}

            {/* Note Input */}
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surfaceSecondary,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Write your note..."
                placeholderTextColor={theme.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                textAlignVertical="top"
                autoCapitalize="sentences"
                autoCorrect
              />
            </View>

            {/* Character count and delete button */}
            <View style={styles.footer}>
              <Text style={[styles.charCount, { color: theme.textMuted }]}>
                {content.length} characters
              </Text>
              
              {isEditing && onDelete && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={[
                    styles.deleteButton,
                    { backgroundColor: '#DC262620' },
                  ]}
                >
                  <Text style={styles.deleteText}>🗑️ Delete Note</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: 400,
    paddingBottom: 40,
  },
  containerKeyboard: {
    maxHeight: '100%',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerButton: {
    width: 70,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
  },
  verseRef: {
    fontSize: 13,
    marginTop: 2,
  },
  cancelText: {
    fontSize: 16,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
  },
  versePreview: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
  },
  verseText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  inputContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 150,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  charCount: {
    fontSize: 13,
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  deleteText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },
});

export default NoteEditor;
