/**
 * twae — Login Screen
 * Uses refs to chain field focus — no more focus-stealing on mobile
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  Animated,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passError, setPassError] = useState('');
  const [loading, setLoading] = useState(false);

  // Refs for field chaining
  const passwordRef = useRef<TextInput>(null);

  // Fade-in animation
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const handleLogin = async () => {
    let ok = true;
    if (!email) { setEmailError('Required'); ok = false; } else setEmailError('');
    if (!password) { setPassError('Required'); ok = false; } else setPassError('');
    if (!ok) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 1800);
  };

  const handleForgotPassword = () => {
    router.push('/(auth)/forgot-password');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <Animated.View style={{ opacity }}>
          {/* Decorative accent dots */}
          <View style={styles.decoRow}>
            <View style={[styles.decoDot, { backgroundColor: Colors.red }]} />
            <View style={[styles.decoDot, { backgroundColor: Colors.gold2 }]} />
            <View style={[styles.decoDot, { backgroundColor: Colors.greenBright }]} />
            <View style={[styles.decoDot, { backgroundColor: Colors.skyDark }]} />
          </View>

          <View style={styles.header}>
            <View style={styles.logoRow}>
              <LinearGradient colors={[Colors.g2, Colors.gsheen]} style={styles.logoGem}>
                <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
                  <Path d="M11 2L18 7V15L11 20L4 15V7L11 2Z" fill="white" opacity={0.9} />
                </Svg>
              </LinearGradient>
              <Text style={styles.logoText}>twae</Text>
            </View>
            <Text style={styles.title}>Welcome{'\n'}back.</Text>
            <Text style={styles.subtitle}>Sign in to your private account</Text>
          </View>

          <View style={styles.form}>
            <AppInput
              label="Email address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => passwordRef.current?.focus()}
              error={emailError}
            />

            <AppInput
              ref={passwordRef}
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              error={passError}
            />

            <View style={styles.forgotRow}>
              <TouchableOpacity
                onPress={handleForgotPassword}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <AppButton label="Sign in" onPress={handleLogin} loading={loading} />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <AppButton
              label="Face ID / Fingerprint"
              onPress={() => {}}
              variant="secondary"
              icon={<Ionicons name="finger-print" size={18} color={Colors.gsheen} />}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.switchLink}>Create one</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  decoRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 24, paddingTop: 12 },
  decoDot: { width: 6, height: 6, borderRadius: 3 },
  header: { paddingTop: 16, paddingHorizontal: 24, paddingBottom: 32 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 36 },
  logoGem: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: 'BricolageGrotesque_600', fontSize: 20, color: Colors.text },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 30, color: Colors.text, lineHeight: 38, marginBottom: 8 },
  subtitle: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted },
  form: { paddingHorizontal: 24 },
  forgotRow: { alignItems: 'flex-end', marginTop: -8, marginBottom: 16 },
  forgotText: { fontFamily: 'Inter_500', fontSize: 13, color: Colors.gsheen },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.blackAlpha05 },
  dividerText: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.dim },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  switchText: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted },
  switchLink: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.gsheen },
});
