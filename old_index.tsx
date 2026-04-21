/**
 * twae — Home / Dashboard
 * Main hub — balances, quick actions, recent activity
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import TransactionRow from '../../components/molecules/TransactionRow';
import { Colors, Fonts, FontSizes, Radii, Spacing, Shadows } from '../../constants/theme';
import {
  currentUser,
  walletBalances,
  portfolioTotal,
  portfolioChange,
  transactions,
  savingsPockets,
  totalSavings,
} from '../../constants/mockData';
import { useCurrency } from '../../hooks/useCurrency';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { formatNGN, formatUSD, abbreviate } = useCurrency();
  const [activeTab, setActiveTab] = useState<'stocks' | 'savings'>('stocks');
  const [balanceHidden, setBalanceHidden] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const ngnWallet = walletBalances[0];
  const usdWallet = walletBalances[1];

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const quickActions = [
    { label: 'Send', icon: 'paper-plane', color: Colors.g2, bg: 'rgba(50,100,209,.1)', border: 'rgba(50,100,209,.15)' },
    { label: 'Save', icon: 'wallet', color: Colors.gold1, bg: 'rgba(212,160,23,.1)', border: 'rgba(212,160,23,.15)' },
    { label: 'Invest', icon: 'trending-up', color: Colors.g2, bg: 'rgba(50,100,209,.1)', border: 'rgba(50,100,209,.15)' },
    { label: 'Add', icon: 'add-circle', color: Colors.gold1, bg: 'rgba(180,130,0,.2)', border: 'rgba(240,192,64,.2)' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* ── Top Section (Blue Gradient) ── */}
        <LinearGradient
          colors={['#1a3575', '#3264d1', '#000c26']}
          start={{ x: 0.3, y: 0 }}
          end={{ x: 0.7, y: 1 }}
          style={styles.dashTop}
        >
          {/* Decorative circles */}
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />

          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.greetingPill}>
              <LinearGradient
                colors={[Colors.gold2, Colors.goldsheen]}
                style={styles.gpillAvatar}
              >
                <Text style={styles.gpillInitials}>{currentUser.initials}</Text>
              </LinearGradient>
              <View>
                <Text style={styles.gpillHi}>Good morning,</Text>
                <Text style={styles.gpillName}>{currentUser.firstName} ✦</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications" size={18} color="rgba(255,255,255,.75)" />
            </TouchableOpacity>
          </View>

          {/* Portfolio Value */}
          <View style={styles.portfolioArea}>
            <Text style={styles.portLabel}>TOTAL PORTFOLIO</Text>
            <Text style={styles.portVal}>
              {balanceHidden ? '••••••••' : formatNGN(portfolioTotal)}
            </Text>
            <View style={[styles.portBadge, portfolioChange < 0 && styles.portBadgeDown]}>
              <Ionicons
                name={portfolioChange >= 0 ? 'trending-up' : 'trending-down'}
                size={12}
                color={portfolioChange >= 0 ? Colors.greenBright : Colors.red}
              />
              <Text style={[styles.portBadgeText, portfolioChange < 0 && { color: Colors.red }]}>
                {portfolioChange >= 0 ? '+' : ''}{portfolioChange}% today
              </Text>
            </View>
          </View>

          {/* Tab Pills */}
          <View style={styles.pillTabsWrap}>
            <View style={styles.dashGlassPill}>
              <TouchableOpacity
                style={[styles.dgTab, activeTab === 'stocks' && styles.dgTabActive]}
                onPress={() => setActiveTab('stocks')}
              >
                <Text style={[styles.dgTabText, activeTab === 'stocks' && styles.dgTabTextActive]}>
                  Stocks
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dgTab, activeTab === 'savings' && styles.dgTabActive]}
                onPress={() => setActiveTab('savings')}
              >
                <Text style={[styles.dgTabText, activeTab === 'savings' && styles.dgTabTextActive]}>
                  Savings
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* ── Stocks View ── */}
        {activeTab === 'stocks' && (
          <>
            {/* Wallet Card */}
            <View style={styles.cardSection}>
              <LinearGradient
                colors={['#1a3575', '#4a7aff', '#3264d1']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.walletCard}
              >
                {/* Card Pattern */}
                <View style={styles.cardPatternWrap}>
                  <View style={styles.patternCircle1} />
                  <View style={styles.patternCircle2} />
                </View>

                <View style={styles.cardTopRow}>
                  <View style={styles.cardFlagWrap}>
                    <Text style={styles.cardFlag}>🇳🇬</Text>
                    <Text style={styles.cardCurrName}>{ngnWallet.label}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.cardEyeBtn}
                    onPress={() => setBalanceHidden(!balanceHidden)}
                  >
                    <Ionicons
                      name={balanceHidden ? 'eye-off' : 'eye'}
                      size={14}
                      color="rgba(255,255,255,.7)"
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.cardBalLabel}>AVAILABLE BALANCE</Text>
                <Text style={styles.cardBal}>
                  {balanceHidden ? '••••••••' : formatNGN(ngnWallet.amount)}
                </Text>
                <Text style={styles.cardAcct}>{ngnWallet.accountNumber} · {ngnWallet.bankName}</Text>

                {/* Mini Stats */}
                <View style={styles.cardMini}>
                  <View>
                    <Text style={styles.cmLabel}>24H CHANGE</Text>
                    <Text style={[styles.cmChange, { color: Colors.greenBright }]}>+₦465,200</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.cmLabel}>LIVE RATE</Text>
                    <Text style={styles.cmRate}>$1 = ₦1,560.50</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsSection}>
              <Text style={styles.qaLabel}>QUICK ACTIONS</Text>
              <View style={styles.qaRow}>
                {quickActions.map((qa, i) => (
                  <TouchableOpacity
                    key={i}
                    style={styles.qaBtn}
                    onPress={() => {
                      if (qa.label === 'Send') router.push('/(wallet)/send');
                      else if (qa.label === 'Save') router.push('/(savings)');
                      else if (qa.label === 'Invest') router.push('/(invest)/discovery');
                      else if (qa.label === 'Add') router.push('/(wallet)/add-money');
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.qaIcon, { backgroundColor: qa.bg, borderColor: qa.border }]}>
                      <Ionicons name={qa.icon as any} size={20} color={qa.color} />
                    </View>
                    <Text style={styles.qaLbl}>{qa.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Stock Chart */}
            <View style={styles.chartContainer}>
              <View style={styles.chartHdr}>
                <View>
                  <Text style={styles.chartName}>Dangote Cement (DANGCEM)</Text>
                  <Text style={styles.chartPrice}>₦1,240.50</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.chartCh, { color: Colors.greenBright }]}>+4.28% Today</Text>
                </View>
              </View>
              {/* Simplified chart visualization */}
              <View style={styles.chartArea}>
                <LinearGradient
                  colors={['rgba(50,100,209,.15)', 'rgba(50,100,209,0)']}
                  style={styles.chartGradient}
                />
                <View style={styles.chartLine} />
              </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.txnSection}>
              <View style={styles.secHdr}>
                <Text style={styles.secTitle}>Recent Activity</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
                  <Text style={styles.secLink}>🇳🇬 NGN</Text>
                </TouchableOpacity>
              </View>
              {transactions.slice(0, 3).map(txn => (
                <TransactionRow
                  key={txn.id}
                  transaction={txn}
                  onPress={() => {}}
                />
              ))}
            </View>
          </>
        )}

        {/* ── Savings View ── */}
        {activeTab === 'savings' && (
          <>
            {/* Savings Card */}
            <View style={styles.cardSection}>
              <LinearGradient
                colors={[Colors.gold1, '#8a6508']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.walletCard, { shadowColor: Colors.gold1 }]}
              >
                <View style={styles.cardPatternWrap}>
                  <View style={styles.patternCircle1} />
                  <View style={styles.patternCircle2} />
                </View>

                <View style={styles.cardTopRow}>
                  <View style={styles.cardFlagWrap}>
                    <Ionicons name="wallet" size={16} color="#fff" />
                    <Text style={[styles.cardCurrName, { color: '#fff' }]}>Total Savings</Text>
                  </View>
                </View>

                <Text style={[styles.cardBalLabel, { color: 'rgba(255,255,255,0.7)' }]}>
                  AMOUNT SAVED
                </Text>
                <Text style={styles.cardBal}>{formatNGN(totalSavings)}</Text>
              </LinearGradient>
            </View>

            {/* Pockets */}
            <View style={styles.actionsSection}>
              <View style={styles.secHdr}>
                <Text style={styles.secTitle}>My Pockets</Text>
                <TouchableOpacity onPress={() => router.push('/(savings)/create-pocket')}>
                  <Text style={styles.secLink}>+ New Pocket</Text>
                </TouchableOpacity>
              </View>
              {savingsPockets.map(pocket => {
                const progress = pocket.currentAmount / pocket.targetAmount;
                return (
                  <TouchableOpacity
                    key={pocket.id}
                    style={styles.pocketItem}
                    onPress={() => router.push(`/(savings)/${pocket.id}`)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.pocketHeader}>
                      <Text style={styles.pocketName}>
                        {pocket.emoji} {pocket.name}
                      </Text>
                      <Text style={styles.pocketAmt}>
                        {abbreviate(pocket.currentAmount, pocket.currency)}
                      </Text>
                    </View>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={pocket.name === 'Travel Fund' ? [Colors.gold1, Colors.gold2] : [Colors.g2, Colors.gsheen]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%` as any }]}
                      />
                    </View>
                    <View style={styles.pocketMeta}>
                      <Text style={styles.pocketMetaText}>
                        {Math.round(progress * 100)}% of {abbreviate(pocket.targetAmount, pocket.currency)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
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
  // ── Dash Top ──
  dashTop: {
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  decoCircle1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(50,100,209,.15)',
  },
  decoCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(212,160,23,.1)',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 52,
    marginBottom: 20,
  },
  greetingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,.08)',
    borderRadius: Radii.pill,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.1)',
  },
  gpillAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpillInitials: {
    fontSize: 12,
    fontFamily: 'BricolageGrotesque_600',
    color: Colors.g1,
  },
  gpillHi: {
    fontSize: 10,
    color: 'rgba(255,255,255,.55)',
    fontFamily: 'Inter_400',
  },
  gpillName: {
    fontSize: 13,
    fontFamily: 'BricolageGrotesque_600',
    color: '#fff',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Portfolio ──
  portfolioArea: {
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 20,
  },
  portLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,.5)',
    letterSpacing: 0.8,
    fontFamily: 'Inter_400',
    marginBottom: 6,
  },
  portVal: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 34,
    color: '#fff',
    letterSpacing: -1,
  },
  portBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(74,222,128,.12)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,128,.2)',
    borderRadius: Radii.pill,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  portBadgeDown: {
    backgroundColor: 'rgba(255,95,95,.1)',
    borderColor: 'rgba(255,95,95,.2)',
  },
  portBadgeText: {
    fontSize: 12,
    fontFamily: 'Inter_500',
    color: Colors.greenBright,
  },
  // ── Tab Pills ──
  pillTabsWrap: {
    alignItems: 'center',
  },
  dashGlassPill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,.3)',
    borderRadius: Radii.pill,
    padding: 4,
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.1)',
  },
  dgTab: {
    paddingVertical: 8,
    paddingHorizontal: 28,
    borderRadius: Radii.pill,
  },
  dgTabActive: {
    backgroundColor: Colors.g2,
    shadowColor: Colors.g2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 14,
    elevation: 4,
  },
  dgTabText: {
    fontSize: 13,
    fontFamily: 'BricolageGrotesque_600',
    color: 'rgba(255,255,255,.5)',
  },
  dgTabTextActive: {
    color: '#fff',
  },
  // ── Cards ──
  cardSection: {
    padding: 16,
    alignItems: 'center',
  },
  walletCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: Radii.card,
    padding: 24,
    overflow: 'hidden',
    ...Shadows.cardLg,
  },
  cardPatternWrap: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.07,
  },
  patternCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 0.5,
    borderColor: '#fff',
  },
  patternCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 0.5,
    borderColor: '#fff',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  cardFlagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radii.pill,
  },
  cardFlag: {
    fontSize: 18,
  },
  cardCurrName: {
    fontSize: 12,
    color: 'rgba(255,255,255,.65)',
    fontFamily: 'Inter_500',
  },
  cardEyeBtn: {
    backgroundColor: 'rgba(255,255,255,.1)',
    borderRadius: 8,
    padding: 6,
  },
  cardBalLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,.45)',
    letterSpacing: 0.6,
    fontFamily: 'Inter_400',
    marginBottom: 4,
  },
  cardBal: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 28,
    color: '#fff',
    letterSpacing: -1,
  },
  cardAcct: {
    fontSize: 10,
    color: 'rgba(255,255,255,.35)',
    fontFamily: 'Inter_400',
    marginTop: 3,
  },
  cardMini: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 14,
    padding: 12,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.08)',
  },
  cmLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,.4)',
    letterSpacing: 0.3,
    fontFamily: 'Inter_400',
  },
  cmChange: {
    fontSize: 13,
    fontFamily: 'BricolageGrotesque_600',
    marginTop: 2,
  },
  cmRate: {
    fontSize: 12,
    fontFamily: 'Inter_500',
    color: 'rgba(255,255,255,.8)',
    marginTop: 2,
  },
  // ── Quick Actions ──
  actionsSection: {
    paddingHorizontal: 16,
  },
  qaLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500',
    color: Colors.muted,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  qaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 24,
  },
  qaBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 7,
  },
  qaIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  qaLbl: {
    fontSize: 11,
    fontFamily: 'Inter_500',
    color: Colors.muted,
  },
  // ── Chart ──
  chartContainer: {
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    marginBottom: 24,
    ...Shadows.card,
  },
  chartHdr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartName: {
    fontSize: 14,
    fontFamily: 'BricolageGrotesque_600',
    color: Colors.text,
  },
  chartPrice: {
    fontSize: 18,
    fontFamily: 'BricolageGrotesque_600',
    color: Colors.text,
    marginTop: 2,
  },
  chartCh: {
    fontSize: 12,
    fontFamily: 'Inter_600',
  },
  chartArea: {
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  chartGradient: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 12,
  },
  chartLine: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: Colors.g2,
    borderRadius: 2,
    transform: [{ rotate: '-5deg' }],
  },
  // ── Transactions ──
  txnSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  secHdr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  // ── Pockets ──
  pocketItem: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.blackAlpha04,
    padding: 14,
    marginBottom: 10,
    ...Shadows.card,
  },
  pocketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pocketName: {
    fontSize: 14,
    fontFamily: 'BricolageGrotesque_600',
    color: Colors.text,
  },
  pocketAmt: {
    fontSize: 14,
    fontFamily: 'BricolageGrotesque_600',
    color: Colors.g3,
  },
  progressBar: {
    height: 5,
    backgroundColor: Colors.blackAlpha05,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  pocketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pocketMetaText: {
    fontSize: 11,
    fontFamily: 'Inter_400',
    color: Colors.muted,
  },
});
