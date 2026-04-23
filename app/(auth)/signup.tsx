/**
 * twae — Sign Up Screen (Screen 1.2)
 * Full name, email, phone, password, referral code
 * Debounced email check, country picker, real-time validation
 * POST /auth/register → navigate to OTP Verify
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Animated,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';
import { useDebounce } from '../../hooks/useDebounce';
import { register, checkEmailExists } from '../../controllers/authController';

const countries = [
  { code: 'NG', dialCode: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: 'US', dialCode: '+1', name: 'United States', flag: '🇺🇸' },
  { code: 'GB', dialCode: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'GH', dialCode: '+233', name: 'Ghana', flag: '🇬🇭' },
  { code: 'KE', dialCode: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: 'ZA', dialCode: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: 'TZ', dialCode: '+255', name: 'Tanzania', flag: '🇹🇿' },
  { code: 'UG', dialCode: '+256', name: 'Uganda', flag: '🇺🇬' },
];

export default function SignupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ referral?: string }>();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [referralCode, setReferralCode] = useState(params.referral || '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [strength, setStrength] = useState(0);
  const [emailChecking, setEmailChecking] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [country, setCountry] = useState(countries[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');

  // Refs for field chaining
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const password2Ref = useRef<TextInput>(null);
  const referralRef = useRef<TextInput>(null);

  // Fade-in animation
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  // Debounced email existence check
  const debouncedEmail = useDebounce(email, 600);
  useEffect(() => {
    if (debouncedEmail && debouncedEmail.includes('@') && debouncedEmail.includes('.')) {
      setEmailChecking(true);
      checkEmailExists(debouncedEmail)
        .then(result => {
          if (result.exists) {
            setErrors(prev => ({ ...prev, email: 'This email is already registered' }));
          } else {
            setErrors(prev => {
              const { email: _, ...rest } = prev;
              return rest;
            });
          }
        })
        .catch(() => {})
        .finally(() => setEmailChecking(false));
    }
  }, [debouncedEmail]);

  // Auto-format phone based on country
  const formatPhone = (val: string) => {
    // Strip non-digits
    const digits = val.replace(/\D/g, '');
    if (country.code === 'NG') {
      // NGN: XXX XXXX XXXX
      if (digits.length <= 3) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
      return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7, 11)}`;
    }
    if (country.code === 'US') {
      // US: (XXX) XXX-XXXX
      if (digits.length <= 3) return digits;
      if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    return digits;
  };

  const handlePhoneChange = (val: string) => {
    setPhone(formatPhone(val));
  };

  const checkStrength = (val: string) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;
    setStrength(score);
    setPassword(val);
  };

  const strengthColors = ['transparent', Colors.red, '#f0c040', Colors.greenBright, Colors.greenBright];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  const validateFields = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Enter your full name';
    if (name.trim().split(' ').length < 2) errs.name = 'Enter first and last name';
    if (!email.includes('@') || !email.includes('.')) errs.email = 'Enter a valid email';
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 7) errs.phone = 'Enter a valid phone number';
    if (password.length < 8) errs.password = 'Min 8 characters';
    if (password !== password2) errs.password2 = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignup = async () => {
    if (!validateFields()) return;

    setLoading(true);
    try {
      const result = await register({
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        phone: `${country.dialCode}${phone.replace(/\D/g, '')}`,
        password,
        countryCode: country.code,
        referralCode: referralCode.trim() || undefined,
        streetAddress: streetAddress.trim() || undefined,
        city: city.trim() || undefined,
        deviceId: 'device-id-stub',
        deviceName: Platform.OS === 'ios' ? 'iPhone' : 'Android Device',
        osName: Platform.OS,
      });

      if (result.success) {
        router.push({
          pathname: '/(onboarding)/otp-verify',
          params: {
            userId: result.userId,
            phone: `${country.dialCode} ${phone}`,
            countryCode: country.code,
          },
        });
      }
    } catch (err: any) {
      setErrors({ submit: err.message || 'Registration failed. Try again.' });
    } finally {
      setLoading(false);
    }
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

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Image source={require('../../assets/Twae-Logo.png')} style={{ width: 140, height: 44 }} resizeMode="contain" />
            </View>
            <Text style={styles.title}>Create your{'\n'}account.</Text>
            <Text style={styles.subtitle}>Start building wealth today</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <AppInput
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="Adaugo Okonkwo"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => emailRef.current?.focus()}
              error={errors.name}
            />

            <AppInput
              ref={emailRef}
              label="Email address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => phoneRef.current?.focus()}
              error={errors.email}
              rightIcon={
                emailChecking ? (
                  <Text style={{ fontSize: 10, color: Colors.dim }}>checking…</Text>
                ) : undefined
              }
            />

            <AppInput
              label="Street address"
              value={streetAddress}
              onChangeText={setStreetAddress}
              placeholder="123 Main St"
              returnKeyType="next"
              blurOnSubmit={false}
            />
            
            <AppInput
              label="City"
              value={city}
              onChangeText={setCity}
              placeholder="Lagos"
              returnKeyType="next"
              blurOnSubmit={false}
            />

            {/* Country + Phone Row */}
            <Text style={styles.label}>Phone number</Text>
            <View style={styles.phoneRow}>
              <TouchableOpacity
                style={styles.countryBtn}
                onPress={() => setShowCountryPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.countryFlag}>{country.flag}</Text>
                <Text style={styles.countryDial}>{country.dialCode}</Text>
                <Ionicons name="chevron-down" size={14} color={Colors.dim} />
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <AppInput
                  ref={phoneRef}
                  label=""
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder={country.code === 'US' ? '(555) 123-4567' : '803 456 7890'}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  error={errors.phone}
                />
              </View>
            </View>

            <AppInput
              ref={passwordRef}
              label="Password"
              value={password}
              onChangeText={checkStrength}
              placeholder="Min. 8 characters"
              secureTextEntry
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => password2Ref.current?.focus()}
              error={errors.password}
            />
            <View style={styles.strengthRow}>
              <View style={styles.strengthBar}>
                {[0, 1, 2, 3].map(i => (
                  <View
                    key={i}
                    style={[
                      styles.strengthSeg,
                      i < strength && { backgroundColor: strengthColors[strength] },
                    ]}
                  />
                ))}
              </View>
              {strength > 0 && (
                <Text style={[styles.strengthLabel, { color: strengthColors[strength] }]}>
                  {strengthLabels[strength]}
                </Text>
              )}
            </View>

            <AppInput
              ref={password2Ref}
              label="Confirm password"
              value={password2}
              onChangeText={setPassword2}
              placeholder="Re-enter password"
              secureTextEntry
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => referralRef.current?.focus()}
              error={errors.password2}
            />

            {/* Address (optional) */}
            <AppInput
              label="Street address (optional)"
              value={streetAddress}
              onChangeText={setStreetAddress}
              placeholder="e.g. 12 Marina Road"
              returnKeyType="next"
            />
            <AppInput
              label="City (optional)"
              value={city}
              onChangeText={setCity}
              placeholder="e.g. Lagos"
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => referralRef.current?.focus()}
            />

            {/* Referral Code */}
            <AppInput
              ref={referralRef}
              label="Referral code (optional)"
              value={referralCode}
              onChangeText={setReferralCode}
              placeholder="e.g. FRIEND2025"
              autoCapitalize="characters"
              returnKeyType="done"
              onSubmitEditing={handleSignup}
            />

            {/* Terms & Privacy */}
            <View style={styles.termsRow}>
              <Text style={styles.termsText}>
                By creating an account, you agree to our{' '}
              </Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://twae.app/terms')}>
                <Text style={styles.termsLink}>Terms</Text>
              </TouchableOpacity>
              <Text style={styles.termsText}> and </Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://twae.app/privacy')}>
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>

            {errors.submit && (
              <View style={styles.submitError}>
                <Ionicons name="alert-circle" size={16} color={Colors.red} />
                <Text style={styles.submitErrorText}>{errors.submit}</Text>
              </View>
            )}

            <AppButton
              label="Create Account"
              onPress={handleSignup}
              loading={loading}
              style={{ marginTop: 8 }}
            />

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.switchLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <Modal visible={showCountryPicker} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {countries.map(c => (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    styles.countryItem,
                    country.code === c.code && styles.countryItemActive,
                  ]}
                  onPress={() => { setCountry(c); setShowCountryPicker(false); }}
                >
                  <Text style={styles.countryItemFlag}>{c.flag}</Text>
                  <Text style={styles.countryItemName}>{c.name}</Text>
                  <Text style={styles.countryItemCode}>{c.dialCode}</Text>
                  {country.code === c.code && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.g3} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  decoRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 24, paddingTop: 12 },
  decoDot: { width: 6, height: 6, borderRadius: 3 },
  header: { paddingTop: 16, paddingHorizontal: 24, paddingBottom: 20 },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 36 },
  logoGem: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontFamily: 'BricolageGrotesque_600', fontSize: 20, color: Colors.text },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 30, color: Colors.text, lineHeight: 38, marginBottom: 8 },
  subtitle: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted },
  form: { paddingHorizontal: 24 },
  label: { fontFamily: 'Inter_500', fontSize: 12, color: Colors.muted, marginBottom: 7, letterSpacing: 0.5, textTransform: 'uppercase' },
  phoneRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  countryBtn: { flexDirection: 'row', alignItems: 'center', height: 52, borderRadius: Radii.sm, backgroundColor: Colors.surface, paddingHorizontal: 12, borderWidth: 1.5, borderColor: Colors.blackAlpha04, gap: 6 },
  countryFlag: { fontSize: 18 },
  countryDial: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.text },
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: -8, marginBottom: 16 },
  strengthBar: { flexDirection: 'row', gap: 4, flex: 1 },
  strengthSeg: { flex: 1, height: 3, borderRadius: 3, backgroundColor: Colors.blackAlpha05 },
  strengthLabel: { fontFamily: 'Inter_500', fontSize: 11 },
  termsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  termsText: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted, lineHeight: 18 },
  termsLink: { fontFamily: 'Inter_500', fontSize: 12, color: Colors.gsheen, lineHeight: 18 },
  submitError: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,.06)', borderRadius: 10, padding: 12, marginBottom: 12 },
  submitErrorText: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.red, flex: 1 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  switchText: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted },
  switchLink: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.gsheen },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 20, color: Colors.text },
  countryItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.blackAlpha04 },
  countryItemActive: { backgroundColor: 'rgba(50,100,209,.04)' },
  countryItemFlag: { fontSize: 24, marginRight: 12 },
  countryItemName: { flex: 1, fontFamily: 'Inter_500', fontSize: 16, color: Colors.text },
  countryItemCode: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.dim, marginRight: 8 },
});
