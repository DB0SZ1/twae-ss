/**
 * twae — KYC Identity Screen (Screen 1.5a)
 * BVN/NIN toggle for Nigerian users; SSN/passport for US users
 * Masked input, verification polling, tier explanation card
 * Step 1/3 progress bar
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';
import { submitBVN, submitNIN, submitSSN, submitPassport, checkKYCStatus, getTierInfo } from '../../controllers/kycController';

const IS_DEV = process.env.EXPO_PUBLIC_APP_ENV === 'development' || __DEV__;

type NGDocType = 'bvn' | 'nin';
type USDocType = 'ssn' | 'passport';

export default function KYCIdentityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string; countryCode?: string }>();
  const isUS = params.countryCode === 'US';

  const [ngType, setNgType] = useState<NGDocType>('bvn');
  const [usType, setUsType] = useState<USDocType>('ssn');
  const [value, setValue] = useState('');
  const [maskedDisplay, setMaskedDisplay] = useState('');
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>('');
  const [showTierDetails, setShowTierDetails] = useState(false);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;

  const tiers = getTierInfo();

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    // Animate progress bar to step 1/3
    Animated.timing(progressWidth, { toValue: 33, duration: 600, useNativeDriver: false }).start();
  }, []);

  // Mask input (show only last 4 digits)
  const handleValueChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    setValue(digits);

    if (digits.length > 4) {
      const masked = '•'.repeat(digits.length - 4) + digits.slice(-4);
      setMaskedDisplay(masked);
    } else {
      setMaskedDisplay(digits);
    }
  };

  // Get max length based on doc type
  const getMaxLength = () => {
    if (isUS) return usType === 'ssn' ? 9 : 12;
    return 11; // BVN and NIN are both 11 digits
  };

  const getPlaceholder = () => {
    if (isUS) return usType === 'ssn' ? 'XXX-XX-XXXX' : 'Passport number';
    return ngType === 'bvn' ? '22XXXXXXXXX' : '000XXXXXXXX';
  };

  const getLabel = () => {
    if (isUS) return usType === 'ssn' ? 'Social Security Number' : 'Passport Number';
    return ngType === 'bvn' ? 'Bank Verification Number' : 'National ID Number';
  };

  const handleSubmit = async () => {
    const digits = value.replace(/\D/g, '');
    if (digits.length < (isUS && usType === 'ssn' ? 9 : isUS ? 6 : 11)) return;

    setLoading(true);
    try {
      let result;
      if (isUS) {
        result = usType === 'ssn'
          ? await submitSSN(params.userId || '', digits)
          : await submitPassport(params.userId || '', digits);
      } else {
        result = ngType === 'bvn'
          ? await submitBVN(params.userId || '', digits)
          : await submitNIN(params.userId || '', digits);
      }

      if (result.success) {
        // Start polling for verification status
        setPolling(true);
        setVerificationStatus('Processing your verification…');
        pollStatus();
      }
    } catch {
      setVerificationStatus('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = async () => {
    let attempts = 0;
    const maxAttempts = 10;

    const poll = async () => {
      attempts++;
      try {
        const status = await checkKYCStatus(params.userId || '');
        if (status.status === 'verified') {
          setVerificationStatus('✓ Identity verified!');
          setPolling(false);
          setTimeout(() => {
            router.push({
              pathname: '/(onboarding)/kyc-docs',
              params: { userId: params.userId, countryCode: params.countryCode },
            });
          }, 1200);
          return;
        }
        if (status.status === 'failed') {
          setVerificationStatus(`Verification failed: ${status.rejectionReason || 'Unknown error'}`);
          setPolling(false);
          return;
        }
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        } else {
          setVerificationStatus('Taking longer than expected. We\'ll notify you.');
          setPolling(false);
        }
      } catch {
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000);
        }
      }
    };

    poll();
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Identity Verification" />

      {/* Progress bar — Step 1/3 */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.progressBar, {
          width: progressWidth.interpolate({
            inputRange: [0, 100],
            outputRange: ['0%', '100%'],
          }),
        }]} />
        <Text style={styles.progressLabel}>Step 1 of 3</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeIn }}>
          <Text style={styles.title}>Verify your identity</Text>
          <Text style={styles.sub}>
            {isUS
              ? 'We need your SSN or passport to comply with federal regulations.'
              : 'We need your BVN or NIN to verify your identity and comply with CBN regulations.'}
          </Text>

          {/* Type Toggle */}
          <View style={styles.toggleWrap}>
            {isUS
              ? (['ssn', 'passport'] as USDocType[]).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.toggleBtn, usType === t && styles.toggleBtnActive]}
                    onPress={() => { setUsType(t); setValue(''); setMaskedDisplay(''); }}
                  >
                    <Text style={[styles.toggleText, usType === t && styles.toggleTextActive]}>
                      {t.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))
              : (['bvn', 'nin'] as NGDocType[]).map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.toggleBtn, ngType === t && styles.toggleBtnActive]}
                    onPress={() => { setNgType(t); setValue(''); setMaskedDisplay(''); }}
                  >
                    <Text style={[styles.toggleText, ngType === t && styles.toggleTextActive]}>
                      {t.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))
            }
          </View>

          <AppInput
            label={getLabel()}
            value={value}
            onChangeText={handleValueChange}
            placeholder={getPlaceholder()}
            keyboardType={isUS && usType === 'passport' ? 'default' : 'number-pad'}
            maxLength={getMaxLength()}
          />

          {/* Masked display */}
          {value.length > 4 && (
            <View style={styles.maskedRow}>
              <Ionicons name="eye-off" size={14} color={Colors.dim} />
              <Text style={styles.maskedText}>Displayed as: {maskedDisplay}</Text>
            </View>
          )}

          {/* Verification status */}
          {verificationStatus ? (
            <View style={[styles.statusBox, verificationStatus.includes('✓') && styles.statusBoxSuccess]}>
              {polling && <View style={styles.pollingDot} />}
              <Text style={[styles.statusText, verificationStatus.includes('✓') && styles.statusTextSuccess]}>
                {verificationStatus}
              </Text>
            </View>
          ) : null}

          {/* Tier Info Card */}
          <TouchableOpacity
            style={styles.tierInfo}
            onPress={() => setShowTierDetails(!showTierDetails)}
            activeOpacity={0.8}
          >
            <View style={styles.tierHeader}>
              <Ionicons name="shield-checkmark" size={16} color={Colors.gsheen} />
              <Text style={styles.tierHeaderText}>What does verification unlock?</Text>
              <Ionicons name={showTierDetails ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.dim} />
            </View>
            {showTierDetails && (
              <View style={styles.tierDetails}>
                {tiers.map(t => (
                  <View key={t.tier} style={styles.tierRow}>
                    <View style={[styles.tierBadge, t.tier === 2 && styles.tierBadgeActive]}>
                      <Text style={[styles.tierBadgeText, t.tier === 2 && styles.tierBadgeTextActive]}>
                        Tier {t.tier}
                      </Text>
                    </View>
                    <View style={styles.tierInfo2}>
                      <Text style={styles.tierLimit}>{t.dailyLimit}/day</Text>
                      <Text style={styles.tierFeatures}>{t.features.join(' • ')}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>

          <AppButton
            label="Verify"
            onPress={handleSubmit}
            loading={loading || polling}
            disabled={value.length < (isUS && usType === 'ssn' ? 9 : isUS ? 6 : 11)}
          />

          {/* Dev-mode skip */}
          {IS_DEV && (
            <AppButton
              label="Skip for now (Dev)"
              onPress={() => router.replace('/(tabs)')}
              variant="ghost"
              style={{ marginTop: 12 }}
            />
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  progressContainer: {
    height: 4,
    backgroundColor: Colors.blackAlpha05,
    marginHorizontal: 24,
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressBar: { height: '100%', backgroundColor: Colors.g3, borderRadius: 2 },
  progressLabel: {
    fontFamily: 'Inter_500',
    fontSize: 11,
    color: Colors.dim,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 8,
  },
  content: { padding: 24, paddingTop: 16 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, lineHeight: 20, marginBottom: 24 },
  toggleWrap: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  toggleBtn: { flex: 1, height: 44, borderRadius: Radii.pill, borderWidth: 1, borderColor: Colors.blackAlpha05, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  toggleBtnActive: { backgroundColor: Colors.g2, borderColor: 'transparent' },
  toggleText: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.muted },
  toggleTextActive: { color: '#fff' },
  maskedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16, marginTop: -8 },
  maskedText: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.dim },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(50,100,209,.04)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(50,100,209,.08)',
  },
  statusBoxSuccess: {
    backgroundColor: 'rgba(34,197,94,.04)',
    borderColor: 'rgba(34,197,94,.12)',
  },
  pollingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gsheen,
  },
  statusText: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.muted, flex: 1 },
  statusTextSuccess: { color: Colors.greenBright, fontFamily: 'Inter_500' },
  tierInfo: {
    backgroundColor: 'rgba(50,100,209,.04)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(50,100,209,.08)',
  },
  tierHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tierHeaderText: { flex: 1, fontFamily: 'Inter_500', fontSize: 13, color: Colors.text },
  tierDetails: { marginTop: 16 },
  tierRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.blackAlpha05,
  },
  tierBadgeActive: { backgroundColor: Colors.g2, borderColor: 'transparent' },
  tierBadgeText: { fontFamily: 'Inter_600', fontSize: 11, color: Colors.muted },
  tierBadgeTextActive: { color: '#fff' },
  tierInfo2: { flex: 1 },
  tierLimit: { fontFamily: 'Inter_600', fontSize: 13, color: Colors.text, marginBottom: 2 },
  tierFeatures: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.muted, lineHeight: 16 },
});
