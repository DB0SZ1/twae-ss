/**
 * twae — Splash Screen (Screen 1.1)
 * Light-themed splash with animated logo, blue accent glow
 * Auto-redirect: reads token → Login or Onboarding
 * Loads remote config, handles deep-link, offline detection
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { Colors, Fonts, FontSizes } from '../constants/theme';
import Svg, { Path } from 'react-native-svg';

export default function SplashScreenPage() {
  const router = useRouter();
  const [offline, setOffline] = useState(false);

  // Animations
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const bannerSlide = useRef(new Animated.Value(-60)).current;
  const bannerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Blue pulse ring
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 2.2,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.4,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // Simple: just redirect after 2.2s, no API calls during splash
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Offline banner */}
      {offline && (
        <Animated.View
          style={[
            styles.offlineBanner,
            {
              transform: [{ translateY: bannerSlide }],
              opacity: bannerOpacity,
            },
          ]}
        >
          <Text style={styles.offlineText}>⚡ No connection — retrying…</Text>
        </Animated.View>
      )}

      {/* Blue pulse ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            transform: [{ scale: ringScale }],
            opacity: ringOpacity,
          },
        ]}
      />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
            marginBottom: 24,
          },
        ]}
      >
        <Image source={require('../assets/Twae-Logo.png')} style={{ width: 320, height: 110 }} resizeMode="contain" />
      </Animated.View>

      {/* Loading spinner */}
      <Animated.View style={[styles.loaderWrap, { opacity: textOpacity }]}>
        <ActivityIndicator size="small" color={Colors.g3} />
      </Animated.View>

      {/* Version */}
      <Animated.Text style={[styles.version, { opacity: textOpacity }]}>
        v1.0.0
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bg,
  },
  offlineBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 24,
    right: 24,
    backgroundColor: 'rgba(239,68,68,0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.15)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    zIndex: 10,
  },
  offlineText: {
    fontFamily: 'Inter_500',
    fontSize: 13,
    color: Colors.red,
  },
  pulseRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(0,74,153,0.12)',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGem: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    // Blue glow shadow
    shadowColor: '#004a99',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  brandName: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 28,
    color: Colors.text,
    letterSpacing: 1,
    marginBottom: 24,
  },
  loaderWrap: {
    marginBottom: 40,
  },
  version: {
    position: 'absolute',
    bottom: 60,
    fontSize: FontSizes.xs,
    fontFamily: 'Inter_400',
    color: Colors.dim,
  },
});
