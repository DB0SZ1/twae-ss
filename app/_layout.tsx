/**
 * twae — Root Layout
 * Sets up fonts, navigation, and global providers.
 */
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View, StyleSheet, StatusBar } from 'react-native';
import { useFonts } from 'expo-font';
import {
  BricolageGrotesque_300Light,
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '../constants/theme';
import OfflineBanner from '../components/layouts/OfflineBanner';
import TwaeLoader from '../components/atoms/TwaeLoader';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { useThemeColors } from '../hooks/useThemeColors';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const C = useThemeColors();
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <OfflineBanner />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: C.bg },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(savings)" />
        <Stack.Screen name="(invest)" />
        <Stack.Screen name="(wallet)" />
        <Stack.Screen name="(settings)" />
        <Stack.Screen name="notifications" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_300: BricolageGrotesque_300Light,
    BricolageGrotesque_400: BricolageGrotesque_400Regular,
    BricolageGrotesque_500: BricolageGrotesque_500Medium,
    BricolageGrotesque_600: BricolageGrotesque_600SemiBold,
    Inter_300: Inter_300Light,
    Inter_400: Inter_400Regular,
    Inter_500: Inter_500Medium,
    Inter_600: Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <TwaeLoader size={56} />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AppContent />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
});
