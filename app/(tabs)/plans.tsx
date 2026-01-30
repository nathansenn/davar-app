import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useReadingStore } from '../../src/stores';

interface Plan {
  id: string;
  name: string;
  description: string;
  durationDays: number;
  category: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const READING_PLANS: Plan[] = [
  {
    id: 'bible-in-year',
    name: 'Bible in a Year',
    description: 'Read through the entire Bible in 365 days',
    durationDays: 365,
    category: 'Complete Bible',
    icon: 'book',
  },
  {
    id: 'gospels-30',
    name: 'Gospels in 30 Days',
    description: 'Journey through Matthew, Mark, Luke & John',
    durationDays: 30,
    category: 'New Testament',
    icon: 'heart',
  },
  {
    id: 'psalms-30',
    name: 'Psalms in 30 Days',
    description: 'Explore all 150 Psalms in one month',
    durationDays: 30,
    category: 'Old Testament',
    icon: 'musical-notes',
  },
  {
    id: 'proverbs-31',
    name: 'Proverbs in 31 Days',
    description: 'One chapter of wisdom each day',
    durationDays: 31,
    category: 'Wisdom Literature',
    icon: 'bulb',
  },
  {
    id: 'new-testament-90',
    name: 'New Testament in 90 Days',
    description: 'Complete the New Testament in 3 months',
    durationDays: 90,
    category: 'New Testament',
    icon: 'document-text',
  },
  {
    id: 'genesis-exodus',
    name: 'Genesis & Exodus',
    description: 'The story of creation and redemption',
    durationDays: 45,
    category: 'Old Testament',
    icon: 'globe',
  },
];

export default function PlansScreen() {
  const router = useRouter();
  const { currentPlan, setCurrentPlan, completedDays } = useReadingStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [...new Set(READING_PLANS.map((p) => p.category))];

  const filteredPlans = selectedCategory
    ? READING_PLANS.filter((p) => p.category === selectedCategory)
    : READING_PLANS;

  const startPlan = (plan: Plan) => {
    Alert.alert(
      'Start Reading Plan',
      `Start "${plan.name}"?\n\nThis ${plan.durationDays}-day plan will become your active reading plan.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Plan',
          onPress: () => {
            setCurrentPlan({
              id: plan.id,
              name: plan.name,
              description: plan.description,
              durationDays: plan.durationDays,
              currentDay: 1,
            });
            Alert.alert('Plan Started! 🎉', `Day 1 of ${plan.name} begins now.`);
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      {/* Current Plan Card */}
      {currentPlan && (
        <View className="px-6 py-4 bg-primary">
          <Text className="text-white/80 text-sm uppercase tracking-wider mb-1">
            Active Plan
          </Text>
          <Text className="text-white text-xl font-bold">
            {currentPlan.name}
          </Text>
          <View className="flex-row items-center mt-3">
            <View className="flex-1 bg-white/20 rounded-full h-2 mr-4">
              <View
                className="bg-secondary rounded-full h-2"
                style={{
                  width: `${(currentPlan.currentDay / currentPlan.durationDays) * 100}%`,
                }}
              />
            </View>
            <Text className="text-white font-medium">
              Day {currentPlan.currentDay}/{currentPlan.durationDays}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)')}
            className="bg-white rounded-xl py-3 mt-4 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-primary font-semibold">
              Continue Today's Reading
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-6 py-4 border-b border-border bg-white"
        contentContainerStyle={{ gap: 8 }}
      >
        <TouchableOpacity
          onPress={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full ${
            !selectedCategory ? 'bg-primary' : 'bg-gray-100'
          }`}
        >
          <Text
            className={`font-medium ${
              !selectedCategory ? 'text-white' : 'text-muted'
            }`}
          >
            All Plans
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full ${
              selectedCategory === category ? 'bg-primary' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`font-medium ${
                selectedCategory === category ? 'text-white' : 'text-muted'
              }`}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Plans List */}
      <ScrollView
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <Text className="text-text font-bold text-lg mb-4">
          {selectedCategory || 'All'} Reading Plans
        </Text>

        {filteredPlans.map((plan) => {
          const isActive = currentPlan?.id === plan.id;

          return (
            <TouchableOpacity
              key={plan.id}
              onPress={() => !isActive && startPlan(plan)}
              className={`bg-white rounded-2xl p-5 mb-4 ${
                isActive ? 'border-2 border-primary' : ''
              }`}
              activeOpacity={isActive ? 1 : 0.8}
            >
              <View className="flex-row items-start">
                <View
                  className={`rounded-xl p-3 mr-4 ${
                    isActive ? 'bg-primary' : 'bg-primary/10'
                  }`}
                >
                  <Ionicons
                    name={plan.icon}
                    size={24}
                    color={isActive ? '#FFFFFF' : '#1E3A5F'}
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-text font-bold text-lg flex-1">
                      {plan.name}
                    </Text>
                    {isActive && (
                      <View className="bg-green-100 px-2 py-1 rounded-full">
                        <Text className="text-green-700 text-xs font-medium">
                          Active
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-muted mt-1">{plan.description}</Text>
                  <View className="flex-row items-center mt-3">
                    <Ionicons name="calendar-outline" size={16} color="#9CA3AF" />
                    <Text className="text-muted text-sm ml-1">
                      {plan.durationDays} days
                    </Text>
                    <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                    <Text className="text-muted text-sm">{plan.category}</Text>
                  </View>
                </View>
              </View>

              {!isActive && (
                <TouchableOpacity
                  onPress={() => startPlan(plan)}
                  className="bg-primary/10 rounded-xl py-3 mt-4 items-center"
                  activeOpacity={0.8}
                >
                  <Text className="text-primary font-semibold">Start Plan</Text>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
