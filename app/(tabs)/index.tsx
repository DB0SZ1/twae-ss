/**
 * twae — Home / Dashboard (Screen 2.1)
 * Primary Post-login hub showing live wealth, shadow actions, and governor state.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Dimensions, StatusBar, RefreshControl, Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import TransactionRow from '../../components/molecules/TransactionRow';
import { Colors, Fonts, Radii, Shadows } from '../../constants/theme';
import { currentUser, transactions } from '../../constants/mockData';
import { useCurrency } from '../../hooks/useCurrency';
import { fetchDashboardData, DashboardData } from '../../controllers/dashboardController';

const { width } = Dimensions.get('window');

// ── Mock Initial Data ──
const initialDashData: DashboardData = {
  liveWealthAccrued: 0,
  projected40YearValue: 0,
  ytdContribution: 0,
  liabilityCapturePercent: 0,
  safetyGovernorStatus: 'green',
  topMovers: [],
  hardRailEnabled: false,
};

export default function HomeScreen() {
  const router = useRouter();
  const { formatNGN, formatUSD } = useCurrency();
  
  const [data, setData] = useState<DashboardData>(initialDashData);
  const [refreshing, setRefreshing] = useState(false);
  const [currency, setCurrency] = useState<'NGN'|'USD'>('NGN');
  
  // Shadow Action Feed Ticker Animation
  const tickerAnim = useRef(new Animated.Value(0)).current;

  // Real-time Wealth pulse animation
  const glowAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadDashboard();
    
    // Ticker Loop
    Animated.loop(
      Animated.timing(tickerAnim, {
        toValue: -width,
        duration: 15000, // scrolling speed
        useNativeDriver: true,
      })
    ).start();

    // Pulse Logo / Wealth Accrued Glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
      ])
    ).start();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await fetchDashboardData();
      setData(res);
    } catch (e) {
      console.error(e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const getTimeGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const toggleCurrency = () => {
    setCurrency(c => c === 'NGN' ? 'USD' : 'NGN');
  };

  const renderCurBalance = (valInNgn: number) => {
    // Dummy exchange rate 1500 NGN = 1 USD for display toggle
    return currency === 'NGN' ? formatNGN(valInNgn) : formatUSD(valInNgn / 1500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* ── Background Gradient ── */}
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={styles.holoCircle} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.gold1} />}
        contentContainerStyle={{ paddingBottom: 110, paddingTop: 60 }}
      >
        {/* ── Header Row ── */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.greetingWrap}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.avatar}>
              <Text style={styles.avText}>{currentUser.initials}</Text>
            </View>
            <View>
              <Text style={styles.greetingText}>{getTimeGreeting()},</Text>
              <Text style={styles.userName}>{currentUser.firstName}</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.bellBtn} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={22} color="#fff" />
            <View style={styles.bellBadge} />
          </TouchableOpacity>
        </View>

        {/* ── Safety Governor Indicator ── */}
        <View style={styles.governorContainer}>
          <TouchableOpacity style={styles.govPill}>
            <MaterialCommunityIcons 
              name="shield-check" 
              size={18} 
              color={data.safetyGovernorStatus === 'green' ? Colors.greenBright : Colors.gold1} 
            />
            <Text style={styles.govText}>Safety Governor: {data.safetyGovernorStatus === 'green' ? 'Active' : 'Paused'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.currencyToggle} onPress={toggleCurrency}>
            <Text style={styles.currencyToggleTxt}>{currency} ▾</Text>
          </TouchableOpacity>
        </View>

        {/* ── Command Center: Wealth Accrued ── */}
        <View style={styles.wealthContainer}>
          <Text style={styles.wealthLabel}>LIVE WEALTH ACCRUED</Text>
          <Animated.View style={{ transform: [{ scale: glowAnim }] }}>
            <Text style={styles.wealthValue}>
              {renderCurBalance(data.liveWealthAccrued)}
            </Text>
          </Animated.View>

          {/* 40-Year Projection */}
          <View style={styles.projectionWrap}>
            <Ionicons name="telescope-outline" size={14} color="rgba(255,255,255,0.6)" />
            <Text style={styles.projectionText}>
              Projected 40-Yr Value: {renderCurBalance(data.projected40YearValue)}
            </Text>
          </View>
        </View>

        {/* ── Quick Stats Row ── */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Liability Capture</Text>
            <Text style={styles.statScore}>{data.liabilityCapturePercent}% <Text style={styles.statScoreSub}>efficiency</Text></Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>YTD Contribution</Text>
            <Text style={styles.statScore}>{renderCurBalance(data.ytdContribution)}</Text>
          </View>
        </View>

        {/* ── Shadow Action Real-time Feed Ticker ── */}
        <View style={styles.tickerWrapper}>
          <View style={styles.tickerLabelBox}>
            <Text style={styles.tickerLabelText}>TWA LIVE</Text>
          </View>
          <View style={{ flex: 1, overflow: 'hidden' }}>
            <Animated.View style={[styles.tickerContent, { transform: [{ translateX: tickerAnim }] }]}>
              <Text style={styles.tickerItem}>
                <Text style={{ color: Colors.greenBright }}>+₦125.40</Text> | Bolt Ride | 14ms
              </Text>
              <Text style={styles.tickerItem}>
                <Text style={{ color: Colors.greenBright }}>+₦850.00</Text> | Starbucks | 185ms
              </Text>
              <Text style={styles.tickerItem}>
                <Text style={{ color: Colors.greenBright }}>+₦45.00</Text> | Apple Music | 22ms
              </Text>
              {/* Duplicate for infinite loop illusion */}
              <Text style={styles.tickerItem}>
                <Text style={{ color: Colors.greenBright }}>+₦125.40</Text> | Bolt Ride | 14ms
              </Text>
            </Animated.View>
          </View>
        </View>

        {/* ── Quick Actions ── */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/wallet/add-money')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(74, 222, 128, 0.15)' }]}>
              <Ionicons name="add" size={24} color={Colors.greenBright} />
            </View>
            <Text style={styles.actionLbl}>Add</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/wallet/send')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
              <Ionicons name="paper-plane-outline" size={20} color="#38bdf8" />
            </View>
            <Text style={styles.actionLbl}>Send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/invest')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(217, 119, 6, 0.15)' }]}>
              <Ionicons name="trending-up" size={20} color={Colors.gold1} />
            </View>
            <Text style={styles.actionLbl}>Invest</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/wallet/fx-convert')}>
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(232, 121, 249, 0.15)' }]}>
              <Ionicons name="swap-horizontal" size={20} color="#e879f9" />
            </View>
            <Text style={styles.actionLbl}>Convert</Text>
          </TouchableOpacity>
        </View>

        {/* ── Market Summary Strip ── */}
        <View style={styles.marketStrip}>
          {data.topMovers.map((m, i) => (
            <View key={i} style={styles.moverPill}>
              <Text style={styles.moverSym}>{m.symbol}</Text>
              <Text style={[styles.moverChg, { color: m.changePercent >= 0 ? Colors.greenBright : Colors.red }]}>
                {m.changePercent >= 0 ? '+' : ''}{m.changePercent}%
              </Text>
            </View>
          ))}
        </View>

        {/* ── Recent Transactions ── */}
        <View style={styles.glassContainer}>
          <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFillObject} />
          <View style={styles.glassInner}>
            <View style={styles.txnHeader}>
              <Text style={styles.txnTitle}>Recent Activity</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            {transactions.slice(0, 5).map((txn) => (
              <TransactionRow
                key={txn.id}
                transaction={txn}
                onPress={() => {}}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  holoCircle: {
    position: 'absolute',
    top: -150,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(240, 165, 0, 0.1)',
    opacity: 0.8,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greetingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avText: {
    color: '#fff',
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 14,
  },
  greetingText: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Inter_400',
    fontSize: 12,
  },
  userName: {
    color: '#fff',
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 16,
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.red,
  },
  governorContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  govPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    gap: 6,
  },
  govText: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter_500',
    fontSize: 11,
  },
  currencyToggle: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  currencyToggleTxt: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter_600',
    fontSize: 11,
  },
  wealthContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  wealthLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Inter_500',
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 8,
  },
  wealthValue: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 48,
    color: '#d97706', // amber glow as requested
    textShadowColor: 'rgba(217, 119, 6, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 8,
  },
  projectionWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    gap: 8,
  },
  projectionText: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter_400',
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'Inter_400',
    fontSize: 11,
    marginBottom: 6,
  },
  statScore: {
    color: '#fff',
    fontFamily: 'Inter_600',
    fontSize: 18,
  },
  statScoreSub: {
    color: 'rgba(255,255,255,0.4)',
    fontFamily: 'Inter_400',
    fontSize: 10,
  },
  tickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 10,
    marginBottom: 20,
  },
  tickerLabelBox: {
    backgroundColor: Colors.g2,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    marginRight: 10,
    zIndex: 2,
  },
  tickerLabelText: {
    color: '#fff',
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 10,
    letterSpacing: 1,
  },
  tickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: width * 2, // Double width for scrolling room
  },
  tickerItem: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Inter_400',
    fontSize: 12,
    marginRight: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    marginBottom: 25,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionLbl: {
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'Inter_500',
    fontSize: 12,
  },
  marketStrip: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  moverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  moverSym: {
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Inter_500',
    fontSize: 11,
  },
  moverChg: {
    fontFamily: 'Inter_600',
    fontSize: 11,
  },
  glassContainer: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    ...Shadows.cardLg,
  },
  glassInner: {
    padding: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  txnHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  txnTitle: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 16,
    color: '#fff',
  },
  seeAll: {
    fontFamily: 'Inter_500',
    fontSize: 12,
    color: Colors.g2,
  },
});
