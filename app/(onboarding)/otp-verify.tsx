/**
 * twae — OTP Verification Screen
 */
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import OTPInput from '../../components/atoms/OTPInput';
import { Colors, Fonts, FontSizes, Spacing } from '../../constants/theme';

export default function OTPVerifyScreen() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleComplete = (otp: string) => {
    if (otp === '123456') {
      router.push('/(onboarding)/create-pin');
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Verify Phone" />
      <View style={styles.content}>
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.sub}>We sent a 6-digit code to +234 803 456 7890</Text>
        <View style={styles.otpWrap}>
          <OTPInput onComplete={handleComplete} error={error} />
        </View>
        {error && <Text style={styles.errorText}>Invalid code. Try again.</Text>}
        <TouchableOpacity
          disabled={countdown > 0}
          onPress={() => setCountdown(60)}
          style={styles.resendBtn}
        >
          <Text style={[styles.resendText, countdown > 0 && { color: Colors.dim }]}>
            {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginBottom: 40, lineHeight: 20 },
  otpWrap: { marginBottom: 24 },
  errorText: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.red, textAlign: 'center', marginBottom: 16 },
  resendBtn: { alignItems: 'center', paddingVertical: 12 },
  resendText: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.gsheen },
});
