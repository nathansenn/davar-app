/**
 * StrongsSearchModal Component
 * Shows all verses containing a specific Strong's number
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import { strongsSearchService, type StrongsSearchResult } from '../../services/strongsSearchService';
import { strongsService } from '../../services/strongsService';

interface StrongsSearchModalProps {
  visible: boolean;
  onClose: () => void;
  strongsNumber: string;
  onNavigateToVerse: (reference: string) => void;
}

export function StrongsSearchModal({
  visible,
  onClose,
  strongsNumber,
  onNavigateToVerse,
}: StrongsSearchModalProps) {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<StrongsSearchResult[]>([]);
  const [wordInfo, setWordInfo] = useState<{ lemma: string; transliteration: string } | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (!visible || !strongsNumber) return;

    const loadResults = async () => {
      setLoading(true);
      try {
        // Load word info
        const entry = await strongsService.getWord(strongsNumber);
        if (entry) {
          setWordInfo({
            lemma: entry.lemma,
            transliteration: entry.transliteration,
          });
        }

        // Search for occurrences
        const searchResults = await strongsSearchService.searchByStrongs(strongsNumber, {
          limit: 100,
          includeContext: true,
        });
        
        setResults(searchResults.results);
        setTotalCount(searchResults.total);
      } catch (error) {
        console.error('Error searching Strong\'s:', error);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [visible, strongsNumber]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const handleVersePress = (result: StrongsSearchResult) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigateToVerse(result.reference);
  };

  const renderResult = ({ item, index }: { item: StrongsSearchResult; index: number }) => (
    <TouchableOpacity
      style={[styles.resultItem, { backgroundColor: theme.surfaceSecondary }]}
      onPress={() => handleVersePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.resultHeader}>
        <Text style={[styles.reference, { color: theme.primary }]}>
          {item.reference}
        </Text>
        <Text style={[styles.resultIndex, { color: theme.textMuted }]}>
          #{index + 1}
        </Text>
      </View>
      <Text style={[styles.verseText, { color: theme.text }]} numberOfLines={3}>
        {item.text}
      </Text>
      {item.highlightedWord && (
        <View style={[styles.highlightBadge, { backgroundColor: theme.primary + '20' }]}>
          <Text style={[styles.highlightText, { color: theme.primary }]}>
            {item.highlightedWord}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

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
            <View style={[styles.handle, { backgroundColor: theme.border }]} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>
              Find in Bible
            </Text>
            {wordInfo && (
              <View style={styles.wordInfo}>
                <Text style={[styles.lemma, { color: theme.text }]}>
                  {wordInfo.lemma}
                </Text>
                <Text style={[styles.transliteration, { color: theme.textSecondary }]}>
                  ({wordInfo.transliteration})
                </Text>
                <View style={[styles.strongsBadge, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={[styles.strongsText, { color: theme.primary }]}>
                    {strongsNumber}
                  </Text>
                </View>
              </View>
            )}
            {!loading && (
              <Text style={[styles.countText, { color: theme.textMuted }]}>
                {totalCount} occurrence{totalCount !== 1 ? 's' : ''} found
              </Text>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                Searching the Bible...
              </Text>
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              renderItem={renderResult}
              keyExtractor={(item, index) => `${item.reference}-${index}`}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                No Results Found
              </Text>
              <Text style={[styles.emptyDesc, { color: theme.textMuted }]}>
                No verses found with this Strong's number in the available texts.
              </Text>
            </View>
          )}

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
    maxHeight: '85%',
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
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  wordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  lemma: {
    fontSize: 28,
    fontWeight: '500',
  },
  transliteration: {
    fontSize: 16,
    fontStyle: 'italic',
  },
  strongsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  strongsText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  countText: {
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  resultItem: {
    padding: 16,
    borderRadius: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reference: {
    fontSize: 16,
    fontWeight: '700',
  },
  resultIndex: {
    fontSize: 12,
  },
  verseText: {
    fontSize: 14,
    lineHeight: 22,
  },
  highlightBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  highlightText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  closeButton: {
    marginHorizontal: 24,
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StrongsSearchModal;
