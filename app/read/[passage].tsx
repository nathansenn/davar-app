import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSettingsStore, useReadingStore } from '../../src/stores';

// Sample scripture data (in real app, this would come from the database)
const SAMPLE_SCRIPTURE: Record<string, { title: string; verses: string[] }> = {
  'psalm-23': {
    title: 'Psalm 23',
    verses: [
      'The LORD is my shepherd; I shall not want.',
      'He makes me lie down in green pastures. He leads me beside still waters.',
      'He restores my soul. He leads me in paths of righteousness for his name\'s sake.',
      'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.',
      'You prepare a table before me in the presence of my enemies; you anoint my head with oil; my cup overflows.',
      'Surely goodness and mercy shall follow me all the days of my life, and I shall dwell in the house of the LORD forever.',
    ],
  },
  'john-3-16': {
    title: 'John 3:16',
    verses: [
      'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    ],
  },
  'genesis-1': {
    title: 'Genesis 1',
    verses: [
      'In the beginning, God created the heavens and the earth.',
      'The earth was without form and void, and darkness was over the face of the deep. And the Spirit of God was hovering over the face of the waters.',
      'And God said, "Let there be light," and there was light.',
      'And God saw that the light was good. And God separated the light from the darkness.',
      'God called the light Day, and the darkness he called Night. And there was evening and there was morning, the first day.',
    ],
  },
};

export default function PassageScreen() {
  const { passage } = useLocalSearchParams<{ passage: string }>();
  const router = useRouter();
  const { fontSizeValue, showVerseNumbers } = useSettingsStore();
  const { markTodayComplete } = useReadingStore();
  const [isLoading, setIsLoading] = useState(true);
  const [scripture, setScripture] = useState<{ title: string; verses: string[] } | null>(null);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [readingComplete, setReadingComplete] = useState(false);

  useEffect(() => {
    // Simulate loading scripture
    const timer = setTimeout(() => {
      const key = passage?.toLowerCase() || '';
      // Try to find matching scripture or default to psalm-23
      const found = SAMPLE_SCRIPTURE[key] || SAMPLE_SCRIPTURE['psalm-23'];
      setScripture(found);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [passage]);

  const handleVersePress = (index: number) => {
    setSelectedVerses((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleMarkComplete = () => {
    markTodayComplete([scripture?.title || passage || 'Unknown']);
    setReadingComplete(true);
  };

  const formatPassageTitle = (p: string) => {
    return p
      ?.replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase()) || 'Scripture';
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#1E3A5F" />
        <Text className="text-muted mt-4">Loading scripture...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: scripture?.title || formatPassageTitle(passage || ''),
          headerRight: () => (
            <TouchableOpacity className="mr-2">
              <Ionicons name="bookmark-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ),
        }}
      />
      <View className="flex-1 bg-background">
        <ScrollView
          className="flex-1 px-6 py-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
        >
          {/* Scripture Content */}
          <View className="bg-white rounded-2xl p-6 shadow-sm">
            {scripture?.verses.map((verse, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleVersePress(index)}
                className={`mb-4 p-3 rounded-xl ${
                  selectedVerses.includes(index) ? 'bg-secondary/20' : ''
                }`}
                activeOpacity={0.7}
              >
                <Text
                  style={{ fontSize: fontSizeValue, lineHeight: fontSizeValue * 1.8 }}
                  className="text-text font-serif"
                >
                  {showVerseNumbers && (
                    <Text className="text-primary font-bold">
                      {index + 1}{' '}
                    </Text>
                  )}
                  {verse}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Selection Actions */}
          {selectedVerses.length > 0 && (
            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity className="flex-1 bg-primary/10 rounded-xl py-3 flex-row items-center justify-center">
                <Ionicons name="color-palette" size={20} color="#1E3A5F" />
                <Text className="text-primary font-medium ml-2">Highlight</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-primary/10 rounded-xl py-3 flex-row items-center justify-center">
                <Ionicons name="create" size={20} color="#1E3A5F" />
                <Text className="text-primary font-medium ml-2">Note</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 bg-primary/10 rounded-xl py-3 flex-row items-center justify-center">
                <Ionicons name="share" size={20} color="#1E3A5F" />
                <Text className="text-primary font-medium ml-2">Share</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Bottom Action Bar */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-4 pb-8">
          {readingComplete ? (
            <View className="flex-row items-center justify-center py-3">
              <Ionicons name="checkmark-circle" size={28} color="#22C55E" />
              <Text className="text-green-600 font-semibold text-lg ml-2">
                Reading Complete! 🎉
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleMarkComplete}
              className="bg-primary rounded-xl py-4 items-center flex-row justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />
              <Text className="text-white font-semibold text-lg ml-2">
                Mark as Complete
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </>
  );
}
