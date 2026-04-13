/**
 * twae — Transfer Confirm Screen
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii, Shadows } from '../../constants/theme';

export default function ConfirmTransferScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const details = [
    { label: 'Recipient', value: 'Emeka Obi' },
    { label: 'Bank', value: 'GTBank' },
    { label: 'Account', value: '0123456789' },
    { label: 'Amount', value: '₦85,000.00' },
    { label: 'Fee', value: '₦0.00' },
  ];

  return (
    <View style={styles.container}>
      <AppHeader title="Confirm Transfer" />
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name="paper-plane" size={28} color={Colors.g3} />
        </View>

        <View style={styles.card}>
          {details.map((d, i) => (
            <View key={i} style={[styles.row, i < details.length - 1 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{d.label}</Text>
              <Text style={styles.rowValue}>{d.value}</Text>
            </View>
          ))}
        </View>

        <AppButton label="Confirm & Send" onPress={() => { setLoading(true); setTimeout(() => { setLoading(false); router.push('/(wallet)/receipt'); }, 2000); }} loading={loading} />
        <AppButton label="Cancel" onPress={() => router.back()} variant="ghost" style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24 },
  iconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(50,100,209,.08)', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 24 },
  card: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.blackAlpha05, marginBottom: 24, ...Shadows.card },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.blackAlpha04 },
  rowLabel: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.muted },
  rowValue: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.text },
});
