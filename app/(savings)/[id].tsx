/**
 * twae — Pocket Detail Screen
 */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii, Shadows } from '../../constants/theme';
import { savingsPockets } from '../../constants/mockData';
import { useCurrency } from '../../hooks/useCurrency';

export default function PocketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { formatNGN } = useCurrency();
  const pocket = savingsPockets.find(p => p.id === id) || savingsPockets[0];
  const progress = pocket.currentAmount / pocket.targetAmount;

  return (
    <View style={styles.container}>
      <AppHeader title={`${pocket.emoji} ${pocket.name}`} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <LinearGradient colors={[Colors.g1, Colors.g2]} style={styles.card}>
          <Text style={styles.cardLabel}>SAVED</Text>
          <Text style={styles.cardVal}>{formatNGN(pocket.currentAmount)}</Text>
          <View style={styles.progBarOuter}>
            <View style={[styles.progBarInner, { width: `${Math.round(progress * 100)}%` as any }]} />
          </View>
          <Text style={styles.progText}>{Math.round(progress * 100)}% of {formatNGN(pocket.targetAmount)}</Text>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statVal}>{pocket.interestRate}%</Text><Text style={styles.statLabel}>APY</Text></View>
          <View style={styles.statItem}><Text style={styles.statVal}>{pocket.maturityDate}</Text><Text style={styles.statLabel}>Maturity</Text></View>
          <View style={styles.statItem}><Text style={styles.statVal}>{pocket.currency}</Text><Text style={styles.statLabel}>Currency</Text></View>
        </View>

        {pocket.autoSave && (
          <View style={styles.autoSaveCard}>
            <Text style={styles.autoTitle}>Auto-Save Active</Text>
            <Text style={styles.autoDetail}>{formatNGN(pocket.autoSave.amount)} · {pocket.autoSave.frequency}</Text>
            <Text style={styles.autoNext}>Next: {pocket.autoSave.nextDate}</Text>
          </View>
        )}

        <View style={styles.btnRow}>
          <AppButton label="Fund Pocket" onPress={() => router.push('/(savings)/fund')} style={{ flex: 1 }} />
          <AppButton label="Withdraw" onPress={() => router.push('/(savings)/withdraw')} variant="secondary" style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 16 },
  card: { borderRadius: Radii.card, padding: 24, marginBottom: 20, ...Shadows.cardLg },
  cardLabel: { fontSize: 10, color: 'rgba(255,255,255,.5)', fontFamily: 'Inter_400', letterSpacing: 0.6, marginBottom: 4 },
  cardVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 28, color: '#fff', marginBottom: 16 },
  progBarOuter: { height: 6, backgroundColor: 'rgba(255,255,255,.15)', borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  progBarInner: { height: '100%', backgroundColor: Colors.greenBright, borderRadius: 3 },
  progText: { fontSize: 12, fontFamily: 'Inter_400', color: 'rgba(255,255,255,.6)' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statItem: { flex: 1, backgroundColor: Colors.surface, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.blackAlpha04 },
  statVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: Colors.text },
  statLabel: { fontFamily: 'Inter_400', fontSize: 10, color: Colors.muted, marginTop: 2 },
  autoSaveCard: { backgroundColor: 'rgba(50,100,209,.04)', borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(50,100,209,.08)' },
  autoTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.text, marginBottom: 4 },
  autoDetail: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.muted },
  autoNext: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.dim, marginTop: 4 },
  btnRow: { flexDirection: 'row', gap: 12 },
});
