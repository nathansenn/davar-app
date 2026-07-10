import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores';
import { useTheme } from '../../src/lib/theme';
import { isValidEmail, passwordProblem } from '../../src/services/authService';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleRegister = async () => {
    setError(null);
    if (!name.trim()) return setError('Please enter your name');
    if (!isValidEmail(email)) return setError('Please enter a valid email address');
    const pwProblem = passwordProblem(password);
    if (pwProblem) return setError(pwProblem);
    if (password !== confirmPassword) return setError('Passwords do not match');

    try {
      await register(name, email, password);
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e?.message || 'Unable to create account');
    }
  };

  const inputStyle = {
    backgroundColor: theme.inputBackground,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.text,
    fontSize: 16,
  } as const;

  const labelStyle = { color: theme.text, fontWeight: '500' as const, marginBottom: 8, marginLeft: 4 };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.background }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32, paddingVertical: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <Text style={{ fontSize: 36, fontWeight: 'bold', color: theme.primary, marginBottom: 8 }}>דָּבָר</Text>
          <Text style={{ fontSize: 18, color: theme.primary, letterSpacing: 4 }}>DAVAR</Text>
          <Text style={{ color: theme.textMuted, marginTop: 16, fontSize: 18 }}>Create Your Account</Text>
        </View>

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

        <View>
          <Text style={labelStyle}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor={theme.placeholder}
            autoCapitalize="words"
            accessibilityLabel="Name"
            style={inputStyle}
          />
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={labelStyle}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor={theme.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Email"
            style={inputStyle}
          />
        </View>

        <View style={{ marginTop: 16 }}>
          <Text style={labelStyle}>Password</Text>
          <View style={{ position: 'relative', justifyContent: 'center' }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password (min 8 characters)"
              placeholderTextColor={theme.placeholder}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              accessibilityLabel="Password"
              style={{ ...inputStyle, paddingRight: 48 }}
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

        <View style={{ marginTop: 16 }}>
          <Text style={labelStyle}>Confirm Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            placeholderTextColor={theme.placeholder}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            accessibilityLabel="Confirm password"
            style={inputStyle}
          />
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={isLoading}
          accessibilityRole="button"
          accessibilityLabel="Create account"
          style={{
            backgroundColor: theme.primary,
            borderRadius: 12,
            paddingVertical: 16,
            marginTop: 32,
            alignItems: 'center',
            opacity: isLoading ? 0.7 : 1,
          }}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}>
          <Text style={{ color: theme.textMuted }}>Already have an account? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity accessibilityRole="button">
              <Text style={{ color: theme.primary, fontWeight: '600' }}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
