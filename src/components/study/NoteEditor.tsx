/**
 * NoteEditor Component
 * Add and edit notes for verses
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  Keyboard,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';

interface Note {
  id?: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

interface NoteEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  onDelete?: () => void;
  verseRef: string;
  existingNote?: Note;
}

export function NoteEditor({
  visible,
  onClose,
  onSave,
  onDelete,
  verseRef,
  existingNote,
}: NoteEditorProps) {
  const { theme } = useTheme();
  const [content, setContent] = useState(existingNote?.content || '');
  const [isModified, setIsModified] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (visible) {
      setContent(existingNote?.content || '');
      setIsModified(false);
      // Focus input after modal animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [visible, existingNote]);

  const handleTextChange = (text: string) => {
    setContent(text);
    setIsModified(text !== (existingNote?.content || ''));
  };

  const handleSave = () => {
    if (content.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSave(content.trim());
      onClose();
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onDelete();
      onClose();
    }
  };

  const handleCancel = () => {
    Keyboard.dismiss();
    onClose();
  };

  const canSave = content.trim().length > 0 && (isModified || !existingNote);
  const isEditing = !!existingNote;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <Pressable style={styles.overlay} onPress={handleCancel}>
          <Animated.View
            entering={SlideInDown.springify().damping(15)}
            style={[styles.container, { backgroundColor: theme.surface }]}
            onStartShouldSetResponder={() => true}
          >
            {/* Handle */}
            <View style={styles.handleBar}>
              <View style={[styles.handle, { backgroundColor: theme.border }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.title, { color: theme.text }]}>
                  {isEditing ? 'Edit Note' : 'Add Note'}
                </Text>
                <Text style={[styles.verseRef, { color: theme.textMuted }]}>
                  {verseRef}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={handleCancel}
                style={styles.closeButton}
              >
                <Text style={[styles.closeButtonText, { color: theme.textMuted }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            {/* Text Input */}
            <View
              style={[
                styles.inputContainer,
                { 
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.inputBorder,
                },
              ]}
            >
              <TextInput
                ref={inputRef}
                value={content}
                onChangeText={handleTextChange}
                placeholder="Write your thoughts..."
                placeholderTextColor={theme.placeholder}
                multiline
                textAlignVertical="top"
                style={[
                  styles.input,
                  { color: theme.text },
                ]}
                maxLength={2000}
              />
            </View>

            {/* Character count */}
            <Text style={[styles.charCount, { color: theme.textMuted }]}>
              {content.length}/2000
            </Text>

            {/* Metadata (if editing) */}
            {existingNote && (
              <View style={styles.metadata}>
                {existingNote.createdAt && (
                  <Text style={[styles.metadataText, { color: theme.textMuted }]}>
                    Created: {new Date(existingNote.createdAt).toLocaleDateString()}
                  </Text>
                )}
                {existingNote.updatedAt && existingNote.updatedAt !== existingNote.createdAt && (
                  <Text style={[styles.metadataText, { color: theme.textMuted }]}>
                    Modified: {new Date(existingNote.updatedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              {/* Delete Button (if editing) */}
              {isEditing && onDelete && (
                <TouchableOpacity
                  onPress={handleDelete}
                  style={[
                    styles.deleteButton,
                    { backgroundColor: theme.error + '15' },
                  ]}
                >
                  <Text style={[styles.deleteButtonText, { color: theme.error }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              )}

              {/* Cancel Button */}
              <TouchableOpacity
                onPress={handleCancel}
                style={[
                  styles.cancelButton,
                  { backgroundColor: theme.surfaceSecondary },
                ]}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={!canSave}
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: canSave ? theme.primary : theme.surfaceSecondary,
                    opacity: canSave ? 1 : 0.5,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.saveButtonText,
                    { color: canSave ? theme.primaryText : theme.textMuted },
                  ]}
                >
                  {isEditing ? 'Update' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// Quick note input (inline)
interface QuickNoteInputProps {
  verseRef: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

export function QuickNoteInput({
  verseRef,
  onSave,
  onCancel,
  placeholder = "Add a quick note...",
}: QuickNoteInputProps) {
  const { theme } = useTheme();
  const [content, setContent] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSave = () => {
    if (content.trim()) {
      onSave(content.trim());
    }
  };

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      style={[
        styles.quickNote,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <TextInput
        ref={inputRef}
        value={content}
        onChangeText={setContent}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        style={[styles.quickNoteInput, { color: theme.text }]}
        onSubmitEditing={handleSave}
        returnKeyType="done"
      />
      <View style={styles.quickNoteActions}>
        <TouchableOpacity onPress={onCancel}>
          <Text style={[styles.quickNoteAction, { color: theme.textMuted }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.quickNoteAction, { color: theme.primary }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

// Note display card
interface NoteCardProps {
  note: Note;
  verseRef: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function NoteCard({ note, verseRef, onEdit, onDelete }: NoteCardProps) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.noteCard,
        {
          backgroundColor: theme.surfaceSecondary,
          borderLeftColor: theme.secondary,
        },
      ]}
    >
      <Text style={[styles.noteCardRef, { color: theme.textMuted }]}>
        {verseRef}
      </Text>
      <Text style={[styles.noteCardContent, { color: theme.text }]}>
        {note.content}
      </Text>
      {(onEdit || onDelete) && (
        <View style={styles.noteCardActions}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit}>
              <Text style={[styles.noteCardAction, { color: theme.primary }]}>
                Edit
              </Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete}>
              <Text style={[styles.noteCardAction, { color: theme.error }]}>
                Delete
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
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
    paddingBottom: 40,
    maxHeight: '90%',
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  verseRef: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
  },
  inputContainer: {
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 150,
    maxHeight: 250,
  },
  input: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
  },
  charCount: {
    textAlign: 'right',
    marginHorizontal: 24,
    marginTop: 8,
    fontSize: 12,
  },
  metadata: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  metadataText: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 24,
    gap: 12,
  },
  deleteButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Quick note
  quickNote: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
  },
  quickNoteInput: {
    fontSize: 15,
    marginBottom: 8,
  },
  quickNoteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
  },
  quickNoteAction: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Note card
  noteCard: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginVertical: 8,
  },
  noteCardRef: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  noteCardContent: {
    fontSize: 15,
    lineHeight: 22,
  },
  noteCardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 16,
  },
  noteCardAction: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NoteEditor;
