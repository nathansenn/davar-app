/**
 * WordDetailModal Component
 * Shows Hebrew/Greek word details with Strong's references
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import type { StrongsReference } from '../../types';

interface WordDetailModalProps {
  visible: boolean;
  onClose: () => void;
  word: string;
  strongs?: StrongsReference;
  context?: {
    verse: string;
    translation: string;
  };
}

export function WordDetailModal({
  visible,
  onClose,
  word,
  strongs,
  context,
}: WordDetailModalProps) {
  const { theme } = useTheme();

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
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
          <View style={styles.header}>
            <Text style={[styles.word, { color: theme.text }]}>{word}</Text>
            {context && (
              <Text style={[styles.context, { color: theme.textMuted }]}>
                {context.verse} ({context.translation})
              </Text>
            )}
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {strongs ? (
              <>
                {/* Original Language Section */}
                <View style={styles.section}>
                  <Text
                    style={[styles.sectionTitle, { color: theme.textSecondary }]}
                  >
                    {strongs.language === 'hebrew' ? 'Hebrew' : 'Greek'}
                  </Text>
                  
                  <View
                    style={[
                      styles.originalWord,
                      { backgroundColor: theme.surfaceSecondary },
                    ]}
                  >
                    <Text style={[styles.lemma, { color: theme.text }]}>
                      {strongs.lemma}
                    </Text>
                    <Text
                      style={[
                        styles.transliteration,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {strongs.transliteration}
                    </Text>
                    <Text
                      style={[styles.pronunciation, { color: theme.textMuted }]}
                    >
                      {strongs.pronunciation}
                    </Text>
                  </View>
                </View>

                {/* Strong's Number */}
                <View style={styles.section}>
                  <Text
                    style={[styles.sectionTitle, { color: theme.textSecondary }]}
                  >
                    Strong's Number
                  </Text>
                  <View
                    style={[
                      styles.strongsNumber,
                      { backgroundColor: theme.primary + '15' },
                    ]}
                  >
                    <Text
                      style={[styles.strongsText, { color: theme.primary }]}
                    >
                      {strongs.id}
                    </Text>
                  </View>
                </View>

                {/* Definition */}
                <View style={styles.section}>
                  <Text
                    style={[styles.sectionTitle, { color: theme.textSecondary }]}
                  >
                    Definition
                  </Text>
                  <Text style={[styles.shortDefinition, { color: theme.text }]}>
                    {strongs.shortDefinition}
                  </Text>
                  <Text
                    style={[
                      styles.fullDefinition,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {strongs.definition}
                  </Text>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.surfaceSecondary },
                    ]}
                    onPress={() => {
                      // TODO: Navigate to concordance search
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text
                      style={[styles.actionButtonText, { color: theme.text }]}
                    >
                      🔍 Find in Bible
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.surfaceSecondary },
                    ]}
                    onPress={() => {
                      // TODO: Add to vocabulary
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text
                      style={[styles.actionButtonText, { color: theme.text }]}
                    >
                      📚 Save Word
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              // No Strong's data available
              <View style={styles.noData}>
                <Text style={styles.noDataIcon}>📖</Text>
                <Text style={[styles.noDataTitle, { color: theme.text }]}>
                  Word Study Coming Soon
                </Text>
                <Text
                  style={[styles.noDataDescription, { color: theme.textSecondary }]}
                >
                  Hebrew and Greek word definitions with Strong's references will be available in a future update.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity
            onPress={handleClose}
            style={[styles.closeButton, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.closeButtonText, { color: theme.primaryText }]}>
              Close
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
    maxHeight: '80%',
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  word: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  context: {
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  originalWord: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  lemma: {
    fontSize: 36,
    fontWeight: '500',
    marginBottom: 8,
  },
  transliteration: {
    fontSize: 18,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  pronunciation: {
    fontSize: 14,
  },
  strongsNumber: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  strongsText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  shortDefinition: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 26,
  },
  fullDefinition: {
    fontSize: 15,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noData: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  noDataDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 24,
  },
  closeButton: {
    marginHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WordDetailModal;
