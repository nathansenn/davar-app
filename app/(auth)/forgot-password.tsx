import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Since this is offline-first, we just show a message
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <View className="flex-1 bg-background justify-center px-8">
        <View className="items-center">
          <View className="bg-green-100 rounded-full p-6 mb-6">
            <Ionicons name="checkmark-circle" size={64} color="#22C55E" />
          </View>
          <Text className="text-2xl font-bold text-text mb-4 text-center">
            Check Your Email
          </Text>
          <Text className="text-muted text-center mb-8 leading-6">
            If an account exists with {email}, you'll receive password reset
            instructions shortly.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-primary rounded-xl py-4 px-12"
          >
            <Text className="text-white font-semibold text-lg">
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <View className="flex-1 justify-center px-8">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-16 left-6 p-2"
        >
          <Ionicons name="arrow-back" size={24} color="#1E3A5F" />
        </TouchableOpacity>

        {/* Header */}
        <View className="items-center mb-10">
          <View className="bg-primary/10 rounded-full p-6 mb-6">
            <Ionicons name="lock-closed" size={48} color="#1E3A5F" />
          </View>
          <Text className="text-2xl font-bold text-text mb-2">
            Forgot Password?
          </Text>
          <Text className="text-muted text-center leading-6">
            No worries! Enter your email and we'll send you reset instructions.
          </Text>
        </View>

        {/* Form */}
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

          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-primary rounded-xl py-4 mt-6 items-center"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-lg">
              Send Reset Link
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back to Login */}
        <View className="flex-row justify-center mt-8">
          <Text className="text-muted">Remember your password? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-primary font-semibold">Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
