/**
 * twae — Splash Screen
 * Brand moment with animated logo, auto-redirect to login
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Fonts, FontSizes } from '../constants/theme';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function SplashScreenPage() {
  const router = useRouter();
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

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

    // Pulse ring
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1.8,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 0,
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

    // Redirect after 2s
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.bg, Colors.surface]}
        style={StyleSheet.absoluteFill}
      />

      {/* Pulse ring */}
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
          },
        ]}
      >
        <LinearGradient
          colors={[Colors.g2, Colors.g3]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoGem}
        >
          <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
            <Path d="M14 3L22 8.5V19.5L14 25L6 19.5V8.5L14 3Z" fill="white" opacity={0.9} />
          </Svg>
        </LinearGradient>
      </Animated.View>

      {/* Brand name */}
      <Animated.Text style={[styles.brandName, { opacity: textOpacity }]}>
        twae
      </Animated.Text>

      {/* Loading ring */}
      <View style={styles.loaderWrap}>
        <Animated.View style={[styles.loaderRing, { opacity: textOpacity }]} />
      </View>

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
  pulseRing: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(50,100,209,.3)',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGem: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.g2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  brandName: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 26,
    color: Colors.text,
    letterSpacing: 0.5,
    marginBottom: 24,
  },
  loaderWrap: {
    marginBottom: 40,
  },
  loaderRing: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: Colors.blackAlpha05,
    borderTopColor: Colors.gsheen,
  },
  version: {
    position: 'absolute',
    bottom: 60,
    fontSize: FontSizes.xs,
    fontFamily: 'Inter_400',
    color: Colors.dim,
  },
});
