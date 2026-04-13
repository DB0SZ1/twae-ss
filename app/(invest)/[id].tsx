/**
 * twae — Asset Detail Screen
 */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii, Shadows } from '../../constants/theme';
import { marketAssets, investmentHoldings } from '../../constants/mockData';
import { useCurrency } from '../../hooks/useCurrency';

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { format } = useCurrency();
  const asset = marketAssets.find(a => a.id === id) || investmentHoldings.find(h => h.id === id);
  if (!asset) return null;

  const isMarket = 'type' in asset;
  const price = isMarket ? asset.price : asset.currentPrice;
  const change = asset.changePercent;
  const symbol = isMarket ? asset.symbol : asset.symbol;
  const name = isMarket ? asset.name : asset.name;

  return (
    <View style={styles.container}>
      <AppHeader title={symbol} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.priceSection}>
          <Text style={styles.assetName}>{name}</Text>
          <Text style={styles.priceVal}>{format(price, asset.currency)}</Text>
          <View style={[styles.changeBadge, change < 0 && styles.changeBadgeDown]}>
            <Text style={[styles.changeText, change < 0 && { color: Colors.red }]}>
              {change >= 0 ? '+' : ''}{change}% today
            </Text>
          </View>
        </View>

        {/* Chart placeholder */}
        <View style={styles.chartArea}>
          <LinearGradient colors={['rgba(50,100,209,.1)', 'rgba(50,100,209,0)']} style={StyleSheet.absoluteFill} />
          <View style={styles.chartLine} />
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          {isMarket && [
            { label: 'Market Cap', val: (asset as any).marketCap || '—' },
            { label: 'Volume', val: (asset as any).volume || '—' },
            { label: 'Exchange', val: asset.exchange },
            { label: 'Type', val: (asset as any).type },
          ].map((item, i) => (
            <View key={i} style={styles.infoItem}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoVal}>{item.val}</Text>
            </View>
          ))}
        </View>

        <View style={styles.btnRow}>
          <AppButton label="Buy" onPress={() => router.push('/(invest)/buy')} style={{ flex: 1 }} />
          <AppButton label="Sell" onPress={() => router.push('/(invest)/sell')} variant="secondary" style={{ flex: 1 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 16 },
  priceSection: { alignItems: 'center', marginBottom: 24 },
  assetName: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginBottom: 8 },
  priceVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 32, color: Colors.text },
  changeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(74,222,128,.1)', borderRadius: Radii.pill, paddingVertical: 4, paddingHorizontal: 12, marginTop: 8 },
  changeBadgeDown: { backgroundColor: 'rgba(239,68,68,.1)' },
  changeText: { fontFamily: 'Inter_600', fontSize: 12, color: Colors.greenBright },
  chartArea: { height: 120, borderRadius: 16, overflow: 'hidden', backgroundColor: Colors.surface, marginBottom: 24, position: 'relative' },
  chartLine: { position: 'absolute', top: '40%', left: 0, right: 0, height: 2.5, backgroundColor: Colors.g2, borderRadius: 2, transform: [{ rotate: '-3deg' }] },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  infoItem: { width: '48%', backgroundColor: Colors.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: Colors.blackAlpha04 },
  infoLabel: { fontFamily: 'Inter_400', fontSize: 10, color: Colors.muted, letterSpacing: 0.3, marginBottom: 4 },
  infoVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.text },
  btnRow: { flexDirection: 'row', gap: 12 },
});
