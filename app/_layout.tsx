import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { DatabaseProvider, useDatabase } from '@/context/DatabaseContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';

function RootLayoutNav() {
  const { isReady, userSettings } = useDatabase();
  const { theme, themeMode } = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const [hasNavigated, setHasNavigated] = useState(false);

  // Navigate to the correct screen after database loads
  useEffect(() => {
    if (!isReady || hasNavigated) return;

    const onboardingCompleted = userSettings?.onboardingCompleted || false;
    const inAuthGroup = segments[0] === 'onboarding';

    // Navigate to tabs if onboarding is completed, or to onboarding if not
    if (onboardingCompleted && inAuthGroup) {
      router.replace('/(tabs)');
      setHasNavigated(true);
    } else if (!onboardingCompleted && !inAuthGroup) {
      router.replace('/onboarding');
      setHasNavigated(true);
    }
  }, [isReady, userSettings, segments, hasNavigated, router]);

  if (!isReady) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="entry/new"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="entry/[id]"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="albums/index"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="albums/[id]"
          options={{
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ThemeProvider>
      <DatabaseProvider>
        <RootLayoutNav />
      </DatabaseProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
