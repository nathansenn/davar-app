import { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useReadingStore } from '../../src/stores';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const { streak, todayCompleted, todayPassages, currentPlan, updateStreak } =
    useReadingStore();

  useEffect(() => {
    updateStreak();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.name?.split(' ')[0] || 'Friend';

  // Demo passage for today
  const todayReading = {
    title: 'Psalm 23',
    subtitle: 'The Lord is my Shepherd',
    verses: 6,
    estimatedTime: '3 min',
  };

  const progressPercent = currentPlan
    ? Math.round(
        (currentPlan.currentDay / currentPlan.durationDays) * 100
      )
    : 0;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#1E3A5F', '#2D5A87']}
        style={{
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          paddingBottom: 40,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        {/* Greeting */}
        <View className="mb-6">
          <Text className="text-white/80 text-lg">{getGreeting()},</Text>
          <Text className="text-white text-3xl font-bold">{firstName}</Text>
        </View>

        {/* Streak Card */}
        <View className="bg-white/15 rounded-2xl p-5 flex-row items-center">
          <View className="bg-secondary rounded-full p-3 mr-4">
            <Text className="text-2xl">🔥</Text>
          </View>
          <View className="flex-1">
            <Text className="text-white text-2xl font-bold">
              {streak} Day{streak !== 1 ? 's' : ''} Streak
            </Text>
            <Text className="text-white/70">
              {streak === 0
                ? 'Start your streak today!'
                : todayCompleted
                ? "You've read today!"
                : 'Keep going - read today!'}
            </Text>
          </View>
          {todayCompleted && (
            <Ionicons name="checkmark-circle" size={28} color="#22C55E" />
          )}
        </View>
      </LinearGradient>

      <View className="px-6 -mt-4">
        {/* Today's Reading Card */}
        <TouchableOpacity
          onPress={() => router.push('/read/psalm-23')}
          activeOpacity={0.9}
          className="bg-white rounded-2xl p-6 shadow-lg shadow-black/10 mb-6"
        >
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-muted text-sm uppercase tracking-wider mb-1">
                Today's Reading
              </Text>
              <Text className="text-text text-2xl font-bold">
                {todayReading.title}
              </Text>
              <Text className="text-muted mt-1">{todayReading.subtitle}</Text>
            </View>
            <View className="bg-secondary/20 rounded-full px-3 py-1">
              <Text className="text-secondary font-semibold">
                {todayReading.estimatedTime}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          {currentPlan && (
            <View className="mb-5">
              <View className="flex-row justify-between mb-2">
                <Text className="text-muted text-sm">Plan Progress</Text>
                <Text className="text-primary font-medium">
                  {progressPercent}%
                </Text>
              </View>
              <View className="bg-gray-200 rounded-full h-2">
                <View
                  className="bg-primary rounded-full h-2"
                  style={{ width: `${progressPercent}%` }}
                />
              </View>
            </View>
          )}

          {/* Start Reading Button */}
          <TouchableOpacity
            onPress={() => router.push('/read/psalm-23')}
            className="bg-primary rounded-xl py-4 items-center flex-row justify-center"
            activeOpacity={0.8}
          >
            <Ionicons name="book-outline" size={20} color="#FFFFFF" />
            <Text className="text-white font-semibold text-lg ml-2">
              {todayCompleted ? 'Continue Reading' : 'Start Reading'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-white rounded-2xl p-5 items-center">
            <Ionicons name="flame" size={28} color="#C9A227" />
            <Text className="text-2xl font-bold text-text mt-2">{streak}</Text>
            <Text className="text-muted text-sm">Current Streak</Text>
          </View>
          <View className="flex-1 bg-white rounded-2xl p-5 items-center">
            <Ionicons name="book" size={28} color="#1E3A5F" />
            <Text className="text-2xl font-bold text-text mt-2">
              {currentPlan?.currentDay || 0}
            </Text>
            <Text className="text-muted text-sm">Days Complete</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text className="text-text font-bold text-lg mb-4">Quick Actions</Text>
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/plans')}
            className="flex-1 bg-white rounded-2xl p-5 items-center"
            activeOpacity={0.8}
          >
            <Ionicons name="calendar-outline" size={28} color="#1E3A5F" />
            <Text className="text-text font-medium mt-2">Browse Plans</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/read')}
            className="flex-1 bg-white rounded-2xl p-5 items-center"
            activeOpacity={0.8}
          >
            <Ionicons name="search-outline" size={28} color="#1E3A5F" />
            <Text className="text-text font-medium mt-2">Find Passage</Text>
          </TouchableOpacity>
        </View>

        {/* Verse of the Day */}
        <View className="bg-primary/5 rounded-2xl p-6 mt-6">
          <Text className="text-muted text-sm uppercase tracking-wider mb-2">
            Verse of the Day
          </Text>
          <Text className="text-text text-lg leading-7 font-serif italic">
            "The Lord is my shepherd; I shall not want. He makes me lie down in
            green pastures. He leads me beside still waters."
          </Text>
          <Text className="text-primary font-medium mt-3">— Psalm 23:1-2</Text>
        </View>
      </View>
    </ScrollView>
  );
}
