import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import AppHeader from '../../components/layouts/AppHeader';
import { Colors, Shadows } from '../../constants/theme';
import { investmentHoldings, portfolioTotal, portfolioPnLAllTime } from '../../constants/mockData';
import { useCurrency } from '../../hooks/useCurrency';

export default function PortfolioBreakdownScreen() {
  const { format, abbreviate } = useCurrency();
  return (
    <View style={styles.container}>
      <AppHeader title="Portfolio Breakdown" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAL VALUE</Text>
          <Text style={styles.totalVal}>{abbreviate(portfolioTotal, 'NGN')}</Text>
          <Text style={styles.totalCh}>+{portfolioPnLAllTime}% all-time</Text>
        </View>
        {investmentHoldings.map(h => {
          const pct = h.currency === 'NGN' ? ((h.totalValue / portfolioTotal) * 100).toFixed(1) : '—';
          return (
            <View key={h.id} style={styles.row}>
              <View style={styles.rowInfo}><Text style={styles.rowName}>{h.symbol}</Text><Text style={styles.rowSub}>{h.name}</Text></View>
              <View style={styles.rowRight}><Text style={styles.rowVal}>{format(h.totalValue, h.currency)}</Text><Text style={styles.rowPct}>{pct}%</Text></View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 16 },
  totalCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 20, marginBottom: 20, alignItems: 'center', ...Shadows.card },
  totalLabel: { fontSize: 10, fontFamily: 'Inter_400', color: Colors.muted, letterSpacing: 0.4 },
  totalVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 28, color: Colors.text, marginVertical: 4 },
  totalCh: { fontFamily: 'Inter_600', fontSize: 13, color: Colors.greenBright },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 14, backgroundColor: Colors.card, borderRadius: 14, marginBottom: 8, borderWidth: 1, borderColor: Colors.blackAlpha05 },
  rowInfo: {},
  rowName: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.text },
  rowSub: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.dim, marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  rowVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.text },
  rowPct: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.muted, marginTop: 2 },
});
