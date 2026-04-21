/**
 * twae — Add Money Screen (Screen C.2)
 * Three methods: Card, Bank Transfer, USSD
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
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';
import { fetchVirtualAccount, fundWallet } from '../../controllers/walletController';

type Tab = 'card' | 'bank' | 'ussd';

export default function AddMoneyScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('bank');
  const [amount, setAmount] = useState('');
  const [virtualAcct, setVirtualAcct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [funding, setFunding] = useState(false);

  useEffect(() => {
    loadVirtualAccount();
  }, []);

  const loadVirtualAccount = async () => {
    try {
      const res = await fetchVirtualAccount();
      setVirtualAcct(res);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not fetch virtual account details');
    } finally {
      setLoading(false);
    }
  };

  const copyDetails = async () => {
    if (!virtualAcct) return;
    await Clipboard.setStringAsync(
      `${virtualAcct.bank_name}\n${virtualAcct.account_number}\n${virtualAcct.account_name}`
    );
    Alert.alert('Copied!', 'Account details copied to clipboard');
  };

  const payWithCard = async () => {
    if (!amount || Number(amount) < 100) return;
    setFunding(true);
    try {
      const res = await fundWallet({ amount: Number(amount), currency: 'NGN', method: 'card' });
      Alert.alert('Funding Successful', res.message, [
        { text: 'OK', onPress: () => router.push('/(wallet)') }
      ]);
    } catch (err: any) {
      Alert.alert('Funding Failed', err.message);
    } finally {
      setFunding(false);
    }
  };

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: 'bank', icon: 'business-outline', label: 'Bank Transfer' },
    { key: 'card', icon: 'card-outline', label: 'Card' },
    { key: 'ussd', icon: 'keypad-outline', label: 'USSD' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator color={Colors.gold1} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#000']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Money</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Tab Selector */}
      <View style={styles.tabRow}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
          >
            <Ionicons name={t.icon as any} size={18} color={tab === t.key ? '#fff' : 'rgba(255,255,255,0.4)'} />
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* ── Bank Transfer Tab ── */}
        {tab === 'bank' && (
          <>
            <Text style={styles.stepTitle}>Transfer to this account</Text>
            <Text style={styles.stepSub}>Send money from any bank app to your twae wallet</Text>

            <View style={styles.acctCard}>
              <View style={styles.acctRow}>
                <Text style={styles.acctLabel}>Bank</Text>
                <Text style={styles.acctValue}>{virtualAcct?.bank_name || 'N/A'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.acctRow}>
                <Text style={styles.acctLabel}>Account Number</Text>
                <Text style={styles.acctValueBig}>{virtualAcct?.account_number || 'N/A'}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.acctRow}>
                <Text style={styles.acctLabel}>Account Name</Text>
                <Text style={styles.acctValue}>{virtualAcct?.account_name || 'N/A'}</Text>
              </View>
            </View>

            <AppButton label="Copy Account Details" onPress={copyDetails} variant="secondary" icon={<Ionicons name="copy-outline" size={16} color={Colors.g2} />} />
            <Text style={styles.hint}>Transfers are confirmed instantly. You'll get a push notification when your wallet is credited.</Text>
          </>
        )}

        {/* ── Card Tab ── */}
        {tab === 'card' && (
          <>
            <Text style={styles.stepTitle}>Fund with Card</Text>
            <Text style={styles.stepSub}>Minimum ₦100. Maximum based on your KYC tier.</Text>
            <AppInput
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              prefix="₦"
            />
            {funding ? (
              <ActivityIndicator color={Colors.gold1} style={{ marginVertical: 20 }} />
            ) : (
              <AppButton
                label="Pay with Card"
                onPress={payWithCard}
                disabled={!amount || Number(amount) < 100}
              />
            )}
            <Text style={styles.hint}>Your card details are securely processed by Flutterwave. We never store your card data.</Text>
          </>
        )}

        {/* ── USSD Tab ── */}
        {tab === 'ussd' && (
          <>
            <Text style={styles.stepTitle}>Fund via USSD</Text>
            <Text style={styles.stepSub}>Dial the code below on your phone to fund your wallet</Text>

            <View style={styles.ussdCard}>
              <Text style={styles.ussdLabel}>{virtualAcct?.bank_name || 'Bank'}</Text>
              <Text style={styles.ussdCode}>*737*{amount || '???'}*{virtualAcct?.account_number || '01234'}#</Text>
            </View>
            <AppInput
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
              prefix="₦"
            />
            <Text style={styles.hint}>After dialing, follow the prompts to complete the transfer.</Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: '#fff' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 24, gap: 8 },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: Radii.pill, backgroundColor: 'rgba(255,255,255,0.06)',
  },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  tabText: { fontFamily: 'Inter_500', fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  tabTextActive: { color: '#fff' },
  body: { paddingHorizontal: 24, paddingBottom: 40 },
  stepTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 22, color: '#fff', marginBottom: 6 },
  stepSub: { fontFamily: 'Inter_400', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 24 },
  acctCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 24 },
  acctRow: { marginVertical: 8 },
  acctLabel: { fontFamily: 'Inter_400', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
  acctValue: { fontFamily: 'Inter_600', fontSize: 16, color: '#fff' },
  acctValueBig: { fontFamily: 'BricolageGrotesque_600', fontSize: 28, color: Colors.gold1, letterSpacing: 1 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 8 },
  hint: { fontFamily: 'Inter_400', fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 24, lineHeight: 18 },
  ussdCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 24 },
  ussdLabel: { fontFamily: 'Inter_500', fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 },
  ussdCode: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.greenBright, letterSpacing: 1 },
});
