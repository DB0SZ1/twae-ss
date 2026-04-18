/**
 * twae — Pocket Detail Screen
 */
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii, Shadows } from '../../constants/theme';
import { useCurrency } from '../../hooks/useCurrency';
import { getPocketDetail, SavingsPocket } from '../../controllers/savingsController';

export default function PocketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { formatNGN, formatUSD } = useCurrency();
  const [pocket, setPocket] = useState<SavingsPocket | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      const load = async () => {
        try {
          const res = await getPocketDetail(id);
          if (active) setPocket(res);
        } catch (e) {
          console.error(e);
        } finally {
          if (active) setLoading(false);
        }
      };
      load();
      return () => { active = false; };
    }, [id])
  );

  if (loading || !pocket) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.g2} />
      </View>
    );
  }

  const tgt = pocket.targetAmount || 0;
  const progress = tgt > 0 ? pocket.currentAmount / tgt : 0;
  const formatAmt = pocket.currency === 'USD' ? formatUSD : formatNGN;

  return (
    <View style={styles.container}>
      <AppHeader title={`${pocket.emoji} ${pocket.name}`} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <LinearGradient colors={[Colors.g1, Colors.g2]} style={styles.card}>
          <Text style={styles.cardLabel}>SAVED</Text>
          <Text style={styles.cardVal}>{formatAmt(pocket.currentAmount)}</Text>
          {tgt > 0 && (
            <>
              <View style={styles.progBarOuter}>
                <View style={[styles.progBarInner, { width: `${Math.min(100, Math.round(progress * 100))}%` as any }]} />
              </View>
              <Text style={styles.progText}>{Math.round(progress * 100)}% of {formatAmt(pocket.targetAmount || 0)}</Text>
            </>
          )}
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statVal}>{pocket.interestRatePct}%</Text><Text style={styles.statLabel}>APY</Text></View>
          <View style={styles.statItem}><Text style={styles.statVal}>{pocket.targetDate || 'None'}</Text><Text style={styles.statLabel}>{pocket.isMatured ? 'Matured' : 'Target Date'}</Text></View>
          <View style={styles.statItem}><Text style={styles.statVal}>{pocket.currency}</Text><Text style={styles.statLabel}>Currency</Text></View>
        </View>

        {pocket.autoSaveEnabled && (
          <View style={styles.autoSaveCard}>
            <Text style={styles.autoTitle}>Auto-Save Active</Text>
            <Text style={styles.autoDetail}>{formatAmt(pocket.autoSaveAmount || 0)} · {pocket.autoSaveFrequency}</Text>
            <Text style={styles.autoNext}>Next: {pocket.nextDebitDate || 'Pending'}</Text>
          </View>
        )}

        <View style={styles.btnRow}>
          <AppButton label="Fund Pocket" onPress={() => router.push({ pathname: '/(savings)/fund', params: { id: pocket.id } })} style={{ flex: 1 }} />
          <AppButton label="Withdraw" onPress={() => router.push({ pathname: '/(savings)/withdraw', params: { id: pocket.id } })} variant="secondary" style={{ flex: 1 }} />
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
