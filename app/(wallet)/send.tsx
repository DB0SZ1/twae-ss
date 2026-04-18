/**
 * twae — Send Money Screen (Screen C.3)
 * Beneficiary selection, bank lookup, amount entry, save beneficiary toggle
 */
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  StatusBar, TextInput, Switch, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';
import { beneficiaries, bankList, walletBalances } from '../../constants/mockData';
import { useCurrency } from '../../hooks/useCurrency';

export default function SendMoneyScreen() {
  const router = useRouter();
  const { formatNGN } = useCurrency();
  const [step, setStep] = useState<'recipient' | 'amount'>('recipient');
  const [searchQ, setSearchQ] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [resolvedName, setResolvedName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saveBen, setSaveBen] = useState(false);
  const [showBanks, setShowBanks] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const filteredBens = beneficiaries.filter(b =>
    b.name.toLowerCase().includes(searchQ.toLowerCase())
  );

  // Simulate account lookup
  const lookupAccount = async () => {
    if (accountNo.length < 10) return;
    setVerifying(true);
    setTimeout(() => {
      setResolvedName('OKONKWO ADAUGO CHIDINMA');
      setVerifying(false);
    }, 800);
  };

  const balance = walletBalances[0].amount;
  const fee = 10;
  const total = Number(amount) + fee;

  const handleContinue = () => {
    const amt = Number(amount);
    if (amt <= 0) return;
    if (amt > balance) {
      Alert.alert('Insufficient Balance', `You have ${formatNGN(balance)} available.`);
      return;
    }
    if (amt > 2000000) {
      Alert.alert('Limit Exceeded', 'This exceeds your ₦2,000,000 daily limit. Upgrade your account.');
      return;
    }
    router.push({
      pathname: '/(wallet)/confirm',
      params: {
        recipientName: resolvedName || 'Recipient',
        recipientBank: selectedBank,
        recipientAcct: accountNo,
        amount: amount,
        fee: fee.toString(),
        note: note,
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#000']} style={StyleSheet.absoluteFillObject} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step === 'amount' ? setStep('recipient') : router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Money</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {step === 'recipient' && (
          <>
            {/* Search */}
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.4)" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search beneficiaries..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={searchQ}
                onChangeText={setSearchQ}
              />
            </View>

            {/* Saved Beneficiaries */}
            <Text style={styles.sectionLabel}>SAVED BENEFICIARIES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.benScroll}>
              {/* New recipient */}
              <TouchableOpacity style={styles.benItem} onPress={() => {}}>
                <View style={[styles.benAvatar, { backgroundColor: 'rgba(50,100,209,0.15)' }]}>
                  <Ionicons name="add" size={20} color={Colors.g2} />
                </View>
                <Text style={styles.benName}>New</Text>
              </TouchableOpacity>
              {filteredBens.map(b => (
                <TouchableOpacity
                  key={b.id}
                  style={styles.benItem}
                  onPress={() => {
                    setSelectedBank(b.bankName);
                    setAccountNo(b.accountNumber);
                    setResolvedName(b.name);
                    setStep('amount');
                  }}
                >
                  <View style={styles.benAvatar}>
                    <Text style={styles.benInitials}>{b.initials}</Text>
                  </View>
                  <Text style={styles.benName} numberOfLines={1}>{b.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Manual Entry */}
            <Text style={styles.sectionLabel}>OR ENTER DETAILS</Text>

            {/* Bank Selector */}
            <TouchableOpacity style={styles.selector} onPress={() => setShowBanks(!showBanks)}>
              <Text style={[styles.selectorText, selectedBank ? { color: '#fff' } : {}]}>
                {selectedBank || 'Select Bank'}
              </Text>
              <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
            {showBanks && (
              <View style={styles.bankDropdown}>
                <ScrollView style={{ maxHeight: 200 }}>
                  {bankList.map(b => (
                    <TouchableOpacity
                      key={b}
                      style={styles.bankItem}
                      onPress={() => { setSelectedBank(b); setShowBanks(false); }}
                    >
                      <Text style={styles.bankItemText}>{b}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <AppInput
              label="Account Number"
              value={accountNo}
              onChangeText={(v) => { setAccountNo(v); if (v.length === 10) lookupAccount(); }}
              placeholder="0123456789"
              keyboardType="number-pad"
              maxLength={10}
            />

            {verifying && <Text style={styles.verifyingText}>Verifying account...</Text>}
            {resolvedName && !verifying && (
              <View style={styles.resolvedCard}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.greenBright} />
                <Text style={styles.resolvedName}>{resolvedName}</Text>
              </View>
            )}

            <AppButton
              label="Continue"
              onPress={() => setStep('amount')}
              disabled={!selectedBank || accountNo.length < 10}
            />
          </>
        )}

        {step === 'amount' && (
          <>
            {/* Recipient Summary */}
            <View style={styles.recipientCard}>
              <View style={styles.recipientAvatar}>
                <Text style={styles.recipientInit}>{resolvedName.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.recipientName}>{resolvedName}</Text>
                <Text style={styles.recipientBank}>{selectedBank} · {accountNo}</Text>
              </View>
            </View>

            <AppInput
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              prefix="₦"
            />
            <Text style={styles.balHint}>Available: {formatNGN(balance)}</Text>

            <AppInput
              label="Note (optional)"
              value={note}
              onChangeText={setNote}
              placeholder="What's this for?"
            />

            {/* Save Beneficiary Toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Save as beneficiary</Text>
              <Switch
                value={saveBen}
                onValueChange={setSaveBen}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.g2 }}
                thumbColor="#fff"
              />
            </View>

            {/* Summary */}
            {amount && Number(amount) > 0 && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Amount</Text>
                  <Text style={styles.summaryVal}>{formatNGN(Number(amount))}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Fee</Text>
                  <Text style={styles.summaryVal}>{formatNGN(fee)}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: '#fff' }]}>Total</Text>
                  <Text style={[styles.summaryVal, { color: '#fff', fontFamily: 'BricolageGrotesque_600' }]}>{formatNGN(total)}</Text>
                </View>
              </View>
            )}

            <AppButton label="Review Transfer" onPress={handleContinue} disabled={!amount || Number(amount) <= 0} />
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
  body: { paddingHorizontal: 24, paddingBottom: 40 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 20,
  },
  searchInput: { flex: 1, color: '#fff', fontFamily: 'Inter_400', fontSize: 14 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600', color: 'rgba(255,255,255,0.4)', letterSpacing: 0.6, marginBottom: 12 },
  benScroll: { marginBottom: 24 },
  benItem: { alignItems: 'center', marginRight: 16 },
  benAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 6 },
  benInitials: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.g2 },
  benName: { fontFamily: 'Inter_500', fontSize: 11, color: 'rgba(255,255,255,0.5)', maxWidth: 60, textAlign: 'center' },
  selector: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 16, marginBottom: 16,
  },
  selectorText: { fontFamily: 'Inter_400', fontSize: 15, color: 'rgba(255,255,255,0.35)' },
  bankDropdown: { backgroundColor: 'rgba(15,23,42,0.95)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 16, marginTop: -8 },
  bankItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  bankItemText: { fontFamily: 'Inter_400', fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  verifyingText: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.gold1, marginBottom: 12 },
  resolvedCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(74,222,128,0.08)', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(74,222,128,0.15)', marginBottom: 20,
  },
  resolvedName: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.greenBright },
  recipientCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 24,
  },
  recipientAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(50,100,209,0.15)', justifyContent: 'center', alignItems: 'center' },
  recipientInit: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: Colors.g2 },
  recipientName: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: '#fff' },
  recipientBank: { fontFamily: 'Inter_400', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  balHint: { fontFamily: 'Inter_400', fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: -8, marginBottom: 16 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  toggleLabel: { fontFamily: 'Inter_500', fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 20,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  summaryLabel: { fontFamily: 'Inter_400', fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  summaryVal: { fontFamily: 'Inter_500', fontSize: 13, color: 'rgba(255,255,255,0.8)' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 6 },
});
