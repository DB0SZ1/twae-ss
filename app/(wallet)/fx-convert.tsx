/**
 * twae — FX Conversion Screen
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii, Shadows } from '../../constants/theme';
import { exchangeRate } from '../../constants/mockData';
import { useCurrency } from '../../hooks/useCurrency';

export default function FXConvertScreen() {
  const router = useRouter();
  const { formatNGN, formatUSD } = useCurrency();
  const [direction, setDirection] = useState<'ngnToUsd' | 'usdToNgn'>('ngnToUsd');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const rate = direction === 'ngnToUsd' ? exchangeRate.ngnToUsd : exchangeRate.usdToNgn;
  const converted = amount ? (parseFloat(amount) * rate).toFixed(2) : '0.00';

  return (
    <View style={styles.container}>
      <AppHeader title="FX Convert" />
      <ScrollView contentContainerStyle={styles.body}>
        {/* Rate Display */}
        <View style={styles.rateCard}>
          <Text style={styles.rateLabel}>LIVE RATE</Text>
          <Text style={styles.rateVal}>$1 = ₦{exchangeRate.usdToNgn.toLocaleString()}</Text>
        </View>

        {/* Direction Toggle */}
        <TouchableOpacity style={styles.dirBtn} onPress={() => setDirection(d => d === 'ngnToUsd' ? 'usdToNgn' : 'ngnToUsd')}>
          <Ionicons name="swap-vertical" size={20} color={Colors.g3} />
          <Text style={styles.dirText}>
            {direction === 'ngnToUsd' ? 'NGN → USD' : 'USD → NGN'}
          </Text>
        </TouchableOpacity>

        <AppInput label={direction === 'ngnToUsd' ? 'Amount in NGN' : 'Amount in USD'} value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" prefix={direction === 'ngnToUsd' ? '₦' : '$'} />

        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>YOU RECEIVE</Text>
          <Text style={styles.resultVal}>
            {direction === 'ngnToUsd' ? `$${converted}` : `₦${parseFloat(converted).toLocaleString()}`}
          </Text>
        </View>

        <AppButton label="Convert" onPress={() => { setLoading(true); setTimeout(() => { setLoading(false); router.back(); }, 1500); }} loading={loading} disabled={!amount} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24 },
  rateCard: { backgroundColor: 'rgba(50,100,209,.04)', borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(50,100,209,.08)', alignItems: 'center' },
  rateLabel: { fontSize: 10, fontFamily: 'Inter_400', color: Colors.muted, letterSpacing: 0.4, marginBottom: 4 },
  rateVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 20, color: Colors.g2 },
  dirBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', backgroundColor: Colors.surface, borderRadius: Radii.pill, paddingVertical: 10, paddingHorizontal: 20, borderWidth: 1, borderColor: Colors.blackAlpha05, marginBottom: 20 },
  dirText: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.text },
  resultCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.blackAlpha04 },
  resultLabel: { fontSize: 10, fontFamily: 'Inter_400', color: Colors.muted, letterSpacing: 0.4, marginBottom: 4 },
  resultVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.greenBright },
});
