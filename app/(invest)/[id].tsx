/**
 * twae — Asset Detail Screen
 * Live chart, real fundamentals, and Buy/Sell actions
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  Dimensions, TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Polyline, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii, Shadows } from '../../constants/theme';
import { useCurrency } from '../../hooks/useCurrency';
import { fetchAssets } from '../../controllers/investController';
import { fetchChartData, fetchQuote, fetchFundamentals, OHLCVPoint } from '../../controllers/marketController';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - 48;
const CHART_H = 140;
const RANGES = ['1D', '1W', '1M', '1Y'] as const;
type Range = typeof RANGES[number];

function AssetChart({ data, color }: { data: OHLCVPoint[]; color: string }) {
  if (!data || data.length < 2) {
    return (
      <View style={{ height: CHART_H, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.g3} />
      </View>
    );
  }

  const closes = data.map(d => d.c);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  const points = closes.map((c, i) => {
    const x = (i / (closes.length - 1)) * CHART_W;
    const y = CHART_H - ((c - min) / range) * (CHART_H - 16) - 8;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Svg width={CHART_W} height={CHART_H}>
      <Defs>
        <SvgGradient id="aFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.2" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </SvgGradient>
      </Defs>
      <Polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { format } = useCurrency();

  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<OHLCVPoint[]>([]);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [fundamentals, setFundamentals] = useState<any>(null);
  const [chartRange, setChartRange] = useState<Range>('1M');
  const [chartLoading, setChartLoading] = useState(false);

  useEffect(() => {
    fetchAssets().then(assets => {
      const found = assets.find((a: any) => a.id === id);
      setAsset(found);
      setLoading(false);
      if (found?.symbol) {
        loadMarketData(found.symbol, '1M');
      }
    });
  }, [id]);

  const loadMarketData = async (symbol: string, range: string) => {
    setChartLoading(true);
    try {
      const [chart, price, fund] = await Promise.all([
        fetchChartData(symbol, range),
        fetchQuote(symbol),
        fetchFundamentals(symbol),
      ]);
      setChartData(chart);
      if (price) setLivePrice(price);
      if (fund) setFundamentals(fund);
    } catch (e) {
      console.warn('Market data load failed:', e);
    } finally {
      setChartLoading(false);
    }
  };

  const onRangeChange = (r: Range) => {
    setChartRange(r);
    if (asset?.symbol) loadMarketData(asset.symbol, r);
  };

  if (loading) return <View style={styles.container}><ActivityIndicator style={{marginTop: 50}} color={Colors.g3} /></View>;
  if (!asset) return <View style={styles.container}><Text style={{color: 'white', padding: 20}}>Asset not found.</Text></View>;

  const price = livePrice || asset.currentPrice;
  const pctChange = chartData.length >= 2
    ? (((chartData[chartData.length - 1].c - chartData[0].c) / chartData[0].c) * 100)
    : 0;
  const isPositive = pctChange >= 0;
  const changeColor = isPositive ? Colors.greenBright : '#ef4444';

  return (
    <View style={styles.container}>
      <AppHeader title={asset.symbol} />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Price Header */}
        <View style={styles.priceSection}>
          <Text style={styles.assetName}>{asset.name}</Text>
          <Text style={styles.priceVal}>{format(price, asset.currency)}</Text>
          <View style={[styles.changeBadge, !isPositive && styles.changeBadgeDown]}>
            <Text style={[styles.changeText, !isPositive && { color: '#ef4444' }]}>
              {isPositive ? '+' : ''}{pctChange.toFixed(2)}% {chartRange}
            </Text>
          </View>
        </View>

        {/* Live Chart */}
        <View style={styles.chartArea}>
          {chartLoading ? (
            <ActivityIndicator color={Colors.g3} style={{ marginTop: 50 }} />
          ) : (
            <AssetChart data={chartData} color={changeColor} />
          )}
        </View>

        {/* Range Picker */}
        <View style={styles.rangePicker}>
          {RANGES.map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.rangeBtn, chartRange === r && styles.rangeBtnActive]}
              onPress={() => onRangeChange(r)}
            >
              <Text style={[styles.rangeTxt, chartRange === r && styles.rangeTxtActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fundamentals Grid */}
        <View style={styles.infoGrid}>
          {[
            { label: 'Market Cap', val: fundamentals?.market_cap ? `$${(Number(fundamentals.market_cap) / 1e9).toFixed(1)}B` : (asset.riskLevel || '').toUpperCase() },
            { label: 'P/E Ratio', val: fundamentals?.pe_ratio || 'N/A' },
            { label: 'Div Yield', val: fundamentals?.dividend_yield ? `${(Number(fundamentals.dividend_yield) * 100).toFixed(2)}%` : 'N/A' },
            { label: 'Sector', val: fundamentals?.sector || asset.currency },
            { label: '52W High', val: fundamentals?.['52_week_high'] ? `$${Number(fundamentals['52_week_high']).toFixed(2)}` : 'N/A' },
            { label: '52W Low', val: fundamentals?.['52_week_low'] ? `$${Number(fundamentals['52_week_low']).toFixed(2)}` : 'N/A' },
          ].map((item, i) => (
            <View key={i} style={styles.infoItem}>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.infoVal}>{item.val}</Text>
            </View>
          ))}
        </View>

        {/* Buy / Sell */}
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
  priceSection: { alignItems: 'center', marginBottom: 20 },
  assetName: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginBottom: 8 },
  priceVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 32, color: Colors.text },
  changeBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(74,222,128,.1)',
    borderRadius: Radii.pill, paddingVertical: 4, paddingHorizontal: 12, marginTop: 8,
  },
  changeBadgeDown: { backgroundColor: 'rgba(239,68,68,.1)' },
  changeText: { fontFamily: 'Inter_600', fontSize: 12, color: Colors.greenBright },
  chartArea: {
    height: CHART_H, borderRadius: 16, overflow: 'hidden',
    backgroundColor: Colors.surface, marginBottom: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  rangePicker: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 20 },
  rangeBtn: {
    paddingVertical: 6, paddingHorizontal: 16, borderRadius: Radii.pill,
    backgroundColor: 'rgba(255,255,255,.05)',
  },
  rangeBtnActive: { backgroundColor: Colors.g2 },
  rangeTxt: { fontFamily: 'Inter_600', fontSize: 11, color: Colors.dim },
  rangeTxtActive: { color: '#fff' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  infoItem: {
    width: '48%', backgroundColor: Colors.surface, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: Colors.blackAlpha04,
  },
  infoLabel: { fontFamily: 'Inter_400', fontSize: 10, color: Colors.muted, letterSpacing: 0.3, marginBottom: 4 },
  infoVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.text },
  btnRow: { flexDirection: 'row', gap: 12 },
});
