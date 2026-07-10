import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../src/stores';
import { useTheme } from '../src/lib/theme';
import '../global.css';

function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and trying to access auth pages
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading]);
}

export default function RootLayout() {
  const { isLoading, initialize } = useAuthStore();
  const { theme, isDark } = useTheme();

  useEffect(() => {
    initialize();
  }, []);

  useProtectedRoute();

  if (isLoading) {
    return (
      <View
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background }}
      >
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="read/[passage]"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: '#1E3A5F' },
            headerTintColor: '#FFFFFF',
            headerTitle: 'Scripture',
          }}
        />
      </Stack>
    </>
  );
}
