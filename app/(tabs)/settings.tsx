import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useSettingsStore, useReadingStore } from '../../src/stores';
import { syncService } from '../../src/services/syncService';
import { scheduleDailyReminder, cancelDailyReminder } from '../../src/services/notificationService';
import { formatTimeLabel, nextPreset } from '../../src/utils/reminderTime';
import { useTheme } from '../../src/lib/theme';
import { OptionPicker } from '../../src/components/common/OptionPicker';
import { TRANSLATIONS, type Translation } from '../../src/types/ui';

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
  accessibilityHint?: string;
};

const TRANSLATION_OPTIONS: Translation[] = ['KJV', 'ASV', 'BBE', 'BSB'];
const FONT_SIZE_OPTIONS: Array<'small' | 'medium' | 'large' | 'xlarge'> = [
  'small',
  'medium',
  'large',
  'xlarge',
];
const THEME_OPTIONS: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const { user, token, logout } = useAuthStore();
  const {
    theme: themeMode, setTheme,
    fontSize, setFontSize,
    notificationsEnabled, setNotificationsEnabled,
    dailyReminderTime, setDailyReminderTime,
    defaultTranslation, setDefaultTranslation,
    showVerseNumbers, setShowVerseNumbers,
    showOriginalLanguage, setShowOriginalLanguage,
    originalLanguagePosition, setOriginalLanguagePosition,
    showTransliteration, setShowTransliteration,
  } = useSettingsStore();
  const { streak, longestStreak, totalDaysRead, reset: resetReading } = useReadingStore();

  const [syncStatus, setSyncStatus] = useState(syncService.getStatus());
  const [activePicker, setActivePicker] = useState<'font' | 'translation' | 'theme' | null>(null);

  useEffect(() => {
    syncService.init();
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
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
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

  const handleNotificationsToggle = useCallback(
    async (value: boolean) => {
      if (value) {
        const ok = await scheduleDailyReminder(dailyReminderTime);
        if (ok) {
          setNotificationsEnabled(true);
        } else {
          setNotificationsEnabled(false);
          Alert.alert(
            'Notifications Disabled',
            'Please enable notifications for Davar in your device settings to receive daily reminders.'
          );
        }
      } else {
        await cancelDailyReminder();
        setNotificationsEnabled(false);
      }
    },
    [dailyReminderTime, setNotificationsEnabled]
  );

  const handleChangeReminderTime = useCallback(() => {
    const next = nextPreset(dailyReminderTime);
    setDailyReminderTime(next);
    if (notificationsEnabled) scheduleDailyReminder(next);
  }, [dailyReminderTime, notificationsEnabled, setDailyReminderTime]);

  const fontSizeLabel = { small: 'Small', medium: 'Medium', large: 'Large', xlarge: 'Extra Large' }[
    fontSize
  ];
  const themeLabel = { light: 'Light', dark: 'Dark', system: 'System' }[themeMode];

  const fontPickerOptions = FONT_SIZE_OPTIONS.map((s) => ({
    value: s,
    label: { small: 'Small', medium: 'Medium', large: 'Large', xlarge: 'Extra Large' }[s],
  }));
  const translationPickerOptions = TRANSLATION_OPTIONS.map((t) => ({
    value: t,
    label: t,
    sublabel: TRANSLATIONS[t]?.fullName,
  }));
  const themePickerOptions = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'System', sublabel: 'Match device' },
  ];

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
          accessibilityHint: 'Choose a font size',
          onPress: () => setActivePicker('font'),
        },
        {
          icon: 'book-outline',
          label: 'Default Translation',
          value: defaultTranslation,
          accessibilityHint: 'Choose your default Bible translation',
          onPress: () => setActivePicker('translation'),
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
          onPress: () =>
            setOriginalLanguagePosition(originalLanguagePosition === 'above' ? 'below' : 'above'),
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
          icon: isDark ? 'moon' : 'sunny',
          label: 'Theme',
          value: themeLabel,
          accessibilityHint: 'Choose light, dark or system theme',
          onPress: () => setActivePicker('theme'),
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
          onToggle: handleNotificationsToggle,
        },
        ...(notificationsEnabled
          ? [
              {
                icon: 'time-outline' as keyof typeof Ionicons.glyphMap,
                label: 'Reminder Time',
                value: formatTimeLabel(dailyReminderTime),
                accessibilityHint: 'Cycles the daily reminder time',
                onPress: handleChangeReminderTime,
              },
            ]
          : []),
      ],
    },
    {
      title: 'Sync',
      items: [
        {
          icon: syncStatus.isOnline ? 'cloud-done' : 'cloud-offline',
          label: syncStatus.isSyncing ? 'Syncing...' : 'Sync Now',
          value:
            syncStatus.pendingCount > 0
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
    <>
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.background }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Stats Card */}
      <View
        style={{
          marginHorizontal: 24,
          marginTop: 16,
          marginBottom: 24,
          backgroundColor: theme.primary,
          borderRadius: 16,
          padding: 24,
        }}
      >
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, letterSpacing: 1, marginBottom: 12 }}>
          YOUR JOURNEY
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[
            { value: streak, label: 'Current Streak' },
            { value: longestStreak, label: 'Longest Streak' },
            { value: totalDaysRead, label: 'Total Days' },
          ].map((stat) => (
            <View key={stat.label} style={{ alignItems: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 30, fontWeight: 'bold' }}>{stat.value}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13 }}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Settings Sections */}
      {sections.map((section) => (
        <View key={section.title} style={{ marginBottom: 24 }}>
          <Text
            style={{
              paddingHorizontal: 24,
              marginBottom: 8,
              color: theme.textMuted,
              fontSize: 13,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {section.title}
          </Text>
          <View
            style={{
              marginHorizontal: 24,
              backgroundColor: theme.surface,
              borderRadius: 16,
              overflow: 'hidden',
            }}
          >
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.onPress}
                disabled={item.isSwitch || !item.onPress}
                accessibilityRole={item.onPress && !item.isSwitch ? 'button' : undefined}
                accessibilityLabel={item.value ? `${item.label}, ${item.value}` : item.label}
                accessibilityHint={item.accessibilityHint}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  borderBottomWidth: itemIndex < section.items.length - 1 ? 1 : 0,
                  borderBottomColor: theme.borderLight,
                }}
                activeOpacity={item.onPress ? 0.7 : 1}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    backgroundColor: item.destructive ? theme.error + '1A' : theme.primary + '1A',
                  }}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={item.destructive ? theme.error : theme.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '500',
                      color: item.destructive ? theme.error : theme.text,
                    }}
                  >
                    {item.label}
                  </Text>
                  {item.value && !item.isSwitch && (
                    <Text style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>
                      {item.value}
                    </Text>
                  )}
                </View>
                {item.isSwitch ? (
                  <Switch
                    value={item.switchValue}
                    onValueChange={item.onToggle}
                    trackColor={{ false: theme.border, true: theme.primary }}
                    thumbColor="#FFFFFF"
                  />
                ) : item.onPress && !item.destructive ? (
                  <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      {/* App Info */}
      <View style={{ alignItems: 'center', paddingVertical: 32 }}>
        <Text style={{ color: theme.textMuted, fontSize: 13 }}>Davar v1.0.0</Text>
        <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 4, opacity: 0.7 }}>
          Made with ❤️ for Scripture
        </Text>
      </View>
    </ScrollView>

    <OptionPicker
      visible={activePicker === 'font'}
      title="Font Size"
      options={fontPickerOptions}
      selected={fontSize}
      onSelect={(v) => setFontSize(v as typeof fontSize)}
      onClose={() => setActivePicker(null)}
    />
    <OptionPicker
      visible={activePicker === 'translation'}
      title="Default Translation"
      options={translationPickerOptions}
      selected={defaultTranslation}
      onSelect={(v) => setDefaultTranslation(v as Translation)}
      onClose={() => setActivePicker(null)}
    />
    <OptionPicker
      visible={activePicker === 'theme'}
      title="Theme"
      options={themePickerOptions}
      selected={themeMode}
      onSelect={(v) => setTheme(v as typeof themeMode)}
      onClose={() => setActivePicker(null)}
    />
    </>
  );
}
