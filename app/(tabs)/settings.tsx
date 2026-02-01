import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useSettingsStore, useReadingStore } from '../../src/stores';
import { syncService } from '../../src/services/syncService';

type SettingSection = {
  title: string;
  items: SettingItem[];
};

type SettingItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  isSwitch?: boolean;
  switchValue?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  destructive?: boolean;
};

export default function SettingsScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const { 
    theme, setTheme,
    fontSize, setFontSize,
    notificationsEnabled, setNotificationsEnabled,
    defaultTranslation, setDefaultTranslation,
    showVerseNumbers, setShowVerseNumbers,
    showOriginalLanguage, setShowOriginalLanguage,
    originalLanguagePosition, setOriginalLanguagePosition,
    showTransliteration, setShowTransliteration,
  } = useSettingsStore();
  const { streak, longestStreak, totalDaysRead, reset: resetReading } = useReadingStore();
  
  // Sync status
  const [syncStatus, setSyncStatus] = useState(syncService.getStatus());
  
  useEffect(() => {
    // Initialize sync service
    syncService.init();
    
    // Subscribe to sync status changes
    const unsubscribe = syncService.subscribe(setSyncStatus);
    return unsubscribe;
  }, []);
  
  const handleSync = useCallback(async () => {
    if (!token) {
      Alert.alert('Sign In Required', 'Please sign in to sync your data across devices.');
      return;
    }
    
    if (!syncStatus.isOnline) {
      Alert.alert('No Connection', 'You are currently offline. Your changes will sync when you are back online.');
      return;
    }
    
    try {
      await syncService.forceSync(token);
      Alert.alert('Sync Complete', 'Your data has been synced successfully.');
    } catch (error) {
      Alert.alert('Sync Failed', 'Failed to sync your data. Please try again later.');
    }
  }, [token, syncStatus.isOnline]);
  
  const formatLastSync = (timestamp: number | null): string => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset All Progress',
      'This will reset your reading streak, plan progress, and all reading history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            resetReading();
            Alert.alert('Progress Reset', 'All reading progress has been reset.');
          },
        },
      ]
    );
  };

  const fontSizeLabel = {
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
    xlarge: 'Extra Large',
  }[fontSize];

  const themeLabel = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  }[theme];

  const sections: SettingSection[] = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person-circle',
          label: user?.name || 'Guest',
          value: user?.email || 'Not signed in',
        },
      ],
    },
    {
      title: 'Reading',
      items: [
        {
          icon: 'text',
          label: 'Font Size',
          value: fontSizeLabel,
          onPress: () => {
            const sizes: Array<'small' | 'medium' | 'large' | 'xlarge'> = ['small', 'medium', 'large', 'xlarge'];
            const currentIndex = sizes.indexOf(fontSize);
            const nextIndex = (currentIndex + 1) % sizes.length;
            setFontSize(sizes[nextIndex]);
          },
        },
        {
          icon: 'book-outline',
          label: 'Default Translation',
          value: defaultTranslation,
          onPress: () => {
            Alert.alert('Default Translation', 'Select your preferred translation', [
              { text: 'KJV', onPress: () => setDefaultTranslation('KJV') },
              { text: 'ASV', onPress: () => setDefaultTranslation('ASV') },
              { text: 'BBE', onPress: () => setDefaultTranslation('BBE') },
              { text: 'BSB', onPress: () => setDefaultTranslation('BSB') },
              { text: 'Cancel', style: 'cancel' },
            ]);
          },
        },
        {
          icon: 'list',
          label: 'Show Verse Numbers',
          isSwitch: true,
          switchValue: showVerseNumbers,
          onToggle: setShowVerseNumbers,
        },
      ],
    },
    {
      title: 'Original Languages',
      items: [
        {
          icon: 'language',
          label: 'Show Hebrew/Greek',
          isSwitch: true,
          switchValue: showOriginalLanguage,
          onToggle: setShowOriginalLanguage,
        },
        {
          icon: 'swap-vertical',
          label: 'Original Language Position',
          value: originalLanguagePosition === 'above' ? 'Above English' : 'Below English',
          onPress: () => {
            setOriginalLanguagePosition(
              originalLanguagePosition === 'above' ? 'below' : 'above'
            );
          },
        },
        {
          icon: 'text-outline',
          label: 'Show Transliteration',
          isSwitch: true,
          switchValue: showTransliteration,
          onToggle: setShowTransliteration,
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          icon: 'moon',
          label: 'Theme',
          value: themeLabel,
          onPress: () => {
            Alert.alert('Theme', 'Choose your theme', [
              { text: 'Light', onPress: () => setTheme('light') },
              { text: 'Dark', onPress: () => setTheme('dark') },
              { text: 'System', onPress: () => setTheme('system') },
              { text: 'Cancel', style: 'cancel' },
            ]);
          },
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: 'notifications',
          label: 'Daily Reminders',
          isSwitch: true,
          switchValue: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
      ],
    },
    {
      title: 'Sync',
      items: [
        {
          icon: syncStatus.isOnline ? 'cloud-done' : 'cloud-offline',
          label: syncStatus.isSyncing ? 'Syncing...' : 'Sync Now',
          value: syncStatus.pendingCount > 0 
            ? `${syncStatus.pendingCount} pending changes` 
            : `Last synced: ${formatLastSync(syncStatus.lastSyncAt)}`,
          onPress: handleSync,
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          icon: 'trash',
          label: 'Reset All Progress',
          onPress: handleResetProgress,
          destructive: true,
        },
        {
          icon: 'log-out',
          label: 'Sign Out',
          onPress: handleLogout,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Stats Card */}
      <View className="mx-6 mt-4 mb-6 bg-primary rounded-2xl p-6">
        <Text className="text-white/80 text-sm uppercase tracking-wider mb-3">
          Your Journey
        </Text>
        <View className="flex-row justify-between">
          <View className="items-center">
            <Text className="text-white text-3xl font-bold">{streak}</Text>
            <Text className="text-white/70 text-sm">Current Streak</Text>
          </View>
          <View className="items-center">
            <Text className="text-white text-3xl font-bold">{longestStreak}</Text>
            <Text className="text-white/70 text-sm">Longest Streak</Text>
          </View>
          <View className="items-center">
            <Text className="text-white text-3xl font-bold">{totalDaysRead}</Text>
            <Text className="text-white/70 text-sm">Total Days</Text>
          </View>
        </View>
      </View>

      {/* Settings Sections */}
      {sections.map((section, sectionIndex) => (
        <View key={sectionIndex} className="mb-6">
          <Text className="px-6 mb-2 text-muted text-sm uppercase tracking-wider">
            {section.title}
          </Text>
          <View className="mx-6 bg-white rounded-2xl overflow-hidden">
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={itemIndex}
                onPress={item.onPress}
                disabled={item.isSwitch}
                className={`flex-row items-center px-4 py-4 ${
                  itemIndex < section.items.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                activeOpacity={item.onPress ? 0.7 : 1}
              >
                <View
                  className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
                    item.destructive ? 'bg-red-100' : 'bg-primary/10'
                  }`}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.destructive ? '#EF4444' : '#1E3A5F'}
                  />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-base font-medium ${
                      item.destructive ? 'text-red-500' : 'text-text'
                    }`}
                  >
                    {item.label}
                  </Text>
                  {item.value && !item.isSwitch && (
                    <Text className="text-muted text-sm">{item.value}</Text>
                  )}
                </View>
                {item.isSwitch ? (
                  <Switch
                    value={item.switchValue}
                    onValueChange={item.onToggle}
                    trackColor={{ false: '#E5E7EB', true: '#1E3A5F' }}
                    thumbColor="#FFFFFF"
                  />
                ) : item.onPress && !item.destructive ? (
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* App Info */}
      <View className="items-center py-8">
        <Text className="text-muted text-sm">Davar v1.0.0</Text>
        <Text className="text-muted/50 text-xs mt-1">Made with ❤️ for Scripture</Text>
      </View>
    </ScrollView>
  );
}
