/**
 * twae — Invest Screen
 * Portfolio overview with holdings list and live market charts
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Svg, { Polyline, Defs, LinearGradient as SvgGradient, Stop, Rect } from 'react-native-svg';
import { Colors, Fonts, FontSizes, Radii, Shadows, Spacing } from '../../constants/theme';
import { useFocusEffect } from '@react-navigation/native';
import { fetchPortfolio } from '../../controllers/investController';
import { fetchChartData, fetchQuote, fetchFundamentals, OHLCVPoint } from '../../controllers/marketController';
import { useCurrency } from '../../hooks/useCurrency';
import EmptyState from '../../components/molecules/EmptyState';

const { width: SCREEN_W } = Dimensions.get('window');
const CHART_W = SCREEN_W - 64;
const CHART_H = 100;

const RANGES = ['1D', '1W', '1M', '1Y'] as const;
type Range = typeof RANGES[number];

function MiniChart({ data, color = Colors.greenBright }: { data: OHLCVPoint[]; color?: string }) {
  if (!data || data.length < 2) {
    return (
      <View style={{ height: CHART_H, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: Colors.dim, fontSize: 12, fontFamily: 'Inter_400' }}>No data</Text>
      </View>
    );
  }

  const closes = data.map(d => d.c);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  const points = closes.map((c, i) => {
    const x = (i / (closes.length - 1)) * CHART_W;
    const y = CHART_H - ((c - min) / range) * (CHART_H - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Svg width={CHART_W} height={CHART_H}>
      <Defs>
        <SvgGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.25" />
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

export default function InvestScreen() {
  const router = useRouter();
  const { abbreviate, format } = useCurrency();
  const [activeTab, setActiveTab] = useState<'holdings' | 'watchlist'>('holdings');
  const [portfolio, setPortfolio] = useState<any>(null);
  const [marketData, setMarketData] = useState<any>(null);
  const [chartData, setChartData] = useState<OHLCVPoint[]>([]);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [chartRange, setChartRange] = useState<Range>('1M');
  const [isLoadingMarket, setIsLoadingMarket] = useState(false);

  const watchSymbol = 'VOO';

  useFocusEffect(
    useCallback(() => {
      fetchPortfolio().then(data => setPortfolio(data));
      loadMarketOverview(watchSymbol, chartRange);
    }, [])
  );

  const loadMarketOverview = async (symbol: string, range: string) => {
    setIsLoadingMarket(true);
    try {
      const [chart, price, fundamentals] = await Promise.all([
        fetchChartData(symbol, range),
        fetchQuote(symbol),
        fetchFundamentals(symbol),
      ]);
      setChartData(chart);
      setLivePrice(price);
      setMarketData(fundamentals);
    } catch (e) {
      console.log("Failed to load market overview:", e);
    } finally {
      setIsLoadingMarket(false);
    }
  };

  const onRangeChange = (range: Range) => {
    setChartRange(range);
    loadMarketOverview(watchSymbol, range);
  };

  // Compute % change from chart data
  const pctChange = chartData.length >= 2
    ? (((chartData[chartData.length - 1].c - chartData[0].c) / chartData[0].c) * 100)
    : 0;
  const isPositive = pctChange >= 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Section */}
      <LinearGradient
        colors={['#1a3575', '#3264d1', '#001a0d']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={styles.top}
      >
        <Text style={styles.title}>My Portfolio</Text>

        {/* P&L Grid */}
        <View style={styles.pnlGrid}>
          <View style={styles.pnlCard}>
            <Text style={styles.pnlLabel}>TOTAL VALUE</Text>
            <Text style={styles.pnlVal}>{format(portfolio?.totalValueUsd || 0, 'USD')}</Text>
          </View>
          <View style={styles.pnlCard}>
            <Text style={styles.pnlLabel}>TODAY P&L</Text>
            <Text style={[styles.pnlVal, { color: Colors.greenBright }]}>
              +{format(portfolio?.dailyPnlUsd || 0, 'USD')}
            </Text>
          </View>
          <View style={styles.pnlCard}>
            <Text style={styles.pnlLabel}>ALL-TIME</Text>
            <Text style={[styles.pnlVal, { color: Colors.greenBright }]}>
              +{Number(portfolio?.totalPnlPercentage || 0).toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* Holdings / Watchlist Toggle */}
        <View style={styles.toggleWrap}>
          <View style={styles.togglePill}>
            <TouchableOpacity
              style={[styles.toggleTab, activeTab === 'holdings' && styles.toggleTabActive]}
              onPress={() => setActiveTab('holdings')}
            >
              <Text style={[styles.toggleText, activeTab === 'holdings' && styles.toggleTextActive]}>
                Holdings
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleTab, activeTab === 'watchlist' && styles.toggleTabActive]}
              onPress={() => setActiveTab('watchlist')}
            >
              <Text style={[styles.toggleText, activeTab === 'watchlist' && styles.toggleTextActive]}>
                Watchlist
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {activeTab === 'holdings' ? (
          <>
            <View style={styles.secHdr}>
              <Text style={styles.secTitle}>Holdings</Text>
              <TouchableOpacity onPress={() => router.push('/(invest)/portfolio')}>
                <Text style={styles.secLink}>Breakdown</Text>
              </TouchableOpacity>
            </View>

            {(!portfolio?.holdings || portfolio.holdings.length === 0) ? (
              <EmptyState 
                 icon="analytics-outline"
                 title="No holdings yet"
                 message="Your first investment will appear here once a capture executes"
              />
            ) : portfolio.holdings.map((holding: any) => (
              <TouchableOpacity key={holding.id} style={styles.assetRow} onPress={() => router.push(`/(invest)/${holding.asset.id}`)} activeOpacity={0.7}>
                <View style={[styles.assetLogo, { backgroundColor: 'rgba(59,130,246,.06)', borderColor: 'rgba(59,130,246,.1)' }]}>
                  <Text style={[styles.assetSymbol, { color: Colors.blue }]}>{holding.asset.symbol}</Text>
                </View>
                <View style={styles.assetInfo}>
                  <Text style={styles.assetName}>{holding.asset.name}</Text>
                  <Text style={styles.assetUnits}>{holding.units.toFixed(4)} units</Text>
                </View>
                <View style={styles.assetRight}>
                  <Text style={styles.assetPrice}>{format(holding.currentValue, holding.asset.currency)}</Text>
                  <Text style={[styles.assetCh, { color: holding.pnlPercentage >= 0 ? Colors.greenBright : Colors.red }]}>{holding.pnlPercentage >= 0 ? '+' : ''}{Number(holding.pnlPercentage).toFixed(2)}%</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={styles.watchlistContainer}>
            <View style={styles.secHdr}>
              <Text style={styles.secTitle}>Trending on Watchlist</Text>
            </View>

            <View style={styles.chartCard}>
              <View style={styles.chartHdr}>
                <View>
                  <Text style={styles.chartName}>S&P 500 ETF (VOO)</Text>
                  <Text style={styles.chartPrice}>
                    {livePrice ? `$${Number(livePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '...'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.chartCh, { color: isPositive ? Colors.greenBright : '#ef4444' }]}>
                    {isPositive ? '+' : ''}{pctChange.toFixed(2)}% {chartRange}
                  </Text>
                </View>
              </View>

              {/* Live OHLCV Chart */}
              <View style={styles.chartArea}>
                {isLoadingMarket ? (
                  <ActivityIndicator color={Colors.g3} style={{ marginTop: 40 }} />
                ) : (
                  <MiniChart data={chartData} color={isPositive ? Colors.greenBright : '#ef4444'} />
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

              {/* Fundamentals */}
              <View style={styles.chartDetails}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLbl}>Market Cap</Text>
                  <Text style={styles.detailVal}>
                    {marketData?.market_cap ? abbreviate(Number(marketData.market_cap), 'USD') : '...'}
                  </Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLbl}>Div Yield</Text>
                  <Text style={styles.detailVal}>
                    {marketData?.dividend_yield ? (Number(marketData.dividend_yield)*100).toFixed(2) + '%' : '...'}
                  </Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLbl}>P/E Ratio</Text>
                  <Text style={styles.detailVal}>{marketData?.pe_ratio || '...'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  top: {
    paddingTop: 52, paddingHorizontal: 20, paddingBottom: 24,
    borderBottomLeftRadius: 36, borderBottomRightRadius: 36,
  },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: '#fff', marginBottom: 14 },
  pnlGrid: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  pnlCard: {
    flex: 1, backgroundColor: 'rgba(0,0,0,.25)', borderRadius: 14, padding: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,.07)',
  },
  pnlLabel: { fontSize: 9, color: 'rgba(255,255,255,.4)', fontFamily: 'Inter_400', letterSpacing: 0.4, marginBottom: 4 },
  pnlVal: { fontSize: 15, fontFamily: 'BricolageGrotesque_600', color: '#fff' },
  toggleWrap: { alignItems: 'center' },
  togglePill: {
    flexDirection: 'row', backgroundColor: 'rgba(0,0,0,.3)', borderRadius: Radii.pill,
    padding: 4, gap: 2, borderWidth: 1, borderColor: 'rgba(255,255,255,.1)',
  },
  toggleTab: { paddingVertical: 8, paddingHorizontal: 28, borderRadius: Radii.pill },
  toggleTabActive: { backgroundColor: Colors.g2 },
  toggleText: { fontSize: 13, fontFamily: 'BricolageGrotesque_600', color: 'rgba(255,255,255,.5)' },
  toggleTextActive: { color: '#fff' },
  body: { padding: 16, paddingBottom: 120 },
  secHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  secTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: Colors.text },
  secLink: { fontSize: 12, fontFamily: 'Inter_500', color: Colors.gsheen },
  assetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
    backgroundColor: Colors.card, borderRadius: 16, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.blackAlpha05, ...Shadows.card,
  },
  assetLogo: {
    width: 44, height: 44, borderRadius: 13, alignItems: 'center',
    justifyContent: 'center', borderWidth: 1,
  },
  assetSymbol: { fontSize: 11, fontFamily: 'BricolageGrotesque_600', letterSpacing: 0.5 },
  assetInfo: { flex: 1 },
  assetName: { fontSize: 14, fontFamily: 'BricolageGrotesque_600', color: Colors.text },
  assetUnits: { fontSize: 11, fontFamily: 'Inter_400', color: Colors.dim, marginTop: 2 },
  assetRight: { alignItems: 'flex-end' },
  assetPrice: { fontSize: 14, fontFamily: 'BricolageGrotesque_600', color: Colors.text },
  assetCh: { fontSize: 12, fontFamily: 'Inter_600', marginTop: 2 },
  watchlistContainer: { marginTop: 10 },
  chartCard: {
    backgroundColor: Colors.card, borderRadius: 20, borderWidth: 1,
    borderColor: Colors.blackAlpha04, padding: 16, ...Shadows.card,
  },
  chartHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chartName: { fontFamily: 'BricolageGrotesque_600', fontSize: 14 },
  chartPrice: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, marginTop: 4 },
  chartCh: { fontFamily: 'Inter_600', fontSize: 12 },
  chartArea: {
    height: CHART_H, borderRadius: 12, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  rangePicker: {
    flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 16,
  },
  rangeBtn: {
    paddingVertical: 6, paddingHorizontal: 16, borderRadius: Radii.pill,
    backgroundColor: 'rgba(255,255,255,.05)',
  },
  rangeBtnActive: { backgroundColor: Colors.g2 },
  rangeTxt: { fontFamily: 'Inter_600', fontSize: 11, color: Colors.dim },
  rangeTxtActive: { color: '#fff' },
  chartDetails: {
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderColor: Colors.blackAlpha04, paddingTop: 16,
  },
  detailCol: { alignItems: 'center' },
  detailLbl: { fontFamily: 'Inter_400', fontSize: 10, color: Colors.muted },
  detailVal: { fontFamily: 'Inter_500', fontSize: 13, color: Colors.text, marginTop: 4 },
});
