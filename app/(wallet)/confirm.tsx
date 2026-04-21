/**
 * twae — Transfer Confirm Screen (Screen C.4)
 * Final review + PIN entry before money moves
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Alert, Animated, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AppButton from '../../components/atoms/AppButton';
import OTPInput from '../../components/atoms/OTPInput';
import { Colors, Radii } from '../../constants/theme';
import { useCurrency } from '../../hooks/useCurrency';
import { transferMoney, convertCurrency } from '../../controllers/walletController';

export default function TransferConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    recipientName: string; recipientBank: string; recipientBankCode: string;
    recipientAcct: string; amount: string; fee: string; note: string;
    currency: string; isConversion: string; toCurrency: string; saveBeneficiary: string;
  }>();
  const { formatNGN } = useCurrency();

  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(0);

  const amount = Number(params.amount || 0);
  const fee = Number(params.fee || 0);
  const total = amount + fee;
  const isConversion = params.isConversion === 'true';
  const saveBeneficiary = params.saveBeneficiary === 'true';

  const handleConfirm = () => {
    setShowPin(true);
  };

  const executeTransaction = async (enteredPin: string) => {
    setLoading(true);
    try {
      // Note: Ideally PIN is sent in payload to backend to authorize. For now logic uses backend directly.
      let res;
      if (isConversion) {
        res = await convertCurrency({
          fromCurrency: params.currency || 'NGN',
          toCurrency: params.toCurrency || 'USD',
          amount: amount
        });
      } else {
        res = await transferMoney({
          recipient_name: params.recipientName,
          recipient_bank_code: params.recipientBankCode || '123',
          recipient_account: params.recipientAcct,
          amount: amount,
          currency: params.currency || 'NGN',
          narration: params.note || '',
          save_beneficiary: saveBeneficiary,
          pin: enteredPin // Pass to backend if endpoint requires it
        });
      }

      router.replace({
        pathname: '/(wallet)/receipt',
        params: {
          recipientName: params.recipientName,
          recipientBank: params.recipientBank,
          recipientAcct: params.recipientAcct,
          amount: params.amount,
          fee: params.fee,
          txnRef: res.reference || `TXN_${Date.now()}`,
        },
      });

    } catch (err: any) {
      const attempts = pinAttempts + 1;
      setPinAttempts(attempts);
      
      // If error is about wrong PIN, handle it locally for UI sake
      if ((err.message || '').toLowerCase().includes('pin')) {
        if (attempts >= 5) {
          Alert.alert('PIN Locked', 'Too many wrong attempts. Your account is temporarily locked.');
          router.replace('/(tabs)');
        } else {
          Alert.alert('Wrong PIN', `${5 - attempts} attempt(s) remaining`);
        }
      } else {
        Alert.alert('Transaction Failed', err.message || 'Something went wrong.');
      }
      setPin('');
      setLoading(false);
      setShowPin(false); // Give them a chance to recheck details before trying PIN again
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#000']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => showPin ? setShowPin(false) : router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Transfer</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.body}>
        {!showPin ? (
          <>
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>You're sending</Text>
              <Text style={styles.amountValue}>{params.currency === 'USD' ? `$${amount}` : formatNGN(amount)}</Text>
            </View>

            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Recipient</Text>
                <Text style={styles.detailValue}>{params.recipientName}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{isConversion ? 'Conversion Path' : 'Bank'}</Text>
                <Text style={styles.detailValue}>{params.recipientBank}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>{isConversion ? 'Rate Info' : 'Account'}</Text>
                <Text style={styles.detailValue}>{params.recipientAcct}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount</Text>
                <Text style={styles.detailValue}>{params.currency === 'USD' ? `$${amount}` : formatNGN(amount)}</Text>
              </View>
              {!isConversion && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fee</Text>
                  <Text style={styles.detailValue}>{formatNGN(fee)}</Text>
                </View>
              )}
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: '#fff' }]}>Total Deducted</Text>
                <Text style={[styles.detailValue, { color: '#fff', fontFamily: 'BricolageGrotesque_600', fontSize: 18 }]}>
                  {params.currency === 'USD' ? `$${total}` : formatNGN(total)}
                </Text>
              </View>
              {params.note && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Note</Text>
                    <Text style={styles.detailValue}>{params.note}</Text>
                  </View>
                </>
              )}
            </View>

            <AppButton label="Confirm & Enter PIN" onPress={handleConfirm} disabled={loading} />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.pinSection}>
            <Ionicons name="lock-closed" size={32} color={Colors.g2} style={{ marginBottom: 16 }} />
            <Text style={styles.pinTitle}>Enter your PIN</Text>
            <Text style={styles.pinSub}>Enter your 6-digit transaction PIN to authorize</Text>
            <OTPInput
              length={6}
              onComplete={(v: string) => executeTransaction(v)}
            />
            {loading && <Text style={styles.processingText}>Processing transaction securely...</Text>}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: '#fff' },
  body: { flex: 1, paddingHorizontal: 24 },
  amountSection: { alignItems: 'center', marginVertical: 24 },
  amountLabel: { fontFamily: 'Inter_400', fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 8 },
  amountValue: { fontFamily: 'BricolageGrotesque_600', fontSize: 40, color: '#fff' },
  detailCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 24 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  detailLabel: { fontFamily: 'Inter_400', fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  detailValue: { fontFamily: 'Inter_500', fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'right', maxWidth: '55%' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  cancelBtn: { alignItems: 'center', paddingVertical: 14 },
  cancelText: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.red },
  pinSection: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pinTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 22, color: '#fff', marginBottom: 8 },
  pinSub: { fontFamily: 'Inter_400', fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 32, textAlign: 'center' },
  processingText: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.gold1, marginTop: 20 },
});
