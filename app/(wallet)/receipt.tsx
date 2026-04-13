/**
 * twae — Receipt Screen
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii, Shadows } from '../../constants/theme';

export default function ReceiptScreen() {
  const router = useRouter();
  const details = [
    { label: 'To', value: 'Emeka Obi · GTBank' },
    { label: 'Amount', value: '₦85,000.00' },
    { label: 'Fee', value: 'Free' },
    { label: 'Date', value: 'Apr 12, 2025 · 10:24 AM' },
    { label: 'Reference', value: 'TWE-A8F3K2L9' },
    { label: 'Status', value: 'Completed ✓' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.checkWrap}>
          <Ionicons name="checkmark" size={32} color="#fff" />
        </View>
        <Text style={styles.title}>Transfer Successful!</Text>

        <View style={styles.card}>
          {details.map((d, i) => (
            <View key={i} style={[styles.row, i < details.length - 1 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{d.label}</Text>
              <Text style={styles.rowValue}>{d.value}</Text>
            </View>
          ))}
        </View>

        <AppButton label="Share Receipt" onPress={() => {}} variant="secondary" icon={<Ionicons name="share-outline" size={16} color={Colors.text} />} />
        <AppButton label="Done" onPress={() => router.replace('/(tabs)')} style={{ marginTop: 10 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg, justifyContent: 'center' },
  content: { padding: 24 },
  checkWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.greenBright, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16, shadowColor: Colors.greenBright, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 6 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 22, color: Colors.text, textAlign: 'center', marginBottom: 24 },
  card: { backgroundColor: Colors.card, borderRadius: 16, borderWidth: 1, borderColor: Colors.blackAlpha05, marginBottom: 24, ...Shadows.card },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.blackAlpha04 },
  rowLabel: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.muted },
  rowValue: { fontFamily: 'BricolageGrotesque_600', fontSize: 13, color: Colors.text, maxWidth: '60%', textAlign: 'right' },
});
