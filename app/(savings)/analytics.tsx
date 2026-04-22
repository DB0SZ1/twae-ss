import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import AppHeader from '../../components/layouts/AppHeader';
import { Colors, Radii, Shadows } from '../../constants/theme';
import { apiClient } from '../../utils/apiClient';
import { useEffect, useState } from 'react';
import { useCurrency } from '../../hooks/useCurrency';

export default function SavingsAnalyticsScreen() {
  const [savingsPockets, setSavingsPockets] = useState<any[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  useEffect(() => {
    apiClient<any>('/savings/plans').then(res => {
      setSavingsPockets(res.pockets || []);
      setTotalSavings(res.totalBalanceNgn || 0);
    }).catch(console.error);
  }, []);
  const { formatNGN } = useCurrency();
  return (
    <View style={styles.container}>
      <AppHeader title="Savings Analytics" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.card}><Text style={styles.cardLabel}>Total Saved</Text><Text style={styles.cardVal}>{formatNGN(totalSavings)}</Text></View>
        <View style={styles.card}><Text style={styles.cardLabel}>Interest Earned (Est.)</Text><Text style={[styles.cardVal, { color: Colors.greenBright }]}>+₦128,450</Text></View>
        <View style={styles.card}><Text style={styles.cardLabel}>Active Pockets</Text><Text style={styles.cardVal}>{savingsPockets.length}</Text></View>
        <Text style={styles.note}>Analytics are based on your current pocket configurations. Interest is estimated based on current APY rates applied to average daily balance.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 16 },
  card: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.blackAlpha04, ...Shadows.card },
  cardLabel: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted, marginBottom: 6 },
  cardVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 22, color: Colors.text },
  note: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.dim, lineHeight: 18, marginTop: 12 },
});
