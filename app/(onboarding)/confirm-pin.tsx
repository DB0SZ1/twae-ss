/**
 * twae — Confirm PIN Screen
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import PINPad from '../../components/atoms/PINPad';
import { Colors } from '../../constants/theme';

export default function ConfirmPINScreen() {
  const router = useRouter();
  const { pin } = useLocalSearchParams<{ pin: string }>();
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState(false);

  const handleDigit = (d: string) => {
    if (digits.length >= 6) return;
    const next = [...digits, d];
    setDigits(next);
    setError(false);
    if (next.length === 6) {
      if (next.join('') === pin) {
        router.push('/(onboarding)/kyc-identity');
      } else {
        setError(true);
        setTimeout(() => { setDigits([]); setError(false); }, 800);
      }
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Confirm PIN" />
      <View style={styles.content}>
        <Text style={styles.title}>Re-enter your PIN</Text>
        <Text style={styles.sub}>Confirm the 6-digit PIN you just created</Text>
        {error && <Text style={styles.error}>PINs don't match. Try again.</Text>}
        <PINPad length={6} digits={digits} onDigitPress={handleDigit} onDelete={() => setDigits(d => d.slice(0, -1))} error={error} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32, alignItems: 'center' },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginBottom: 24, textAlign: 'center' },
  error: { fontFamily: 'Inter_500', fontSize: 13, color: Colors.red, marginBottom: 16 },
});
