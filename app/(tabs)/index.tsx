import { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useReadingStore } from '../../src/stores';
import { useTheme } from '../../src/lib/theme';
import { getPlanDay, formatPassages, passageRoute, estimateMinutes } from '../../src/services/planCatalog';
import { getVerseOfDay } from '../../src/utils/verseOfDay';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { streak, todayCompleted, currentPlan, completedDays, updateStreak } = useReadingStore();

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

  const todayDay = currentPlan ? getPlanDay(currentPlan.id, currentPlan.currentDay) : null;
  const todayPassagesText = todayDay ? formatPassages(todayDay.passages) : null;
  const estMinutes = todayDay ? estimateMinutes(todayDay.passages) : 0;
  const startRoute =
    todayDay && currentPlan
      ? `${passageRoute(todayDay.passages[0])}?planDay=${currentPlan.currentDay}`
      : null;

  const progressPercent = currentPlan
    ? Math.round((currentPlan.currentDay / currentPlan.durationDays) * 100)
    : 0;

  const votd = useMemo(() => getVerseOfDay(), []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
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
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18 }}>{getGreeting()},</Text>
          <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: 'bold' }}>{firstName}</Text>
        </View>

        {/* Streak Card */}
        <View
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 16,
            padding: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View style={{ backgroundColor: theme.secondary, borderRadius: 999, padding: 12, marginRight: 16 }}>
            <Text style={{ fontSize: 22 }}>🔥</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' }}>
              {streak} Day{streak !== 1 ? 's' : ''} Streak
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)' }}>
              {streak === 0
                ? 'Start your streak today!'
                : todayCompleted
                ? "You've read today!"
                : 'Keep going — read today!'}
            </Text>
          </View>
          {todayCompleted && <Ionicons name="checkmark-circle" size={28} color={theme.success} />}
        </View>
      </LinearGradient>

      <View style={{ paddingHorizontal: 24, marginTop: -16 }}>
        {/* Today's Reading Card */}
        <View
          style={{
            backgroundColor: theme.surface,
            borderRadius: 16,
            padding: 24,
            marginBottom: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.textMuted, fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>
                {currentPlan ? `TODAY · DAY ${currentPlan.currentDay}` : "TODAY'S READING"}
              </Text>
              <Text style={{ color: theme.text, fontSize: 22, fontWeight: 'bold' }}>
                {todayPassagesText || 'No active plan'}
              </Text>
              {!currentPlan && (
                <Text style={{ color: theme.textMuted, marginTop: 4 }}>
                  Choose a reading plan to get started
                </Text>
              )}
            </View>
            {estMinutes > 0 && (
              <View style={{ backgroundColor: theme.secondary + '33', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4, marginLeft: 8 }}>
                <Text style={{ color: theme.secondaryText, fontWeight: '600' }}>~{estMinutes} min</Text>
              </View>
            )}
          </View>

          {currentPlan && (
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ color: theme.textMuted, fontSize: 13 }}>Plan Progress</Text>
                <Text style={{ color: theme.primary, fontWeight: '500' }}>{progressPercent}%</Text>
              </View>
              <View style={{ backgroundColor: theme.surfaceSecondary, borderRadius: 999, height: 8 }}>
                <View style={{ backgroundColor: theme.primary, borderRadius: 999, height: 8, width: `${progressPercent}%` }} />
              </View>
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.push((startRoute ?? '/(tabs)/plans') as any)}
            accessibilityRole="button"
            accessibilityLabel={
              startRoute ? (todayCompleted ? 'Continue reading' : 'Start reading') : 'Browse reading plans'
            }
            style={{
              backgroundColor: theme.primary,
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            activeOpacity={0.85}
          >
            <Ionicons name={startRoute ? 'book-outline' : 'calendar-outline'} size={20} color="#FFFFFF" />
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16, marginLeft: 8 }}>
              {startRoute ? (todayCompleted ? 'Continue Reading' : 'Start Reading') : 'Browse Plans'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Stats */}
        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
          <View style={{ flex: 1, backgroundColor: theme.surface, borderRadius: 16, padding: 20, alignItems: 'center' }}>
            <Ionicons name="flame" size={28} color={theme.secondary} />
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.text, marginTop: 8 }}>{streak}</Text>
            <Text style={{ color: theme.textMuted, fontSize: 13 }}>Current Streak</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: theme.surface, borderRadius: 16, padding: 20, alignItems: 'center' }}>
            <Ionicons name="checkmark-done" size={28} color={theme.primary} />
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: theme.text, marginTop: 8 }}>
              {completedDays.length}
            </Text>
            <Text style={{ color: theme.textMuted, fontSize: 13 }}>Days Complete</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>Quick Actions</Text>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/plans')}
            accessibilityRole="button"
            accessibilityLabel="Browse reading plans"
            style={{ flex: 1, backgroundColor: theme.surface, borderRadius: 16, padding: 20, alignItems: 'center' }}
            activeOpacity={0.85}
          >
            <Ionicons name="calendar-outline" size={28} color={theme.primary} />
            <Text style={{ color: theme.text, fontWeight: '500', marginTop: 8 }}>Browse Plans</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/read')}
            accessibilityRole="button"
            accessibilityLabel="Find a passage"
            style={{ flex: 1, backgroundColor: theme.surface, borderRadius: 16, padding: 20, alignItems: 'center' }}
            activeOpacity={0.85}
          >
            <Ionicons name="search-outline" size={28} color={theme.primary} />
            <Text style={{ color: theme.text, fontWeight: '500', marginTop: 8 }}>Find Passage</Text>
          </TouchableOpacity>
        </View>

        {/* Verse of the Day */}
        <View style={{ backgroundColor: theme.primary + '0D', borderRadius: 16, padding: 24, marginTop: 24 }}>
          <Text style={{ color: theme.textMuted, fontSize: 13, letterSpacing: 1, marginBottom: 8 }}>
            VERSE OF THE DAY
          </Text>
          <Text style={{ color: theme.text, fontSize: 18, lineHeight: 28, fontStyle: 'italic' }}>
            “{votd.text}”
          </Text>
          <Text style={{ color: theme.primary, fontWeight: '500', marginTop: 12 }}>— {votd.reference}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
