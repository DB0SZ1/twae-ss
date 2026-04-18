/**
 * twae — Transfer Receipt Screen (Screen C.5)
 * Post-transfer success screen. Shareable, downloadable.
 */
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Alert, Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';
import { useCurrency } from '../../hooks/useCurrency';

export default function TransferReceiptScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    recipientName: string; recipientBank: string;
    recipientAcct: string; amount: string; fee: string; txnRef: string;
  }>();
  const { formatNGN } = useCurrency();

  const amount = Number(params.amount || 0);
  const fee = Number(params.fee || 10);

  const copyRef = async () => {
    await Clipboard.setStringAsync(params.txnRef || '');
    Alert.alert('Copied!', 'Transaction reference copied');
  };

  const shareReceipt = async () => {
    try {
      await Share.share({
        message: `twae Transfer Receipt\n\nRecipient: ${params.recipientName}\nBank: ${params.recipientBank}\nAccount: ${params.recipientAcct}\nAmount: ${formatNGN(amount)}\nFee: ${formatNGN(fee)}\nTotal: ${formatNGN(amount + fee)}\nRef: ${params.txnRef}\n\nSent via twae`,
      });
    } catch {}
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#000']} style={StyleSheet.absoluteFillObject} />

      <View style={styles.body}>
        {/* Success Icon */}
        <View style={styles.successCircle}>
          <Ionicons name="checkmark" size={48} color={Colors.greenBright} />
        </View>
        <Text style={styles.successTitle}>Transfer Successful!</Text>
        <Text style={styles.successAmount}>{formatNGN(amount)}</Text>
        <Text style={styles.successSub}>sent to {params.recipientName}</Text>

        {/* Detail Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Recipient</Text>
            <Text style={styles.value}>{params.recipientName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Bank</Text>
            <Text style={styles.value}>{params.recipientBank}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Account</Text>
            <Text style={styles.value}>{params.recipientAcct}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>{formatNGN(amount)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fee</Text>
            <Text style={styles.value}>{formatNGN(fee)}</Text>
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={copyRef}>
            <Text style={styles.label}>Reference</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.value, { color: Colors.g2 }]}>{params.txnRef?.slice(0, 16)}...</Text>
              <Ionicons name="copy-outline" size={14} color={Colors.g2} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={shareReceipt}>
            <Ionicons name="share-outline" size={20} color="#fff" />
            <Text style={styles.actionLbl}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Download', 'PDF receipt would be generated here')}>
            <Ionicons name="document-outline" size={20} color="#fff" />
            <Text style={styles.actionLbl}>PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => {
            router.replace({
              pathname: '/(wallet)/send',
            });
          }}>
            <Ionicons name="repeat-outline" size={20} color="#fff" />
            <Text style={styles.actionLbl}>Again</Text>
          </TouchableOpacity>
        </View>

        <AppButton label="Done — Back to Home" onPress={() => router.replace('/(tabs)')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  body: { flex: 1, paddingHorizontal: 24, paddingTop: 80, alignItems: 'center' },
  successCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(74,222,128,0.12)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(74,222,128,0.25)', marginBottom: 16,
  },
  successTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 22, color: '#fff', marginBottom: 4 },
  successAmount: { fontFamily: 'BricolageGrotesque_600', fontSize: 36, color: Colors.greenBright, marginBottom: 4 },
  successSub: { fontFamily: 'Inter_400', fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 28 },
  card: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 24,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  label: { fontFamily: 'Inter_400', fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  value: { fontFamily: 'Inter_500', fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'right', maxWidth: '55%' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  actionsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  actionBtn: {
    alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  actionLbl: { fontFamily: 'Inter_500', fontSize: 11, color: 'rgba(255,255,255,0.7)' },
});
