import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores';
import { useTheme } from '../../src/lib/theme';
import { isValidEmail } from '../../src/services/authService';

export default function LoginScreen() {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    setError(null);
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.message || 'Unable to sign in');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
        {/* Logo/Brand */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Text style={{ fontSize: 48, fontWeight: 'bold', color: theme.primary, marginBottom: 8 }}>
            דָּבָר
          </Text>
          <Text style={{ fontSize: 20, color: theme.primary, letterSpacing: 4 }}>DAVAR</Text>
          <Text style={{ color: theme.textMuted, marginTop: 8, textAlign: 'center' }}>
            Daily Scripture Reading
          </Text>
        </View>

        {/* Error banner */}
        {error && (
          <View
            style={{
              backgroundColor: theme.error + '1A',
              borderRadius: 12,
              padding: 12,
              marginBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            accessibilityLiveRegion="polite"
          >
            <Ionicons name="alert-circle" size={18} color={theme.error} />
            <Text style={{ color: theme.error, marginLeft: 8, flex: 1 }}>{error}</Text>
          </View>
        )}

        {/* Email */}
        <View>
          <Text style={{ color: theme.text, fontWeight: '500', marginBottom: 8, marginLeft: 4 }}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={theme.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Email"
            style={{
              backgroundColor: theme.inputBackground,
              borderWidth: 1,
              borderColor: theme.inputBorder,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              color: theme.text,
              fontSize: 16,
            }}
          />
        </View>

        {/* Password */}
        <View style={{ marginTop: 16 }}>
          <Text style={{ color: theme.text, fontWeight: '500', marginBottom: 8, marginLeft: 4 }}>Password</Text>
          <View style={{ position: 'relative', justifyContent: 'center' }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={theme.placeholder}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              accessibilityLabel="Password"
              style={{
                backgroundColor: theme.inputBackground,
                borderWidth: 1,
                borderColor: theme.inputBorder,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                paddingRight: 48,
                color: theme.text,
                fontSize: 16,
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((s) => !s)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={{ position: 'absolute', right: 16 }}
            >
              <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password */}
        <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity style={{ alignSelf: 'flex-end', marginTop: 12 }} accessibilityRole="button">
            <Text style={{ color: theme.primary, fontWeight: '500' }}>Forgot password?</Text>
          </TouchableOpacity>
        </Link>

        {/* Sign In */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
          style={{
            backgroundColor: theme.primary,
            borderRadius: 12,
            paddingVertical: 16,
            marginTop: 24,
            alignItems: 'center',
            opacity: isLoading ? 0.7 : 1,
          }}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Register Link */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}>
          <Text style={{ color: theme.textMuted }}>Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity accessibilityRole="button">
              <Text style={{ color: theme.primary, fontWeight: '600' }}>Create one</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
