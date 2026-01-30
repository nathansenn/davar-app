import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Bible books organized by testament
const OLD_TESTAMENT = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
  'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
];

const NEW_TESTAMENT = [
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians',
  'Ephesians', 'Philippians', 'Colossians',
  '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy',
  'Titus', 'Philemon', 'Hebrews', 'James',
  '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation',
];

const RECENT_PASSAGES = [
  { ref: 'Psalm 23', title: 'The Lord is my Shepherd' },
  { ref: 'John 3:16', title: 'For God so loved the world' },
  { ref: 'Romans 8', title: 'Life in the Spirit' },
  { ref: 'Philippians 4:6-7', title: 'Do not be anxious' },
];

export default function ReadScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'old' | 'new'>('all');

  const filteredBooks =
    activeTab === 'old'
      ? OLD_TESTAMENT
      : activeTab === 'new'
      ? NEW_TESTAMENT
      : [...OLD_TESTAMENT, ...NEW_TESTAMENT];

  const searchResults = search
    ? filteredBooks.filter((book) =>
        book.toLowerCase().includes(search.toLowerCase())
      )
    : filteredBooks;

  const navigateToBook = (book: string) => {
    const slug = book.toLowerCase().replace(/\s+/g, '-');
    router.push(`/read/${slug}-1`);
  };

  return (
    <View className="flex-1 bg-background">
      {/* Search Bar */}
      <View className="px-6 py-4 bg-white border-b border-border">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search books or passages..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-3 text-text text-base"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Testament Tabs */}
        <View className="flex-row mt-4 gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'old', label: 'Old Testament' },
            { key: 'new', label: 'New Testament' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-2 rounded-full ${
                activeTab === tab.key
                  ? 'bg-primary'
                  : 'bg-gray-100'
              }`}
            >
              <Text
                className={`font-medium ${
                  activeTab === tab.key ? 'text-white' : 'text-muted'
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Recent Passages */}
        {search.length === 0 && (
          <View className="px-6 py-4">
            <Text className="text-text font-bold text-lg mb-3">
              Recent Passages
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="-mx-6 px-6"
            >
              {RECENT_PASSAGES.map((passage, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() =>
                    router.push(
                      `/read/${passage.ref.toLowerCase().replace(/[\s:]+/g, '-')}`
                    )
                  }
                  className="bg-white rounded-xl p-4 mr-3 w-40"
                  activeOpacity={0.8}
                >
                  <Text className="text-primary font-bold">{passage.ref}</Text>
                  <Text className="text-muted text-sm mt-1" numberOfLines={2}>
                    {passage.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Book List */}
        <View className="px-6 py-4">
          <Text className="text-text font-bold text-lg mb-3">
            {search ? 'Search Results' : 'Books of the Bible'}
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {searchResults.map((book, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => navigateToBook(book)}
                className="bg-white rounded-xl px-4 py-3"
                activeOpacity={0.8}
              >
                <Text className="text-text font-medium">{book}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {searchResults.length === 0 && (
            <View className="items-center py-8">
              <Ionicons name="search-outline" size={48} color="#9CA3AF" />
              <Text className="text-muted mt-2">No books found</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
