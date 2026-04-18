/**
 * twae — Asset Detail Screen
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii, Shadows } from '../../constants/theme';
import { useCurrency } from '../../hooks/useCurrency';
import { fetchAssets } from '../../controllers/investController';

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { format } = useCurrency();
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssets().then(assets => {
      const found = assets.find((a: any) => a.id === id);
      setAsset(found);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <View style={styles.container}><ActivityIndicator style={{marginTop: 50}} color={Colors.g3} /></View>;
  if (!asset) return <View style={styles.container}><Text style={{color: 'white', padding: 20}}>Asset not found.</Text></View>;

  const price = asset.currentPrice;
  const change = 0.45; // Real backend doesn't track historical changes yet short of live oracle integration
  const symbol = asset.symbol;
  const name = asset.name;

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
          {[
            { label: 'Risk Level', val: (asset.riskLevel || '').toUpperCase() },
            { label: 'Type', val: (asset.type || '').toUpperCase() },
            { label: 'Currency', val: asset.currency },
            { label: 'Status', val: asset.isActive ? 'Active' : 'Hidden' },
          ].map((item, i) => (
            <View key={i} style={styles.infoItem}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoVal}>{item.val}</Text>
            </View>
          ))}
        </View>

        <View style={styles.btnRow}>
          <AppButton label="Buy" onPress={() => router.push({ pathname: '/(invest)/buy', params: { id: asset.id } })} style={{ flex: 1 }} />
          <AppButton label="Sell" onPress={() => router.push({ pathname: '/(invest)/sell', params: { id: asset.id } })} variant="secondary" style={{ flex: 1 }} />
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
