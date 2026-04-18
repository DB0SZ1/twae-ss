/**
 * twae — Confirm PIN Screen (Screen 1.4b)
 * Re-enter PIN, compare hashes, shake on mismatch
 * On match: store PIN securely, prompt biometric enrollment
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import PINPad from '../../components/atoms/PINPad';
import AppButton from '../../components/atoms/AppButton';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { createPIN, enrollBiometric } from '../../controllers/authController';

export default function ConfirmPINScreen() {
  const router = useRouter();
  const { pin, userId, countryCode } = useLocalSearchParams<{
    pin: string;
    userId?: string;
    countryCode?: string;
  }>();

  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [matched, setMatched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);

  // Shake animation
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 14, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -14, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleDigit = async (d: string) => {
    if (digits.length >= 6 || matched) return;
    const next = [...digits, d];
    setDigits(next);
    setError(false);

    if (next.length === 6) {
      if (next.join('') === pin) {
        // Match! Store PIN and show biometric prompt
        setSaving(true);
        try {
          await createPIN({ userId: userId || '', pin: next.join('') });
          setMatched(true);
          // Success animation
          Animated.spring(successScale, {
            toValue: 1,
            tension: 60,
            friction: 6,
            useNativeDriver: true,
          }).start();
          // Show biometric prompt after a beat
          setTimeout(() => setShowBiometric(true), 800);
        } catch {
          Alert.alert('Error', 'Failed to save PIN. Please try again.');
          setDigits([]);
        } finally {
          setSaving(false);
        }
      } else {
        setError(true);
        triggerShake();
        setTimeout(() => {
          setDigits([]);
          setError(false);
        }, 800);
      }
    }
  };

  const handleBiometricEnroll = async () => {
    try {
      await enrollBiometric(userId || '', Platform.OS === 'ios' ? 'face' : 'fingerprint');
    } catch {
      // Non-critical, continue
    }
    navigateNext();
  };

  const handleSkipBiometric = () => {
    navigateNext();
  };

  const navigateNext = () => {
    router.push({
      pathname: '/(onboarding)/kyc-identity',
      params: { userId, countryCode },
    });
  };

  if (showBiometric) {
    return (
      <View style={styles.container}>
        <AppHeader title="Biometric Setup" />
        <Animated.View style={[styles.biometricContent, { opacity: fadeIn }]}>
          <View style={styles.biometricIcon}>
            <Ionicons
              name={Platform.OS === 'ios' ? 'scan-outline' : 'finger-print'}
              size={64}
              color={Colors.g3}
            />
          </View>
          <Text style={styles.biometricTitle}>
            Enable {Platform.OS === 'ios' ? 'Face ID' : 'Fingerprint'}?
          </Text>
          <Text style={styles.biometricSub}>
            Use biometrics for faster, more secure logins and transaction confirmations.
          </Text>

          <View style={styles.biometricActions}>
            <AppButton
              label={`Enable ${Platform.OS === 'ios' ? 'Face ID' : 'Fingerprint'}`}
              onPress={handleBiometricEnroll}
              icon={<Ionicons name="shield-checkmark" size={18} color="#fff" />}
            />
            <AppButton
              label="Skip for Now"
              onPress={handleSkipBiometric}
              variant="ghost"
              style={{ marginTop: 12 }}
            />
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Confirm PIN" />
      <Animated.View style={[styles.content, { opacity: fadeIn }]}>
        {matched ? (
          <Animated.View style={[styles.successWrap, { transform: [{ scale: successScale }] }]}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
            <Text style={styles.successText}>PIN created successfully!</Text>
          </Animated.View>
        ) : (
          <>
            <Text style={styles.title}>Re-enter your PIN</Text>
            <Text style={styles.sub}>Confirm the 6-digit PIN you just created</Text>
            {error && <Text style={styles.error}>PINs don't match. Try again.</Text>}
            {saving && <Text style={styles.saving}>Saving…</Text>}
            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              <PINPad
                length={6}
                digits={digits}
                onDigitPress={handleDigit}
                onDelete={() => setDigits(d => d.slice(0, -1))}
                error={error}
              />
            </Animated.View>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32, alignItems: 'center' },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginBottom: 24, textAlign: 'center' },
  error: { fontFamily: 'Inter_500', fontSize: 13, color: Colors.red, marginBottom: 16 },
  saving: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.gsheen, marginBottom: 16 },
  successWrap: { alignItems: 'center', paddingTop: 60 },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.greenBright,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: Colors.greenBright,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  successText: { fontFamily: 'BricolageGrotesque_600', fontSize: 20, color: Colors.text },
  // Biometric screen
  biometricContent: { flex: 1, paddingHorizontal: 24, paddingTop: 40, alignItems: 'center' },
  biometricIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(50,100,209,.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'rgba(50,100,209,.1)',
  },
  biometricTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 12, textAlign: 'center' },
  biometricSub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, textAlign: 'center', lineHeight: 22, marginBottom: 48, maxWidth: 300 },
  biometricActions: { width: '100%' },
});
