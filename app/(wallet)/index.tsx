/**
 * twae — Wallet Home (Screen C.1)
 * NGN + USD balances, virtual account, recent wallet txns, quick actions
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import TransactionRow from '../../components/molecules/TransactionRow';
import { Colors, Radii, Shadows } from '../../constants/theme';
import { useCurrency } from '../../hooks/useCurrency';
import { fetchWalletBalances, fetchTransactions } from '../../controllers/walletController';

export default function WalletHomeScreen() {
  const router = useRouter();
  const { formatNGN, formatUSD } = useCurrency();
  const [hidden, setHidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ngn, setNgn] = useState<any>(null);
  const [usd, setUsd] = useState<any>(null);
  const [txns, setTxns] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bals, txnRes] = await Promise.all([
        fetchWalletBalances(),
        fetchTransactions()
      ]);
      setNgn(bals.ngn);
      setUsd(bals.usd);
      setTxns(txnRes.transactions || []);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const copyAccount = async () => {
    if (!ngn || !ngn.virtual_account_number) return;
    await Clipboard.setStringAsync(ngn.virtual_account_number);
    Alert.alert('Copied!', 'Account number copied to clipboard');
  };

  if (loading || !ngn) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.gold1} size="large" />
      </View>
    );
  }

  const walletTxns = txns.slice(0, 5);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#000']} style={StyleSheet.absoluteFillObject} />

      <ScrollView contentContainerStyle={{ paddingBottom: 40, paddingTop: 56 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet</Text>
          <TouchableOpacity onPress={() => setHidden(!hidden)}>
            <Ionicons name={hidden ? 'eye-off' : 'eye'} size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        {/* NGN Card */}
        <View style={styles.cardWrap}>
          <LinearGradient colors={['#1a3575', '#4a7aff', '#3264d1']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.flagPill}><Text style={{ fontSize: 16 }}>🇳🇬</Text><Text style={styles.currLabel}>Naira Wallet</Text></View>
            </View>
            <Text style={styles.balLabel}>AVAILABLE BALANCE</Text>
            <Text style={styles.balVal}>{hidden ? '••••••••' : formatNGN(ngn.balance || 0)}</Text>
            <TouchableOpacity style={styles.acctRow} onPress={copyAccount}>
              <Text style={styles.acctNo}>{ngn.virtual_account_number || 'No Account'} · {ngn.virtual_bank_name || 'N/A'}</Text>
              <Ionicons name="copy-outline" size={14} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* USD Card */}
        <View style={styles.cardWrap}>
          <LinearGradient colors={['#065f46', '#059669', '#047857']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.flagPill}><Text style={{ fontSize: 16 }}>🇺🇸</Text><Text style={styles.currLabel}>Dollar Wallet</Text></View>
            </View>
            <Text style={styles.balLabel}>AVAILABLE BALANCE</Text>
            <Text style={styles.balVal}>{hidden ? '••••••••' : formatUSD(usd?.balance || 0)}</Text>
          </LinearGradient>
        </View>

        {/* Quick Actions Row */}
        <View style={styles.actionsRow}>
          {[
            { label: 'Add Money', icon: 'add-circle-outline', route: '/(wallet)/add-money' },
            { label: 'Send', icon: 'paper-plane-outline', route: '/(wallet)/send' },
            { label: 'Convert', icon: 'swap-horizontal-outline', route: '/(wallet)/fx-convert' },
          ].map(a => (
            <TouchableOpacity key={a.label} style={styles.actionBtn} onPress={() => router.push(a.route as any)}>
              <View style={styles.actionIcon}>
                <Ionicons name={a.icon as any} size={22} color="#fff" />
              </View>
              <Text style={styles.actionLbl}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Wallet Transactions */}
        <View style={styles.txnSection}>
          <View style={styles.txnHdr}>
            <Text style={styles.txnTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/transactions')}>
              <Text style={styles.seeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          {walletTxns.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32, opacity: 0.6 }}>
              <Ionicons name="moon-outline" size={36} color={Colors.dim} />
              <Text style={{ fontFamily: 'Inter_400', color: Colors.dim, fontSize: 13, marginTop: 12 }}>
                No recent transactions in this wallet
              </Text>
            </View>
          ) : (
            walletTxns.map(t => (
              <TransactionRow key={t.id} transaction={t} onPress={() => {}} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: '#fff' },
  cardWrap: { paddingHorizontal: 20, marginBottom: 16 },
  card: { borderRadius: 22, padding: 24, overflow: 'hidden' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  flagPill: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.12)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: Radii.pill },
  currLabel: { color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_500', fontSize: 12 },
  balLabel: { fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.6, fontFamily: 'Inter_400', marginBottom: 4 },
  balVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 30, color: '#fff', letterSpacing: -1 },
  acctRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
  acctNo: { fontSize: 11, color: 'rgba(255,255,255,0.45)', fontFamily: 'Inter_400' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginVertical: 24 },
  actionBtn: { alignItems: 'center', gap: 8 },
  actionIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  actionLbl: { fontFamily: 'Inter_500', fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  txnSection: { paddingHorizontal: 20 },
  txnHdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  txnTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: '#fff' },
  seeAll: { fontFamily: 'Inter_500', fontSize: 12, color: Colors.g2 },
});
