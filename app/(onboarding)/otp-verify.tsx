/**
 * twae — OTP Verification Screen (Screen 1.3)
 * 6-cell OTP, auto-submit, shake on error, paste support, countdown timer
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import OTPInput from '../../components/atoms/OTPInput';
import { Colors } from '../../constants/theme';
import { verifyOTP, resendOTP } from '../../controllers/authController';

export default function OTPVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string; phone?: string; countryCode?: string }>();

  const [countdown, setCountdown] = useState(60);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Shake animation
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleComplete = async (otp: string) => {
    setLoading(true);
    setError(false);
    setErrorMessage('');

    try {
      const result = await verifyOTP({
        userId: params.userId || '',
        otp,
      });

      if (result.success) {
        router.push({
          pathname: '/(onboarding)/create-pin',
          params: { userId: params.userId, countryCode: params.countryCode },
        });
      } else {
        setError(true);
        setErrorMessage(result.message || 'Invalid code. Try again.');
        triggerShake();
        setTimeout(() => setError(false), 2000);
      }
    } catch {
      setError(true);
      setErrorMessage('Verification failed. Try again.');
      triggerShake();
      setTimeout(() => setError(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try {
      await resendOTP(params.userId || '');
      setCountdown(60);
      setError(false);
      setErrorMessage('');
    } catch {
      setErrorMessage('Failed to resend. Try again.');
    } finally {
      setResending(false);
    }
  };

  // Format countdown as MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Verify Phone" />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <Animated.View style={[styles.content, { opacity: fadeIn }]}>
        <Text style={styles.title}>Enter verification code</Text>
        <Text style={styles.sub}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phoneHighlight}>{params.phone || '+234 803 XXX XXXX'}</Text>
        </Text>

        {/* OTP Input with shake animation */}
        <Animated.View style={[styles.otpWrap, { transform: [{ translateX: shakeAnim }] }]}>
          <OTPInput onComplete={handleComplete} error={error} />
        </Animated.View>

        {/* Error message */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Loading indicator */}
        {loading && (
          <Text style={styles.verifyingText}>Verifying…</Text>
        )}

        {/* Resend */}
        <TouchableOpacity
          disabled={countdown > 0 || resending}
          onPress={handleResend}
          style={styles.resendBtn}
        >
          {countdown > 0 ? (
            <View style={styles.countdownRow}>
              <View style={styles.countdownCircle}>
                <Text style={styles.countdownNum}>{formatTime(countdown)}</Text>
              </View>
              <Text style={styles.resendTextDisabled}>Resend code</Text>
            </View>
          ) : (
            <Text style={styles.resendText}>
              {resending ? 'Sending…' : 'Resend code'}
            </Text>
          )}
        </TouchableOpacity>

        {/* Help text */}
        <Text style={styles.helpText}>
          Didn't receive the code? Check your SMS inbox or try resending.
        </Text>
      </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginBottom: 40, lineHeight: 22 },
  phoneHighlight: { fontFamily: 'Inter_600', color: Colors.text },
  otpWrap: { marginBottom: 24 },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,.06)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,.12)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: { fontFamily: 'Inter_500', fontSize: 13, color: Colors.red },
  verifyingText: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.gsheen, textAlign: 'center', marginBottom: 16 },
  resendBtn: { alignItems: 'center', paddingVertical: 12 },
  countdownRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  countdownCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.blackAlpha05,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownNum: { fontFamily: 'Inter_600', fontSize: 12, color: Colors.dim },
  resendTextDisabled: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.dim },
  resendText: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.gsheen },
  helpText: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.dim, textAlign: 'center', marginTop: 24, lineHeight: 18 },
});
