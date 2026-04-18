/**
 * twae — Add Money Screen (Screen C.2)
 * Three methods: Card, Bank Transfer, USSD
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  StatusBar, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';

type Tab = 'card' | 'bank' | 'ussd';

export default function AddMoneyScreen() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('bank');
  const [amount, setAmount] = useState('');

  // Mock virtual account
  const virtualAccount = {
    bankName: 'GTBank',
    accountNumber: '0123456789',
    accountName: 'TWAE/ADAUGO OKONKWO',
  };

  const copyDetails = async () => {
    await Clipboard.setStringAsync(
      `${virtualAccount.bankName}\n${virtualAccount.accountNumber}\n${virtualAccount.accountName}`
    );
    Alert.alert('Copied!', 'Account details copied to clipboard');
  };

  const tabs: { key: Tab; icon: string; label: string }[] = [
    { key: 'bank', icon: 'business-outline', label: 'Bank Transfer' },
    { key: 'card', icon: 'card-outline', label: 'Card' },
    { key: 'ussd', icon: 'keypad-outline', label: 'USSD' },
  ];

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
                <Text style={styles.acctValue}>{virtualAccount.bankName}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.acctRow}>
                <Text style={styles.acctLabel}>Account Number</Text>
                <Text style={styles.acctValueBig}>{virtualAccount.accountNumber}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.acctRow}>
                <Text style={styles.acctLabel}>Account Name</Text>
                <Text style={styles.acctValue}>{virtualAccount.accountName}</Text>
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
            <AppButton
              label="Pay with Card"
              onPress={() => Alert.alert('Card Payment', 'Flutterwave checkout would open here')}
              disabled={!amount || Number(amount) < 100}
            />
            <Text style={styles.hint}>Your card details are securely processed by Flutterwave. We never store your card data.</Text>
          </>
        )}

        {/* ── USSD Tab ── */}
        {tab === 'ussd' && (
          <>
            <Text style={styles.stepTitle}>Fund via USSD</Text>
            <Text style={styles.stepSub}>Dial the code below on your phone to fund your wallet</Text>

            <View style={styles.ussdCard}>
              <Text style={styles.ussdLabel}>GTBank</Text>
              <Text style={styles.ussdCode}>*737*{amount || '???'}*0123456789#</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: '#fff' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 20 },
  tab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  tabActive: { backgroundColor: Colors.g2, borderColor: 'transparent' },
  tabText: { fontFamily: 'Inter_500', fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  tabTextActive: { color: '#fff' },
  body: { paddingHorizontal: 24, paddingBottom: 40 },
  stepTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 22, color: '#fff', marginBottom: 8 },
  stepSub: { fontFamily: 'Inter_400', fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24, lineHeight: 20 },
  acctCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 20,
  },
  acctRow: { paddingVertical: 10 },
  acctLabel: { fontFamily: 'Inter_400', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  acctValue: { fontFamily: 'Inter_500', fontSize: 14, color: '#fff' },
  acctValueBig: { fontFamily: 'BricolageGrotesque_600', fontSize: 26, color: Colors.g2, letterSpacing: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  ussdCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 24,
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 20,
  },
  ussdLabel: { fontFamily: 'Inter_500', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 },
  ussdCode: { fontFamily: 'BricolageGrotesque_600', fontSize: 22, color: Colors.gold1, letterSpacing: 1 },
  hint: { fontFamily: 'Inter_400', fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 18, marginTop: 16 },
});
