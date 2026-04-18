/**
 * twae — Create PIN Screen (Screen 1.4a)
 * 6-dot PIN entry with strength validation (blocks sequential/repeated)
 * Navigates to ConfirmPIN on completion
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import PINPad from '../../components/atoms/PINPad';
import { Colors } from '../../constants/theme';

// PIN strength validation
function isPINWeak(digits: string[]): string | null {
  const pin = digits.join('');

  // Check sequential (123456, 654321)
  const sequential = '0123456789';
  const reverseSeq = '9876543210';
  if (sequential.includes(pin) || reverseSeq.includes(pin)) {
    return 'PIN is too easy (sequential numbers)';
  }

  // Check all same digit (111111, 000000)
  if (new Set(pin.split('')).size === 1) {
    return 'PIN cannot be all the same digit';
  }

  // Check repeated pairs (121212, 787878)
  if (pin.length === 6) {
    const pair = pin.slice(0, 2);
    if (pair.repeat(3) === pin) {
      return 'PIN is too predictable';
    }
  }

  return null;
}

export default function CreatePINScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string; countryCode?: string }>();
  const [digits, setDigits] = useState<string[]>([]);
  const [pinError, setPinError] = useState('');

  // Fade animation
  const fadeIn = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const addDigit = (d: string) => {
    if (digits.length >= 6) return;
    const next = [...digits, d];
    setDigits(next);
    setPinError('');

    if (next.length === 6) {
      // Validate PIN strength
      const weakness = isPINWeak(next);
      if (weakness) {
        setPinError(weakness);
        setTimeout(() => {
          setDigits([]);
          setPinError('');
        }, 1500);
        return;
      }

      // Navigate to confirm
      setTimeout(() => {
        router.push({
          pathname: '/(onboarding)/confirm-pin',
          params: {
            pin: next.join(''),
            userId: params.userId,
            countryCode: params.countryCode,
          },
        });
      }, 200);
    }
  };

  const deleteDigit = () => {
    setDigits(d => d.slice(0, -1));
    setPinError('');
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Create PIN" />
      <Animated.View style={[styles.content, { opacity: fadeIn }]}>
        <Text style={styles.title}>Set your PIN</Text>
        <Text style={styles.sub}>
          Create a 6-digit PIN for transactions and app security
        </Text>

        {/* PIN strength feedback */}
        {pinError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {pinError}</Text>
          </View>
        ) : (
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>
              Avoid sequential (123456) or repeated (111111) PINs
            </Text>
          </View>
        )}

        <PINPad
          length={6}
          digits={digits}
          onDigitPress={addDigit}
          onDelete={deleteDigit}
          error={!!pinError}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32, alignItems: 'center' },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginBottom: 24, textAlign: 'center', lineHeight: 20 },
  hintBox: {
    backgroundColor: 'rgba(50,100,209,.04)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(50,100,209,.08)',
  },
  hintText: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted, textAlign: 'center' },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,.06)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,.12)',
  },
  errorText: { fontFamily: 'Inter_500', fontSize: 12, color: Colors.red, textAlign: 'center' },
});
