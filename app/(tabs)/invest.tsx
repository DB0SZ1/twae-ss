/**
 * twae — Invest Screen
 * Portfolio overview with holdings list
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Fonts, FontSizes, Radii, Shadows, Spacing } from '../../constants/theme';
import {
  investmentHoldings,
  portfolioPnLToday,
  portfolioPnLAllTime,
  portfolioTotal,
} from '../../constants/mockData';
import { useCurrency } from '../../hooks/useCurrency';

export default function InvestScreen() {
  const router = useRouter();
  const { abbreviate, format } = useCurrency();
  const [activeTab, setActiveTab] = useState<'holdings' | 'watchlist'>('holdings');

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
            <Text style={styles.pnlVal}>{abbreviate(portfolioTotal, 'NGN')}</Text>
          </View>
          <View style={styles.pnlCard}>
            <Text style={styles.pnlLabel}>TODAY P&L</Text>
            <Text style={[styles.pnlVal, { color: Colors.greenBright }]}>
              +{abbreviate(portfolioPnLToday, 'NGN')}
            </Text>
          </View>
          <View style={styles.pnlCard}>
            <Text style={styles.pnlLabel}>ALL-TIME</Text>
            <Text style={[styles.pnlVal, { color: Colors.greenBright }]}>
              +{portfolioPnLAllTime}%
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

            {investmentHoldings.map(holding => (
              <TouchableOpacity key={holding.id} style={styles.assetRow} onPress={() => router.push(`/(invest)/${holding.id}`)} activeOpacity={0.7}>
                <View style={[styles.assetLogo, { backgroundColor: holding.currency === 'NGN' ? 'rgba(50,100,209,.06)' : 'rgba(59,130,246,.06)', borderColor: holding.currency === 'NGN' ? 'rgba(50,100,209,.1)' : 'rgba(59,130,246,.1)' }]}>
                  <Text style={[styles.assetSymbol, { color: holding.currency === 'NGN' ? Colors.g2 : Colors.blue }]}>{holding.symbol}</Text>
                </View>
                <View style={styles.assetInfo}>
                  <Text style={styles.assetName}>{holding.name}</Text>
                  <Text style={styles.assetUnits}>{holding.units} units · {holding.exchange}</Text>
                </View>
                <View style={styles.assetRight}>
                  <Text style={styles.assetPrice}>{format(holding.totalValue, holding.currency)}</Text>
                  <Text style={[styles.assetCh, { color: holding.changePercent >= 0 ? Colors.greenBright : Colors.red }]}>{holding.changePercent >= 0 ? '+' : ''}{holding.changePercent}%</Text>
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
                  <Text style={styles.chartPrice}>$482.10</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.chartCh, { color: Colors.greenBright }]}>+1.45% Today</Text>
                </View>
              </View>
              
              <View style={styles.chartArea}>
                <LinearGradient colors={['rgba(74,222,128,.15)', 'rgba(74,222,128,0)']} style={styles.chartGradient} />
                <View style={styles.chartLine} />
              </View>
              
              <View style={styles.chartDetails}>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLbl}>Market Cap</Text>
                  <Text style={styles.detailVal}>$1.3T</Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLbl}>Volume</Text>
                  <Text style={styles.detailVal}>8.9M</Text>
                </View>
                <View style={styles.detailCol}>
                  <Text style={styles.detailLbl}>P/E Ratio</Text>
                  <Text style={styles.detailVal}>26.4</Text>
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
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  top: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  title: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 24,
    color: '#fff',
    marginBottom: 14,
  },
  pnlGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  pnlCard: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.25)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.07)',
  },
  pnlLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,.4)',
    fontFamily: 'Inter_400',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  pnlVal: {
    fontSize: 15,
    fontFamily: 'BricolageGrotesque_600',
    color: '#fff',
  },
  toggleWrap: {
    alignItems: 'center',
  },
  togglePill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,.3)',
    borderRadius: Radii.pill,
    padding: 4,
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.1)',
  },
  toggleTab: {
    paddingVertical: 8,
    paddingHorizontal: 28,
    borderRadius: Radii.pill,
  },
  toggleTabActive: {
    backgroundColor: Colors.g2,
  },
  toggleText: {
    fontSize: 13,
    fontFamily: 'BricolageGrotesque_600',
    color: 'rgba(255,255,255,.5)',
  },
  toggleTextActive: {
    color: '#fff',
  },
  body: {
    padding: 16,
    paddingBottom: 120,
  },
  secHdr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  secTitle: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 16,
    color: Colors.text,
  },
  secLink: {
    fontSize: 12,
    fontFamily: 'Inter_500',
    color: Colors.gsheen,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.blackAlpha05,
    ...Shadows.card,
  },
  assetLogo: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  assetSymbol: {
    fontSize: 11,
    fontFamily: 'BricolageGrotesque_600',
    letterSpacing: 0.5,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 14,
    fontFamily: 'BricolageGrotesque_600',
    color: Colors.text,
  },
  assetUnits: {
    fontSize: 11,
    fontFamily: 'Inter_400',
    color: Colors.dim,
    marginTop: 2,
  },
  assetRight: {
    alignItems: 'flex-end',
  },
  assetPrice: {
    fontSize: 14,
    fontFamily: 'BricolageGrotesque_600',
    color: Colors.text,
  },
  assetCh: {
    fontSize: 12,
    fontFamily: 'Inter_600',
    marginTop: 2,
  },
  watchlistContainer: {
    marginTop: 10,
  },
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.blackAlpha04,
    padding: 16,
    ...Shadows.card,
  },
  chartHdr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartName: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 14,
  },
  chartPrice: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 18,
    marginTop: 4,
  },
  chartArea: {
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 16,
  },
  chartGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  chartLine: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: Colors.greenBright,
    borderRadius: 2,
    transform: [{ rotate: '-8deg' }],
  },
  chartDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: Colors.blackAlpha04,
    paddingTop: 16,
  },
  detailCol: {
    alignItems: 'center',
  },
  detailLbl: {
    fontFamily: 'Inter_400',
    fontSize: 10,
    color: Colors.muted,
  },
  detailVal: {
    fontFamily: 'Inter_500',
    fontSize: 13,
    color: Colors.text,
    marginTop: 4,
  },
});
