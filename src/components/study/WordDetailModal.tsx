/**
 * WordDetailModal Component
 * Enhanced word study modal with tabs for definition, morphology, usage, and cross-references
 */

import React, { useEffect, useState, useCallback } from 'react';
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
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../../lib/theme';
import { strongsService, type StrongsEntry } from '../../services/strongsService';
import { 
  lexiconService, 
  type EnhancedWordData, 
  type WordFrequency,
  type RelatedWord,
  type CrossReference,
} from '../../services/lexiconService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TabKey = 'definition' | 'morphology' | 'usage' | 'references';

interface WordDetailModalProps {
  visible: boolean;
  onClose: () => void;
  word: string;
  strongsNumber?: string;
  morphCode?: string;
  context?: {
    verse: string;
    translation: string;
    bookId?: string;
    chapter?: number;
    verseNum?: number;
  };
  onSearchStrongs?: (strongsNumber: string) => void;
  onNavigateToReference?: (reference: string) => void;
}

export function WordDetailModal({
  visible,
  onClose,
  word,
  strongsNumber,
  morphCode,
  context,
  onSearchStrongs,
  onNavigateToReference,
}: WordDetailModalProps) {
  const { theme, isDark } = useTheme();
  const [strongs, setStrongs] = useState<StrongsEntry | null>(null);
  const [enhancedData, setEnhancedData] = useState<EnhancedWordData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('definition');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ number: string; entry: StrongsEntry }>>([]);
  const [searchMode, setSearchMode] = useState<'direct' | 'search'>('direct');

  const tabPosition = useSharedValue(0);

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'definition', label: 'Definition', icon: '📖' },
    { key: 'morphology', label: 'Grammar', icon: '📝' },
    { key: 'usage', label: 'Usage', icon: '📊' },
    { key: 'references', label: 'Verses', icon: '🔗' },
  ];

  const language: 'hebrew' | 'greek' = strongs?.lemma && /[\u0590-\u05FF]/.test(strongs.lemma) 
    ? 'hebrew' 
    : 'greek';

  // Load Strong's data when modal opens
  useEffect(() => {
    if (!visible) return;

    const loadData = async () => {
      if (strongsNumber) {
        setLoading(true);
        try {
          const [entry, enhanced] = await Promise.all([
            strongsService.getWord(strongsNumber),
            lexiconService.getEnhancedWordData(strongsNumber, morphCode, language),
          ]);
          setStrongs(entry);
          setEnhancedData(enhanced);
          setSearchMode('direct');
        } catch (error) {
          console.error('Error loading word data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setSearchMode('search');
        setSearchQuery(word.replace(/[^\w\s]/g, ''));
      }
    };

    loadData();
  }, [visible, word, strongsNumber, morphCode]);

  // Handle tab change
  const handleTabChange = useCallback((tab: TabKey, index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    tabPosition.value = withTiming(index, { duration: 200 });
  }, []);

  // Animated indicator style
  const tabIndicatorStyle = useAnimatedStyle(() => {
    const tabWidth = (SCREEN_WIDTH - 48) / tabs.length;
    return {
      transform: [
        { translateX: interpolate(tabPosition.value, [0, 1, 2, 3], [0, tabWidth, tabWidth * 2, tabWidth * 3]) },
      ],
      width: tabWidth - 8,
    };
  });

  // Search concordance
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
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  // Select from search results
  const handleSelectEntry = async (number: string) => {
    setLoading(true);
    try {
      const [entry, enhanced] = await Promise.all([
        strongsService.getWord(number),
        lexiconService.getEnhancedWordData(number, undefined, number.startsWith('H') ? 'hebrew' : 'greek'),
      ]);
      setStrongs(entry);
      setEnhancedData(enhanced);
      setSearchMode('direct');
    } catch (error) {
      console.error('Error loading word data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStrongs(null);
    setEnhancedData(null);
    setSearchResults([]);
    setSearchMode('direct');
    setActiveTab('definition');
    onClose();
  };

  const handleFindInBible = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (strongs && onSearchStrongs && strongsNumber) {
      onSearchStrongs(strongsNumber);
    }
    handleClose();
  };

  const languageLabel = language === 'hebrew' ? 'Hebrew' : 'Greek';

  // Render tab content
  const renderTabContent = () => {
    if (!strongs) return null;

    switch (activeTab) {
      case 'definition':
        return (
          <View style={styles.tabContent}>
            {/* Original Word Card */}
            <View style={[styles.wordCard, { backgroundColor: theme.surfaceSecondary }]}>
              <Text style={[styles.lemma, { color: theme.text }]}>
                {strongs.lemma}
              </Text>
              <Text style={[styles.transliteration, { color: theme.textSecondary }]}>
                {strongs.transliteration}
              </Text>
              {strongs.pronunciation && (
                <Text style={[styles.pronunciation, { color: theme.textMuted }]}>
                  /{strongs.pronunciation}/
                </Text>
              )}
              {strongsNumber && (
                <View style={[styles.strongsBadge, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={[styles.strongsBadgeText, { color: theme.primary }]}>
                    {strongsNumber}
                  </Text>
                </View>
              )}
            </View>

            {/* Definition */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                Definition
              </Text>
              <Text style={[styles.definitionText, { color: theme.text }]}>
                {strongs.definition}
              </Text>
            </View>

            {/* Derivation */}
            {strongs.derivation && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  Etymology
                </Text>
                <Text style={[styles.derivationText, { color: theme.textSecondary }]}>
                  {strongs.derivation}
                </Text>
              </View>
            )}

            {/* KJV Usage */}
            {strongs.kjvUsage && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  KJV Translations
                </Text>
                <View style={styles.usageTagsContainer}>
                  {strongs.kjvUsage.split(',').slice(0, 8).map((usage, i) => (
                    <View 
                      key={i} 
                      style={[styles.usageTag, { backgroundColor: theme.surfaceSecondary }]}
                    >
                      <Text style={[styles.usageTagText, { color: theme.text }]}>
                        {usage.trim()}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Related Words */}
            {enhancedData?.relatedWords && enhancedData.relatedWords.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  Related Words
                </Text>
                {enhancedData.relatedWords.map((related, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.relatedWordItem, { backgroundColor: theme.surfaceSecondary }]}
                    onPress={() => handleSelectEntry(related.strongsNumber)}
                  >
                    <View style={styles.relatedWordHeader}>
                      <Text style={[styles.relatedWordLemma, { color: theme.text }]}>
                        {related.lemma}
                      </Text>
                      <Text style={[styles.relatedWordNumber, { color: theme.primary }]}>
                        {related.strongsNumber}
                      </Text>
                    </View>
                    <Text style={[styles.relatedWordDesc, { color: theme.textMuted }]}>
                      {related.relationship}: {related.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        );

      case 'morphology':
        return (
          <View style={styles.tabContent}>
            {enhancedData?.morphology ? (
              <>
                {/* Part of Speech */}
                <View style={[styles.morphCard, { backgroundColor: theme.surfaceSecondary }]}>
                  <Text style={[styles.morphLabel, { color: theme.textMuted }]}>
                    Part of Speech
                  </Text>
                  <Text style={[styles.morphValue, { color: theme.text }]}>
                    {enhancedData.morphology.partOfSpeech}
                  </Text>
                </View>

                {/* Grammatical Details */}
                {enhancedData.morphology.details.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                      Grammatical Analysis
                    </Text>
                    <View style={styles.morphGrid}>
                      {enhancedData.morphology.details.map((detail, i) => (
                        <View 
                          key={i} 
                          style={[styles.morphGridItem, { backgroundColor: theme.surfaceSecondary }]}
                        >
                          <Text style={[styles.morphGridText, { color: theme.text }]}>
                            {detail}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Full Description */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    Full Form
                  </Text>
                  <Text style={[styles.fullMorph, { color: theme.text }]}>
                    {enhancedData.morphology.fullDescription}
                  </Text>
                </View>

                {morphCode && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                      Morphology Code
                    </Text>
                    <View style={[styles.codeBox, { backgroundColor: theme.surfaceSecondary }]}>
                      <Text style={[styles.codeText, { color: theme.primary }]}>
                        {morphCode}
                      </Text>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📝</Text>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  No Morphology Data
                </Text>
                <Text style={[styles.emptyDesc, { color: theme.textMuted }]}>
                  Grammatical analysis is available when viewing words in interlinear mode with tagged texts.
                </Text>
              </View>
            )}
          </View>
        );

      case 'usage':
        return (
          <View style={styles.tabContent}>
            {enhancedData?.frequency ? (
              <>
                {/* Frequency Stats */}
                <View style={[styles.statsCard, { backgroundColor: theme.surfaceSecondary }]}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.primary }]}>
                      {enhancedData.frequency.total}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                      Total Uses
                    </Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.text }]}>
                      {enhancedData.frequency.ot}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                      Old Testament
                    </Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: theme.text }]}>
                      {enhancedData.frequency.nt}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.textMuted }]}>
                      New Testament
                    </Text>
                  </View>
                </View>

                {/* Top Books */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    Most Common In
                  </Text>
                  {enhancedData.frequency.books.map((book, i) => (
                    <View 
                      key={i} 
                      style={[styles.bookItem, { backgroundColor: theme.surfaceSecondary }]}
                    >
                      <Text style={[styles.bookName, { color: theme.text }]}>
                        {book.bookId}
                      </Text>
                      <View style={styles.bookBarContainer}>
                        <View 
                          style={[
                            styles.bookBar, 
                            { 
                              backgroundColor: theme.primary,
                              width: `${Math.min((book.count / enhancedData.frequency!.books[0].count) * 100, 100)}%`,
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.bookCount, { color: theme.textMuted }]}>
                        {book.count}×
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  Usage Data Loading
                </Text>
                <Text style={[styles.emptyDesc, { color: theme.textMuted }]}>
                  Word frequency and distribution data is being compiled.
                </Text>
              </View>
            )}
          </View>
        );

      case 'references':
        return (
          <View style={styles.tabContent}>
            {enhancedData?.crossReferences && enhancedData.crossReferences.length > 0 ? (
              <>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  Key Verses
                </Text>
                {enhancedData.crossReferences.map((ref, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.refItem, { backgroundColor: theme.surfaceSecondary }]}
                    onPress={() => onNavigateToReference?.(ref.reference)}
                  >
                    <View style={styles.refHeader}>
                      <Text style={[styles.refReference, { color: theme.primary }]}>
                        {ref.reference}
                      </Text>
                      {ref.relevance === 'primary' && (
                        <View style={[styles.primaryBadge, { backgroundColor: theme.primary + '20' }]}>
                          <Text style={[styles.primaryBadgeText, { color: theme.primary }]}>
                            Key
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text 
                      style={[styles.refText, { color: theme.text }]}
                      numberOfLines={2}
                    >
                      {ref.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🔗</Text>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>
                  Cross References
                </Text>
                <Text style={[styles.emptyDesc, { color: theme.textMuted }]}>
                  Key verses containing this word will appear here.
                </Text>
                <TouchableOpacity
                  style={[styles.searchVersesBtn, { backgroundColor: theme.primary }]}
                  onPress={handleFindInBible}
                >
                  <Text style={styles.searchVersesBtnText}>
                    🔍 Find All Occurrences
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
    }
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
            <View style={[styles.handle, { backgroundColor: theme.border }]} />
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

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textMuted }]}>
                Loading word data...
              </Text>
            </View>
          ) : strongs ? (
            <>
              {/* Tab Bar */}
              <View style={styles.tabBar}>
                <Animated.View 
                  style={[
                    styles.tabIndicator, 
                    { backgroundColor: theme.primary },
                    tabIndicatorStyle,
                  ]} 
                />
                {tabs.map((tab, index) => (
                  <TouchableOpacity
                    key={tab.key}
                    style={styles.tabButton}
                    onPress={() => handleTabChange(tab.key, index)}
                  >
                    <Text style={styles.tabIcon}>{tab.icon}</Text>
                    <Text 
                      style={[
                        styles.tabLabel,
                        { color: activeTab === tab.key ? theme.primary : theme.textMuted },
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Tab Content */}
              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
              >
                {renderTabContent()}
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.surfaceSecondary }]}
                  onPress={handleFindInBible}
                >
                  <Text style={[styles.actionButtonText, { color: theme.text }]}>
                    🔍 Find in Bible
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.surfaceSecondary }]}
                  onPress={() => {
                    setSearchMode('search');
                    setStrongs(null);
                  }}
                >
                  <Text style={[styles.actionButtonText, { color: theme.text }]}>
                    📚 Search More
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : searchMode === 'search' ? (
            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Search Interface */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
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
                    style={[styles.searchButton, { backgroundColor: theme.primary }]}
                    onPress={handleSearch}
                  >
                    <Text style={styles.searchButtonText}>Search</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                    Results ({searchResults.length})
                  </Text>
                  {searchResults.map((result) => (
                    <TouchableOpacity
                      key={result.number}
                      style={[styles.resultItem, { backgroundColor: theme.surfaceSecondary }]}
                      onPress={() => handleSelectEntry(result.number)}
                    >
                      <View style={styles.resultHeader}>
                        <Text style={[styles.resultLemma, { color: theme.text }]}>
                          {result.entry.lemma}
                        </Text>
                        <Text style={[styles.resultNumber, { color: theme.primary }]}>
                          {result.number}
                        </Text>
                      </View>
                      <Text style={[styles.resultTranslit, { color: theme.textSecondary }]}>
                        {result.entry.transliteration}
                      </Text>
                      <Text
                        style={[styles.resultDefinition, { color: theme.textMuted }]}
                        numberOfLines={2}
                      >
                        {result.entry.definition}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📖</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>
                Word Study
              </Text>
              <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
                Search the Strong's Concordance to explore word meanings.
              </Text>
              <TouchableOpacity
                style={[styles.searchConcordanceButton, { backgroundColor: theme.primary }]}
                onPress={() => setSearchMode('search')}
              >
                <Text style={styles.searchConcordanceButtonText}>
                  🔎 Search Concordance
                </Text>
              </TouchableOpacity>
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
    maxHeight: '90%',
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
  word: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  context: {
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
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    position: 'relative',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 4,
    height: 3,
    borderRadius: 1.5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  // Content
  content: {
    maxHeight: 400,
  },
  contentContainer: {
    paddingBottom: 16,
  },
  tabContent: {
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  // Word Card
  wordCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  lemma: {
    fontSize: 44,
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
    marginBottom: 12,
  },
  strongsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  strongsBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  // Definition
  definitionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  derivationText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  // Usage Tags
  usageTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  usageTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  usageTagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  // Related Words
  relatedWordItem: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  relatedWordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  relatedWordLemma: {
    fontSize: 20,
    fontWeight: '500',
  },
  relatedWordNumber: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  relatedWordDesc: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  // Morphology
  morphCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  morphLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  morphValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  morphGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  morphGridItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  morphGridText: {
    fontSize: 14,
    fontWeight: '500',
  },
  fullMorph: {
    fontSize: 15,
    lineHeight: 22,
  },
  codeBox: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  // Stats
  statsCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    marginVertical: 8,
  },
  // Book frequency
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
  },
  bookName: {
    width: 50,
    fontSize: 13,
    fontWeight: '600',
  },
  bookBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  bookBar: {
    height: '100%',
    borderRadius: 4,
  },
  bookCount: {
    width: 40,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  // References
  refItem: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  refHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  refReference: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  refText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
    marginBottom: 20,
  },
  searchVersesBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  searchVersesBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  // Actions
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  // Search
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
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
    marginHorizontal: 24,
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

export default WordDetailModal;
