/**
 * twae — KYC Identity Screen (BVN / NIN)
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Fonts, FontSizes, Radii, Spacing } from '../../constants/theme';

export default function KYCIdentityScreen() {
  const router = useRouter();
  const [type, setType] = useState<'bvn' | 'nin'>('bvn');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (value.length < 11) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/(onboarding)/kyc-docs');
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Identity Verification" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Verify your identity</Text>
        <Text style={styles.sub}>We need your BVN or NIN to verify your identity and comply with CBN regulations.</Text>

        {/* Type Toggle */}
        <View style={styles.toggleWrap}>
          {(['bvn', 'nin'] as const).map(t => (
            <TouchableOpacity
              key={t}
              style={[styles.toggleBtn, type === t && styles.toggleBtnActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.toggleText, type === t && styles.toggleTextActive]}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <AppInput
          label={type === 'bvn' ? 'Bank Verification Number' : 'National ID Number'}
          value={value}
          onChangeText={setValue}
          placeholder={type === 'bvn' ? '22XXXXXXXXX' : '000XXXXXXXX'}
          keyboardType="number-pad"
          maxLength={11}
        />

        {/* Tier Info */}
        <View style={styles.tierInfo}>
          <Ionicons name="shield-checkmark" size={16} color={Colors.gsheen} />
          <Text style={styles.tierText}>
            This verifies you for Tier 2. Complete document upload for Tier 3 (₦10M daily limit).
          </Text>
        </View>

        <AppButton label="Verify" onPress={handleSubmit} loading={loading} disabled={value.length < 11} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 24, paddingTop: 16 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, lineHeight: 20, marginBottom: 24 },
  toggleWrap: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  toggleBtn: { flex: 1, height: 44, borderRadius: Radii.pill, borderWidth: 1, borderColor: Colors.blackAlpha05, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  toggleBtnActive: { backgroundColor: Colors.g2, borderColor: 'transparent' },
  toggleText: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.muted },
  toggleTextActive: { color: '#fff' },
  tierInfo: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: 'rgba(50,100,209,.04)', borderRadius: 12, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(50,100,209,.08)' },
  tierText: { flex: 1, fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted, lineHeight: 18 },
});
