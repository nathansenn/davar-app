/**
 * WordDetailModal Component
 * Enhanced word study modal with Strong's concordance lookup
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../lib/theme';
import { strongsService, type StrongsEntry } from '../../services/strongsService';

interface WordDetailModalProps {
  visible: boolean;
  onClose: () => void;
  word: string;
  strongsNumber?: string; // Optional pre-linked Strong's number
  context?: {
    verse: string;
    translation: string;
    bookId?: string;
    chapter?: number;
    verseNum?: number;
  };
  onSearchStrongs?: (strongsNumber: string) => void;
}

export function WordDetailModal({
  visible,
  onClose,
  word,
  strongsNumber,
  context,
  onSearchStrongs,
}: WordDetailModalProps) {
  const { theme, isDark } = useTheme();
  const [strongs, setStrongs] = useState<StrongsEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ number: string; entry: StrongsEntry }>>([]);
  const [searchMode, setSearchMode] = useState<'direct' | 'search'>('direct');

  // Load Strong's data when modal opens or word changes
  useEffect(() => {
    if (!visible) return;

    const loadStrongsData = async () => {
      if (strongsNumber) {
        setLoading(true);
        try {
          const entry = await strongsService.getWord(strongsNumber);
          setStrongs(entry);
          setSearchMode('direct');
        } catch (error) {
          console.error('Error loading Strong\'s data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // No direct Strong's number - show search
        setSearchMode('search');
        setSearchQuery(word.replace(/[^\w\s]/g, '')); // Clean word
      }
    };

    loadStrongsData();
  }, [visible, word, strongsNumber]);

  // Search Strong's concordance
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await strongsService.search(searchQuery, {
        language: 'both',
        maxResults: 20,
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching Strong\'s:', error);
    } finally {
      setLoading(false);
    }
  };

  // Select a Strong's entry from search results
  const handleSelectEntry = async (number: string) => {
    setLoading(true);
    try {
      const entry = await strongsService.getWord(number);
      setStrongs(entry);
      setSearchMode('direct');
    } catch (error) {
      console.error('Error loading Strong\'s data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStrongs(null);
    setSearchResults([]);
    setSearchMode('direct');
    onClose();
  };

  const handleFindInBible = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (strongs && onSearchStrongs) {
      const prefix = strongs.lemma && /[\u0590-\u05FF]/.test(strongs.lemma) ? 'H' : 'G';
      const number = strongsNumber || `${prefix}${searchQuery}`;
      onSearchStrongs(number);
    }
    handleClose();
  };

  const language = strongs?.lemma && /[\u0590-\u05FF]/.test(strongs.lemma) ? 'hebrew' : 'greek';
  const languageLabel = language === 'hebrew' ? 'Hebrew' : 'Greek';

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
            <Text style={[styles.word, { color: theme.text }]}>"{word}"</Text>
            {context && (
              <Text style={[styles.context, { color: theme.textMuted }]}>
                {context.verse} ({context.translation})
              </Text>
            )}
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                  Loading word data...
                </Text>
              </View>
            ) : strongs ? (
              <>
                {/* Original Language Section */}
                <View style={styles.section}>
                  <Text
                    style={[styles.sectionTitle, { color: theme.textSecondary }]}
                  >
                    {languageLabel}
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
                    {strongs.pronunciation && (
                      <Text
                        style={[styles.pronunciation, { color: theme.textMuted }]}
                      >
                        {strongs.pronunciation}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Strong's Number */}
                {strongsNumber && (
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
                        {strongsNumber}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Definition */}
                <View style={styles.section}>
                  <Text
                    style={[styles.sectionTitle, { color: theme.textSecondary }]}
                  >
                    Definition
                  </Text>
                  <Text style={[styles.fullDefinition, { color: theme.text }]}>
                    {strongs.definition}
                  </Text>
                </View>

                {/* Derivation */}
                {strongs.derivation && (
                  <View style={styles.section}>
                    <Text
                      style={[styles.sectionTitle, { color: theme.textSecondary }]}
                    >
                      Derivation
                    </Text>
                    <Text
                      style={[styles.derivation, { color: theme.textSecondary }]}
                    >
                      {strongs.derivation}
                    </Text>
                  </View>
                )}

                {/* KJV Usage */}
                {strongs.kjvUsage && (
                  <View style={styles.section}>
                    <Text
                      style={[styles.sectionTitle, { color: theme.textSecondary }]}
                    >
                      KJV Usage
                    </Text>
                    <Text
                      style={[styles.kjvUsage, { color: theme.textSecondary }]}
                    >
                      {strongs.kjvUsage}
                    </Text>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: theme.surfaceSecondary },
                    ]}
                    onPress={handleFindInBible}
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
                    onPress={() => setSearchMode('search')}
                  >
                    <Text
                      style={[styles.actionButtonText, { color: theme.text }]}
                    >
                      🔎 Search Concordance
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : searchMode === 'search' ? (
              <>
                {/* Search Interface */}
                <View style={styles.section}>
                  <Text
                    style={[styles.sectionTitle, { color: theme.textSecondary }]}
                  >
                    Search Strong's Concordance
                  </Text>
                  
                  <View style={styles.searchContainer}>
                    <TextInput
                      style={[
                        styles.searchInput,
                        {
                          backgroundColor: theme.surfaceSecondary,
                          color: theme.text,
                          borderColor: theme.border,
                        },
                      ]}
                      placeholder="Enter word or Strong's number..."
                      placeholderTextColor={theme.textMuted}
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                      onSubmitEditing={handleSearch}
                      autoCapitalize="none"
                      returnKeyType="search"
                    />
                    <TouchableOpacity
                      style={[
                        styles.searchButton,
                        { backgroundColor: theme.primary },
                      ]}
                      onPress={handleSearch}
                    >
                      <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <View style={styles.section}>
                    <Text
                      style={[styles.sectionTitle, { color: theme.textSecondary }]}
                    >
                      Results ({searchResults.length})
                    </Text>
                    
                    {searchResults.map((result) => (
                      <TouchableOpacity
                        key={result.number}
                        style={[
                          styles.resultItem,
                          { backgroundColor: theme.surfaceSecondary },
                        ]}
                        onPress={() => handleSelectEntry(result.number)}
                      >
                        <View style={styles.resultHeader}>
                          <Text style={[styles.resultLemma, { color: theme.text }]}>
                            {result.entry.lemma}
                          </Text>
                          <Text
                            style={[styles.resultNumber, { color: theme.primary }]}
                          >
                            {result.number}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.resultTranslit,
                            { color: theme.textSecondary },
                          ]}
                        >
                          {result.entry.transliteration}
                        </Text>
                        <Text
                          style={[
                            styles.resultDefinition,
                            { color: theme.textMuted },
                          ]}
                          numberOfLines={2}
                        >
                          {result.entry.definition}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {searchResults.length === 0 && searchQuery && !loading && (
                  <View style={styles.noResults}>
                    <Text style={styles.noResultsIcon}>📚</Text>
                    <Text style={[styles.noResultsText, { color: theme.textMuted }]}>
                      No results found for "{searchQuery}"
                    </Text>
                    <Text
                      style={[styles.noResultsHint, { color: theme.textMuted }]}
                    >
                      Try searching with a Strong's number (H1234 or G5678) or an English/Greek/Hebrew word
                    </Text>
                  </View>
                )}
              </>
            ) : (
              // No Strong's data available
              <View style={styles.noData}>
                <Text style={styles.noDataIcon}>📖</Text>
                <Text style={[styles.noDataTitle, { color: theme.text }]}>
                  Word Study
                </Text>
                <Text
                  style={[styles.noDataDescription, { color: theme.textSecondary }]}
                >
                  Tap "Search Concordance" to look up this word in the Strong's Hebrew and Greek dictionary.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.searchConcordanceButton,
                    { backgroundColor: theme.primary },
                  ]}
                  onPress={() => setSearchMode('search')}
                >
                  <Text style={styles.searchConcordanceButtonText}>
                    🔎 Search Concordance
                  </Text>
                </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  word: {
    fontSize: 24,
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
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
    fontSize: 40,
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
  fullDefinition: {
    fontSize: 16,
    lineHeight: 24,
  },
  derivation: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  kjvUsage: {
    fontSize: 14,
    lineHeight: 22,
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
  // Search styles
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  searchButton: {
    height: 48,
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultItem: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultLemma: {
    fontSize: 24,
    fontWeight: '500',
  },
  resultNumber: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  resultTranslit: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  resultDefinition: {
    fontSize: 13,
    lineHeight: 18,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noResultsIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  noResultsHint: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
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
    marginBottom: 20,
  },
  searchConcordanceButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  searchConcordanceButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
