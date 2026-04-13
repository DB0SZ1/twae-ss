/**
 * twae — Send Money Screen
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii, Shadows } from '../../constants/theme';
import { beneficiaries, bankList, walletBalances } from '../../constants/mockData';
import { useCurrency } from '../../hooks/useCurrency';

export default function SendMoneyScreen() {
  const router = useRouter();
  const { formatNGN } = useCurrency();
  const [step, setStep] = useState<'recipient' | 'amount'>('recipient');
  const [bank, setBank] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showBanks, setShowBanks] = useState(false);

  return (
    <View style={styles.container}>
      <AppHeader title="Send Money" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {/* Saved Beneficiaries */}
        {step === 'recipient' && (
          <>
            <Text style={styles.sectionLabel}>SAVED BENEFICIARIES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.benScroll}>
              {beneficiaries.map(b => (
                <TouchableOpacity key={b.id} style={styles.benItem} onPress={() => {
                  setBank(b.bankName);
                  setAccountNo(b.accountNumber);
                  setStep('amount');
                }} activeOpacity={0.7}>
                  <View style={styles.benAvatar}><Text style={styles.benInitials}>{b.initials}</Text></View>
                  <Text style={styles.benName} numberOfLines={1}>{b.name.split(' ')[0]}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.sectionLabel}>OR ENTER DETAILS</Text>
            <TouchableOpacity style={styles.bankSelect} onPress={() => setShowBanks(!showBanks)}>
              <Text style={[styles.bankSelectText, bank ? { color: Colors.text } : {}]}>{bank || 'Select Bank'}</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.dim} />
            </TouchableOpacity>
            {showBanks && (
              <View style={styles.bankList}>
                {bankList.map(b => (
                  <TouchableOpacity key={b} style={styles.bankItem} onPress={() => { setBank(b); setShowBanks(false); }}>
                    <Text style={styles.bankItemText}>{b}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <AppInput label="Account Number" value={accountNo} onChangeText={setAccountNo} placeholder="0123456789" keyboardType="number-pad" maxLength={10} />
            <AppButton label="Continue" onPress={() => setStep('amount')} disabled={!bank || accountNo.length < 10} />
          </>
        )}

        {step === 'amount' && (
          <>
            <View style={styles.recipientCard}>
              <Text style={styles.recipientName}>{beneficiaries.find(b => b.accountNumber === accountNo)?.name || 'Recipient'}</Text>
              <Text style={styles.recipientBank}>{bank} · {accountNo}</Text>
            </View>
            <AppInput label="Amount" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" prefix="₦" />
            <Text style={styles.balanceHint}>Available: {formatNGN(walletBalances[0].amount)}</Text>
            <AppInput label="Note (optional)" value={note} onChangeText={setNote} placeholder="What's this for?" />
            <AppButton label="Review Transfer" onPress={() => router.push('/(wallet)/confirm')} disabled={!amount} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 20, paddingBottom: 40 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_600', color: Colors.muted, letterSpacing: 0.6, marginBottom: 10 },
  benScroll: { marginBottom: 24 },
  benItem: { alignItems: 'center', marginRight: 16 },
  benAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.blackAlpha05, marginBottom: 6 },
  benInitials: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.g2 },
  benName: { fontFamily: 'Inter_500', fontSize: 11, color: Colors.muted, maxWidth: 60, textAlign: 'center' },
  bankSelect: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: 52, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.blackAlpha04, paddingHorizontal: 16, marginBottom: 16 },
  bankSelectText: { fontFamily: 'Inter_400', fontSize: 15, color: Colors.dim },
  bankList: { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.blackAlpha04, marginBottom: 16, maxHeight: 200 },
  bankItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: Colors.blackAlpha04 },
  bankItemText: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.text },
  recipientCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: Colors.blackAlpha04 },
  recipientName: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: Colors.text },
  recipientBank: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted, marginTop: 4 },
  balanceHint: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.dim, marginTop: -8, marginBottom: 16 },
});
