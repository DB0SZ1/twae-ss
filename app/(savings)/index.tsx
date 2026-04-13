/**
 * twae — Savings Home Screen
 */
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import { Colors, Radii, Shadows, Spacing } from '../../constants/theme';
import { savingsPockets, totalSavings } from '../../constants/mockData';
import { useCurrency } from '../../hooks/useCurrency';

export default function SavingsHomeScreen() {
  const router = useRouter();
  const { formatNGN, abbreviate } = useCurrency();

  return (
    <View style={styles.container}>
      <AppHeader title="Savings" rightAction={
        <TouchableOpacity onPress={() => router.push('/(savings)/analytics')}>
          <Ionicons name="stats-chart" size={20} color={Colors.text} />
        </TouchableOpacity>
      } />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Total Card */}
        <LinearGradient colors={[Colors.gold1, '#8a6508']} style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAL SAVINGS</Text>
          <Text style={styles.totalVal}>{formatNGN(totalSavings)}</Text>
          <Text style={styles.totalSub}>{savingsPockets.length} active pockets</Text>
        </LinearGradient>

        <View style={styles.secHdr}>
          <Text style={styles.secTitle}>My Pockets</Text>
          <TouchableOpacity onPress={() => router.push('/(savings)/create-pocket')}>
            <Text style={styles.secLink}>+ New Pocket</Text>
          </TouchableOpacity>
        </View>

        {savingsPockets.map(pocket => {
          const progress = pocket.currentAmount / pocket.targetAmount;
          return (
            <TouchableOpacity key={pocket.id} style={styles.pocketItem} onPress={() => router.push(`/(savings)/${pocket.id}`)} activeOpacity={0.7}>
              <View style={styles.pocketHeader}>
                <Text style={styles.pocketName}>{pocket.emoji} {pocket.name}</Text>
                <Text style={styles.pocketAmt}>{abbreviate(pocket.currentAmount, pocket.currency)}</Text>
              </View>
              <View style={styles.progressBar}>
                <LinearGradient colors={[Colors.g2, Colors.gsheen]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` as any }]} />
              </View>
              <View style={styles.pocketMeta}>
                <Text style={styles.metaText}>{Math.round(progress * 100)}% of {abbreviate(pocket.targetAmount, pocket.currency)}</Text>
                <Text style={styles.metaText}>{pocket.interestRate}% APY</Text>
              </View>
              {pocket.autoSave && (
                <View style={styles.autoSaveTag}>
                  <Ionicons name="repeat" size={10} color={Colors.gsheen} />
                  <Text style={styles.autoSaveText}>Auto-save: {formatNGN(pocket.autoSave.amount)} {pocket.autoSave.frequency}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 16, paddingBottom: 40 },
  totalCard: { borderRadius: Radii.card, padding: 24, marginBottom: 24, ...Shadows.cardLg },
  totalLabel: { fontSize: 10, color: 'rgba(255,255,255,.6)', fontFamily: 'Inter_400', letterSpacing: 0.8, marginBottom: 6 },
  totalVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 28, color: '#fff', letterSpacing: -1 },
  totalSub: { fontSize: 12, fontFamily: 'Inter_400', color: 'rgba(255,255,255,.5)', marginTop: 4 },
  secHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  secTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: Colors.text },
  secLink: { fontSize: 12, fontFamily: 'Inter_500', color: Colors.gsheen },
  pocketItem: { backgroundColor: Colors.surface, borderRadius: 16, borderWidth: 1, borderColor: Colors.blackAlpha04, padding: 14, marginBottom: 10, ...Shadows.card },
  pocketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  pocketName: { fontSize: 14, fontFamily: 'BricolageGrotesque_600', color: Colors.text },
  pocketAmt: { fontSize: 14, fontFamily: 'BricolageGrotesque_600', color: Colors.g3 },
  progressBar: { height: 5, backgroundColor: Colors.blackAlpha05, borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 5 },
  pocketMeta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 11, fontFamily: 'Inter_400', color: Colors.muted },
  autoSaveTag: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.blackAlpha04 },
  autoSaveText: { fontSize: 10, fontFamily: 'Inter_400', color: Colors.muted },
});
