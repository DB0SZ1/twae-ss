/**
 * twae — Transfer Confirm Screen (Screen C.4)
 * Final review + PIN entry before money moves
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Alert, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AppButton from '../../components/atoms/AppButton';
import OTPInput from '../../components/atoms/OTPInput';
import { Colors, Radii } from '../../constants/theme';
import { useCurrency } from '../../hooks/useCurrency';

export default function TransferConfirmScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    recipientName: string; recipientBank: string;
    recipientAcct: string; amount: string; fee: string; note: string;
  }>();
  const { formatNGN } = useCurrency();

  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(0);

  const amount = Number(params.amount || 0);
  const fee = Number(params.fee || 10);
  const total = amount + fee;

  const handleConfirm = () => {
    setShowPin(true);
  };

  const handlePinComplete = (enteredPin: string) => {
    setLoading(true);
    // Mock PIN verification
    setTimeout(() => {
      if (enteredPin === '123456') {
        // Success
        router.replace({
          pathname: '/(wallet)/receipt',
          params: {
            recipientName: params.recipientName,
            recipientBank: params.recipientBank,
            recipientAcct: params.recipientAcct,
            amount: params.amount,
            fee: params.fee,
            txnRef: `TXN_${Date.now()}`,
          },
        });
      } else {
        const attempts = pinAttempts + 1;
        setPinAttempts(attempts);
        if (attempts >= 5) {
          Alert.alert('PIN Locked', 'Too many wrong attempts. Your PIN is locked for 15 minutes.');
        } else {
          Alert.alert('Wrong PIN', `${5 - attempts} attempt(s) remaining`);
        }
        setPin('');
        setLoading(false);
      }
    }, 1200);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#000']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
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
            {/* Amount Display */}
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>You're sending</Text>
              <Text style={styles.amountValue}>{formatNGN(amount)}</Text>
            </View>

            {/* Recipient Card */}
            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Recipient</Text>
                <Text style={styles.detailValue}>{params.recipientName}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Bank</Text>
                <Text style={styles.detailValue}>{params.recipientBank}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Account</Text>
                <Text style={styles.detailValue}>{params.recipientAcct}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount</Text>
                <Text style={styles.detailValue}>{formatNGN(amount)}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Fee</Text>
                <Text style={styles.detailValue}>{formatNGN(fee)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: '#fff' }]}>Total Deducted</Text>
                <Text style={[styles.detailValue, { color: '#fff', fontFamily: 'BricolageGrotesque_600', fontSize: 18 }]}>{formatNGN(total)}</Text>
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

            <AppButton label="Confirm & Enter PIN" onPress={handleConfirm} />
            <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* PIN Entry */
          <View style={styles.pinSection}>
            <Ionicons name="lock-closed" size={32} color={Colors.g2} style={{ marginBottom: 16 }} />
            <Text style={styles.pinTitle}>Enter your PIN</Text>
            <Text style={styles.pinSub}>Enter your 6-digit transaction PIN to authorize</Text>
            <OTPInput
              length={6}
              onComplete={(v: string) => handlePinComplete(v)}
            />
            {loading && <Text style={styles.processingText}>Processing transfer...</Text>}
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
  detailCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 24,
  },
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
