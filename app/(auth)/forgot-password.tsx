/**
 * twae — Forgot Password / Reset PIN Screen
 * Two-step: enter email → receive OTP → set new password.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import OTPInput from '../../components/atoms/OTPInput';
import { Colors } from '../../constants/theme';
import { forgotPassword, verifyResetOTP, resetPassword } from '../../controllers/authController';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  // 'email' | 'otp' | 'new_password'
  const [step, setStep] = useState<'email' | 'otp' | 'new_password'>('email');

  const [email, setEmail] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fade-in animation
  const opacity = useRef(new Animated.Value(0)).current;

  // Shake animation for OTP
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, [step]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleSendCode = async () => {
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await forgotPassword(email);
      setSuccessMessage(res.message);
      setTimeout(() => {
        setSuccessMessage('');
        setStep('otp');
        opacity.setValue(0);
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (otpValue: string) => {
    setLoading(true);
    setErrorMessage('');
    setOtpError(false);
    try {
      const res = await verifyResetOTP(email, otpValue);
      if (res.success) {
        setResetToken(res.reset_token);
        setStep('new_password');
        opacity.setValue(0);
      } else {
        setOtpError(true);
        triggerShake();
        setErrorMessage(res.message || 'Invalid code.');
      }
    } catch (err: any) {
      setOtpError(true);
      triggerShake();
      setErrorMessage(err.message || 'Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await resetPassword(resetToken, password);
      setSuccessMessage(res.message);
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to reset password. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'email') router.back();
    else if (step === 'otp') setStep('email');
    else if (step === 'new_password') setStep('otp');
    opacity.setValue(0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={{ opacity }}>
          
          {step === 'email' && (
            <View style={styles.form}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={32} color={Colors.g3} />
              </View>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Enter your email address to receive a verification code.</Text>

              <AppInput
                label="Email address"
                value={email}
                onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
              {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

              <AppButton label="Send Reset Code" onPress={handleSendCode} loading={loading} style={{ marginTop: 12 }} />
            </View>
          )}

          {step === 'otp' && (
            <View style={styles.form}>
              <View style={styles.iconContainer}>
                <Ionicons name="keypad-outline" size={32} color={Colors.g3} />
              </View>
              <Text style={styles.title}>Enter Code</Text>
              <Text style={styles.subtitle}>We've sent a 6-digit code to{'\n'}<Text style={{ fontFamily: 'Inter_600' }}>{email}</Text></Text>

              <Animated.View style={[styles.otpWrap, { transform: [{ translateX: shakeAnim }] }]}>
                <OTPInput onComplete={handleVerifyOTP} error={otpError} />
              </Animated.View>

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

              {loading && <Text style={styles.verifyingText}>Verifying…</Text>}

            </View>
          )}

          {step === 'new_password' && (
            <View style={styles.form}>
              <View style={styles.iconContainer}>
                <Ionicons name="lock-closed-outline" size={32} color={Colors.g3} />
              </View>
              <Text style={styles.title}>New Password</Text>
              <Text style={styles.subtitle}>Create a new secure password for your account.</Text>

              <AppInput
                label="New Password"
                value={password}
                onChangeText={(text) => { setPassword(text); setErrorMessage(''); }}
                placeholder="Min. 8 characters"
                secureTextEntry
              />

              <AppInput
                label="Confirm Password"
                value={confirmPassword}
                onChangeText={(text) => { setConfirmPassword(text); setErrorMessage(''); }}
                placeholder="Re-enter password"
                secureTextEntry
              />

              {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
              {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

              <AppButton label="Confirm Password" onPress={handleResetPassword} loading={loading} style={{ marginTop: 12 }} />
            </View>
          )}

        </Animated.View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  headerBar: { paddingHorizontal: 24, paddingVertical: 16 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  scrollContent: { flexGrow: 1, paddingBottom: 40, paddingHorizontal: 24 },
  form: { marginTop: 20 },
  iconContainer: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(50,100,209,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 30, color: Colors.text, marginBottom: 8 },
  subtitle: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, lineHeight: 22, marginBottom: 32 },
  errorText: { fontFamily: 'Inter_500', fontSize: 13, color: Colors.red, marginTop: 8, marginBottom: 8 },
  successText: { fontFamily: 'Inter_500', fontSize: 13, color: Colors.greenBright, marginTop: 8, marginBottom: 8 },
  otpWrap: { marginBottom: 24 },
  verifyingText: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.gsheen, textAlign: 'center', marginTop: 16 },
});
