import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Invalid email or password');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <View className="flex-1 justify-center px-8">
        {/* Logo/Brand */}
        <View className="items-center mb-12">
          <Text className="text-5xl font-bold text-primary mb-2">דָּבָר</Text>
          <Text className="text-xl text-primary tracking-widest">DAVAR</Text>
          <Text className="text-muted mt-2 text-center">
            Daily Scripture Reading
          </Text>
        </View>

        {/* Form */}
        <View className="space-y-4">
          {/* Email Input */}
          <View>
            <Text className="text-text font-medium mb-2 ml-1">Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              className="bg-white border border-border rounded-xl px-4 py-4 text-text text-base"
            />
          </View>

          {/* Password Input */}
          <View className="mt-4">
            <Text className="text-text font-medium mb-2 ml-1">Password</Text>
            <View className="relative">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!showPassword}
                className="bg-white border border-border rounded-xl px-4 py-4 pr-12 text-text text-base"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-4"
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Forgot Password */}
          <Link href="/(auth)/forgot-password" asChild>
            <TouchableOpacity className="self-end mt-2">
              <Text className="text-primary font-medium">Forgot password?</Text>
            </TouchableOpacity>
          </Link>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="bg-primary rounded-xl py-4 mt-6 items-center"
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white font-semibold text-lg">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-muted">Don't have an account? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-semibold">Create one</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Skip Auth (for testing) */}
        <TouchableOpacity
          onPress={() => {
            useAuthStore.getState().setUser({
              id: 'guest',
              name: 'Guest',
              email: 'guest@davar.app',
            });
            router.replace('/(tabs)');
          }}
          className="mt-8 items-center"
        >
          <Text className="text-muted underline">Continue as Guest</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
