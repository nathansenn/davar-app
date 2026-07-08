import { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useReadingStore } from '../../src/stores';
import { useTheme } from '../../src/lib/theme';
import {
  getPlans,
  getPlan,
  getPlanDay,
  formatPassages,
  passageRoute,
} from '../../src/services/planCatalog';

const PLAN_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  'bible-1-year': 'book',
  'new-testament-90': 'heart',
  'psalms-proverbs': 'musical-notes',
};

export default function PlansScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { currentPlan, setCurrentPlan } = useReadingStore();

  const plans = useMemo(() => getPlans(), []);

  const continueReading = () => {
    if (!currentPlan) return;
    const day = getPlanDay(currentPlan.id, currentPlan.currentDay);
    if (day && day.passages.length > 0) {
      router.push(`${passageRoute(day.passages[0])}?planDay=${currentPlan.currentDay}` as any);
    } else {
      router.push('/(tabs)');
    }
  };

  const startPlan = (planId: string) => {
    const plan = getPlan(planId);
    if (!plan) return;
    Alert.alert(
      `Start "${plan.name}"?`,
      `This ${plan.durationDays}-day plan will become your active reading plan.` +
        (currentPlan ? '\n\nThis replaces your current active plan.' : ''),
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Plan',
          onPress: () =>
            setCurrentPlan({
              id: plan.id,
              name: plan.name,
              description: plan.description,
              durationDays: plan.durationDays,
              currentDay: 1,
            }),
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Active Plan Banner */}
      {currentPlan && (
        <View style={{ paddingHorizontal: 24, paddingVertical: 16, backgroundColor: theme.primary }}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, letterSpacing: 1, marginBottom: 4 }}>
            ACTIVE PLAN
          </Text>
          <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' }}>{currentPlan.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)', marginRight: 16 }}>
              <View
                style={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.secondary,
                  width: `${Math.min(100, (currentPlan.currentDay / currentPlan.durationDays) * 100)}%`,
                }}
              />
            </View>
            <Text style={{ color: '#FFFFFF', fontWeight: '500' }}>
              Day {currentPlan.currentDay}/{currentPlan.durationDays}
            </Text>
          </View>
          <TouchableOpacity
            onPress={continueReading}
            accessibilityRole="button"
            accessibilityLabel="Continue today's reading"
            style={{ backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 12, marginTop: 16, alignItems: 'center' }}
            activeOpacity={0.85}
          >
            <Text style={{ color: theme.primary, fontWeight: '600' }}>Continue Today's Reading</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 100 + insets.bottom }}
      >
        <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18, marginBottom: 16 }}>
          Reading Plans
        </Text>

        {plans.map((plan) => {
          const isActive = currentPlan?.id === plan.id;
          const day1 = getPlanDay(plan.id, 1);
          return (
            <View
              key={plan.id}
              style={{
                backgroundColor: theme.surface,
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderWidth: isActive ? 2 : 0,
                borderColor: theme.primary,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View
                  style={{
                    borderRadius: 12,
                    padding: 12,
                    marginRight: 16,
                    backgroundColor: isActive ? theme.primary : theme.primary + '1A',
                  }}
                >
                  <Ionicons
                    name={PLAN_ICONS[plan.id] || 'book'}
                    size={24}
                    color={isActive ? '#FFFFFF' : theme.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 18, flex: 1 }}>
                      {plan.name}
                    </Text>
                    {isActive && (
                      <View style={{ backgroundColor: theme.success + '22', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
                        <Text style={{ color: theme.success, fontSize: 12, fontWeight: '600' }}>Active</Text>
                      </View>
                    )}
                  </View>
                  <Text style={{ color: theme.textMuted, marginTop: 4 }}>{plan.description}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                    <Ionicons name="calendar-outline" size={16} color={theme.textMuted} />
                    <Text style={{ color: theme.textMuted, fontSize: 13, marginLeft: 4 }}>
                      {plan.durationDays} days
                    </Text>
                    {day1 && (
                      <>
                        <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: theme.textMuted, marginHorizontal: 8 }} />
                        <Text style={{ color: theme.textMuted, fontSize: 13, flex: 1 }} numberOfLines={1}>
                          Day 1: {formatPassages(day1.passages)}
                        </Text>
                      </>
                    )}
                  </View>
                </View>
              </View>

              {!isActive && (
                <TouchableOpacity
                  onPress={() => startPlan(plan.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`Start ${plan.name}`}
                  style={{ backgroundColor: theme.primary + '1A', borderRadius: 12, paddingVertical: 12, marginTop: 16, alignItems: 'center' }}
                  activeOpacity={0.85}
                >
                  <Text style={{ color: theme.primary, fontWeight: '600' }}>Start Plan</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
