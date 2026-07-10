import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../src/lib/theme';
import { authService } from '../../src/services/authClient';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleReset = () => {
    Alert.alert(
      'Reset Account',
      'Your Davar account is stored only on this device, so there is no email reset. ' +
        'Resetting clears your saved sign-in and lets you create a new account. ' +
        'Your reading progress and highlights are kept.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset & Re-register',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await authService.resetAccount();
              router.replace('/(auth)/register');
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={{ position: 'absolute', top: 64, left: 24, padding: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>

        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{ backgroundColor: theme.primary + '1A', borderRadius: 999, padding: 24, marginBottom: 24 }}>
            <Ionicons name="lock-closed" size={48} color={theme.primary} />
          </View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text, marginBottom: 8 }}>
            Forgot Password?
          </Text>
          <Text style={{ color: theme.textMuted, textAlign: 'center', lineHeight: 22 }}>
            Davar keeps your account on this device only. There's no email reset — you can reset your
            account and re-register. Your reading progress stays intact.
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleReset}
          disabled={busy}
          accessibilityRole="button"
          accessibilityLabel="Reset account and re-register"
          style={{
            backgroundColor: theme.error,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: busy ? 0.7 : 1,
          }}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Reset Account</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}>
          <Text style={{ color: theme.textMuted }}>Remember your password? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity accessibilityRole="button">
              <Text style={{ color: theme.primary, fontWeight: '600' }}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
