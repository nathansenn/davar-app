import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/lib/theme';
import { useSettingsStore } from '../../src/stores';
import { bibleService } from '../../src/services/bibleService';
import { bookIdToSlug, getTestament } from '../../src/utils/bookSlug';
import { parseReference, referenceToPath } from '../../src/utils/referenceParser';
import type { BookMetadata } from '../../src/types/bible';
import type { TranslationCode } from '../../src/types/bible';

type TestamentTab = 'all' | 'OT' | 'NT';

export default function ReadScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const defaultTranslation = useSettingsStore((s) => s.defaultTranslation) as TranslationCode;

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TestamentTab>('all');
  const [pickerBook, setPickerBook] = useState<BookMetadata | null>(null);

  const allBooks = useMemo(() => bibleService.getBooks(), []);
  const query = search.trim();

  const booksForTab = useMemo(
    () => allBooks.filter((b) => activeTab === 'all' || getTestament(b.id) === activeTab),
    [allBooks, activeTab]
  );

  const bookMatches = useMemo(() => {
    if (!query) return booksForTab;
    const q = query.toLowerCase();
    return booksForTab.filter((b) => b.name.toLowerCase().includes(q));
  }, [booksForTab, query]);

  // Interpret the query as a scripture reference (e.g. "John 3:16")
  const referenceMatch = useMemo(() => (query ? parseReference(query) : null), [query]);

  // Full-text verse search (gated on length to avoid scanning on 1-2 chars)
  const verseResults = useMemo(() => {
    if (query.length < 3) return [];
    return bibleService.search(query, defaultTranslation, { limit: 25 });
  }, [query, defaultTranslation]);

  const openBook = (book: BookMetadata) => {
    if (book.chapters === 1) {
      router.push(`/read/${bookIdToSlug(book.id)}-1`);
    } else {
      setPickerBook(book);
    }
  };

  const goToChapter = (book: BookMetadata, chapter: number) => {
    setPickerBook(null);
    router.push(`/read/${bookIdToSlug(book.id)}-${chapter}`);
  };

  const goToReference = () => {
    if (!referenceMatch) return;
    router.push(referenceToPath(referenceMatch) as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Search Bar */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 16,
          backgroundColor: theme.surface,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.surfaceSecondary,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <Ionicons name="search" size={20} color={theme.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search books, references, or words…"
            placeholderTextColor={theme.placeholder}
            returnKeyType="search"
            onSubmitEditing={referenceMatch ? goToReference : undefined}
            accessibilityLabel="Search the Bible"
            style={{ flex: 1, marginLeft: 12, color: theme.text, fontSize: 16 }}
          />
          {search.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearch('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={20} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Testament Tabs */}
        <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
          {([
            { key: 'all', label: 'All' },
            { key: 'OT', label: 'Old Testament' },
            { key: 'NT', label: 'New Testament' },
          ] as const).map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 999,
                  backgroundColor: active ? theme.primary : theme.surfaceSecondary,
                }}
              >
                <Text style={{ fontWeight: '500', color: active ? '#FFFFFF' : theme.textMuted }}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Jump-to-reference card */}
        {referenceMatch && (
          <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
            <TouchableOpacity
              onPress={goToReference}
              accessibilityRole="button"
              accessibilityLabel={`Go to ${referenceMatch.bookName} ${referenceMatch.chapter}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.primary,
                borderRadius: 12,
                padding: 16,
              }}
            >
              <Ionicons name="arrow-forward-circle" size={24} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16, marginLeft: 12 }}>
                Go to {referenceMatch.bookName} {referenceMatch.chapter}
                {referenceMatch.verseStart ? `:${referenceMatch.verseStart}` : ''}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Verse search results */}
        {verseResults.length > 0 && (
          <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>
              In {defaultTranslation}
            </Text>
            {verseResults.map((r) => (
              <TouchableOpacity
                key={`${r.bookId}-${r.chapter}-${r.verse}`}
                onPress={() => router.push(`/read/${bookIdToSlug(r.bookId)}-${r.chapter}?verse=${r.verse}` as any)}
                accessibilityRole="button"
                accessibilityLabel={`${r.reference}. ${r.text}`}
                style={{
                  backgroundColor: theme.surface,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: theme.primary, fontWeight: '600', marginBottom: 4 }}>
                  {r.reference}
                </Text>
                <Text style={{ color: theme.textSecondary, lineHeight: 20 }} numberOfLines={2}>
                  {r.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Book list */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
          <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>
            {query ? 'Books' : 'Books of the Bible'}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {bookMatches.map((book) => (
              <TouchableOpacity
                key={book.id}
                onPress={() => openBook(book)}
                accessibilityRole="button"
                accessibilityLabel={`${book.name}, ${book.chapters} chapter${book.chapters === 1 ? '' : 's'}`}
                style={{ backgroundColor: theme.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 }}
              >
                <Text style={{ color: theme.text, fontWeight: '500' }}>{book.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {bookMatches.length === 0 && verseResults.length === 0 && !referenceMatch && (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Ionicons name="search-outline" size={48} color={theme.textMuted} />
              <Text style={{ color: theme.textMuted, marginTop: 8 }}>No results for “{query}”</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Chapter picker modal */}
      <Modal
        visible={pickerBook !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerBook(null)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
          onPress={() => setPickerBook(null)}
        >
          <Pressable
            style={{
              backgroundColor: theme.surface,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 24 + insets.bottom,
              maxHeight: '70%',
            }}
            accessibilityViewIsModal
          >
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: theme.border }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 20 }}>
                {pickerBook?.name}
              </Text>
              <TouchableOpacity
                onPress={() => setPickerBook(null)}
                accessibilityRole="button"
                accessibilityLabel="Close chapter picker"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={theme.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {pickerBook &&
                  Array.from({ length: pickerBook.chapters }, (_, i) => i + 1).map((ch) => (
                    <TouchableOpacity
                      key={ch}
                      onPress={() => goToChapter(pickerBook, ch)}
                      accessibilityRole="button"
                      accessibilityLabel={`${pickerBook.name} chapter ${ch}`}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: theme.surfaceSecondary,
                      }}
                    >
                      <Text style={{ color: theme.text, fontWeight: '600', fontSize: 16 }}>{ch}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
