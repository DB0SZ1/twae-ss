/**
 * twae — FX Convert Screen (Screen C.6)
 * Convert NGN ↔ USD with live rate display and 30s countdown
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';
import { useCurrency } from '../../hooks/useCurrency';

export default function FXConvertScreen() {
  const router = useRouter();
  const { formatNGN, formatUSD } = useCurrency();

  const [direction, setDirection] = useState<'NGN_USD' | 'USD_NGN'>('NGN_USD');
  const [fromAmount, setFromAmount] = useState('');
  const [rate, setRate] = useState(1560.50);
  const [countdown, setCountdown] = useState(30);
  const timerRef = useRef<any>(null);

  // Rate refresh countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Refresh rate with slight fluctuation
          setRate(1560.50 + (Math.random() * 10 - 5));
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const toggleDirection = () => {
    setDirection(d => d === 'NGN_USD' ? 'USD_NGN' : 'NGN_USD');
    setFromAmount('');
  };

  const toAmount = () => {
    const amt = Number(fromAmount) || 0;
    if (direction === 'NGN_USD') return (amt / rate).toFixed(2);
    return (amt * rate).toFixed(2);
  };

  const fromCurrency = direction === 'NGN_USD' ? 'NGN' : 'USD';
  const toCurrency = direction === 'NGN_USD' ? 'USD' : 'NGN';
  const fromFlag = direction === 'NGN_USD' ? '🇳🇬' : '🇺🇸';
  const toFlag = direction === 'NGN_USD' ? '🇺🇸' : '🇳🇬';

  const handleConvert = () => {
    const resultStr = direction === 'NGN_USD'
      ? `Convert ${formatNGN(Number(fromAmount))} to $${toAmount()} at rate ₦${rate.toFixed(2)}/$1`
      : `Convert $${fromAmount} to ${formatNGN(Number(toAmount()))} at rate ₦${rate.toFixed(2)}/$1`;

    router.push({
      pathname: '/(wallet)/confirm',
      params: {
        recipientName: `FX Conversion`,
        recipientBank: `${fromCurrency} → ${toCurrency}`,
        recipientAcct: `Rate: ₦${rate.toFixed(2)}/$1`,
        amount: fromAmount,
        fee: '0',
        note: resultStr,
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#000']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Convert Currency</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.body}>
        {/* Rate Display */}
        <View style={styles.rateCard}>
          <View style={styles.rateRow}>
            <Text style={styles.rateLabel}>Current Rate</Text>
            <View style={styles.countdownPill}>
              <Ionicons name="time-outline" size={12} color={Colors.gold1} />
              <Text style={styles.countdownText}>{countdown}s</Text>
            </View>
          </View>
          <Text style={styles.rateValue}>$1 = ₦{rate.toFixed(2)}</Text>
        </View>

        {/* From Input */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>From</Text>
            <View style={styles.currPill}>
              <Text style={{ fontSize: 16 }}>{fromFlag}</Text>
              <Text style={styles.currText}>{fromCurrency}</Text>
            </View>
          </View>
          <TextInput
            style={styles.amountInput}
            value={fromAmount}
            onChangeText={setFromAmount}
            placeholder="0.00"
            placeholderTextColor="rgba(255,255,255,0.2)"
            keyboardType="numeric"
          />
        </View>

        {/* Swap Button */}
        <TouchableOpacity style={styles.swapBtn} onPress={toggleDirection}>
          <Ionicons name="swap-vertical" size={24} color="#fff" />
        </TouchableOpacity>

        {/* To Display */}
        <View style={styles.inputCard}>
          <View style={styles.inputHeader}>
            <Text style={styles.inputLabel}>To</Text>
            <View style={styles.currPill}>
              <Text style={{ fontSize: 16 }}>{toFlag}</Text>
              <Text style={styles.currText}>{toCurrency}</Text>
            </View>
          </View>
          <Text style={styles.resultAmount}>
            {fromAmount ? (toCurrency === 'NGN' ? `₦${Number(toAmount()).toLocaleString()}` : `$${toAmount()}`) : '0.00'}
          </Text>
        </View>

        {/* Summary */}
        {fromAmount && Number(fromAmount) > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>You send</Text>
              <Text style={styles.summaryValue}>{fromCurrency === 'NGN' ? `₦${Number(fromAmount).toLocaleString()}` : `$${fromAmount}`}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Exchange rate</Text>
              <Text style={styles.summaryValue}>₦{rate.toFixed(2)}/$1</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Fee</Text>
              <Text style={[styles.summaryValue, { color: Colors.greenBright }]}>Free</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: '#fff' }]}>You receive</Text>
              <Text style={[styles.summaryValue, { color: '#fff', fontFamily: 'BricolageGrotesque_600', fontSize: 16 }]}>
                {toCurrency === 'NGN' ? `₦${Number(toAmount()).toLocaleString()}` : `$${toAmount()}`}
              </Text>
            </View>
          </View>
        )}

        <AppButton
          label="Convert"
          onPress={handleConvert}
          disabled={!fromAmount || Number(fromAmount) <= 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: '#fff' },
  body: { paddingHorizontal: 24 },
  rateCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 24,
  },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  rateLabel: { fontFamily: 'Inter_400', fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  countdownPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(217,119,6,0.12)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  countdownText: { fontFamily: 'Inter_600', fontSize: 11, color: Colors.gold1 },
  rateValue: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: '#fff' },
  inputCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  inputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  inputLabel: { fontFamily: 'Inter_400', fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  currPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radii.pill,
  },
  currText: { fontFamily: 'Inter_600', fontSize: 12, color: '#fff' },
  amountInput: { fontFamily: 'BricolageGrotesque_600', fontSize: 32, color: '#fff' },
  resultAmount: { fontFamily: 'BricolageGrotesque_600', fontSize: 32, color: Colors.greenBright },
  swapBtn: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.g2, justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginVertical: -14, zIndex: 10,
    shadowColor: Colors.g2, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 6,
  },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginTop: 20, marginBottom: 20,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontFamily: 'Inter_400', fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  summaryValue: { fontFamily: 'Inter_500', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 6 },
});
