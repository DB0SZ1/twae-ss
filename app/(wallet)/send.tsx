/**
 * twae — Send Money Screen (Screen C.3)
 * Beneficiary selection, bank lookup, amount entry, save beneficiary toggle
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  StatusBar, TextInput, Switch, Alert, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';
import { useCurrency } from '../../hooks/useCurrency';
import { verifyBankAccount } from '../../controllers/walletController';
import { fetchBankList } from '../../controllers/bankController';
import { fetchBeneficiaries, fetchWalletBalances } from '../../controllers/walletController';

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
  const [loading, setLoading] = useState(true);
  
  const [bens, setBens] = useState<any[]>([]);
  const [bankList, setBankList] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [b, l, bal] = await Promise.all([
        fetchBeneficiaries(),
        fetchBankList(),
        fetchWalletBalances()
      ]);
      setBens(b);
      setBankList(l);
      setBalance(bal?.ngn?.balance || 0);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load transfer data');
    } finally {
      setLoading(false);
    }
  };

  const filteredBens = bens.filter(b =>
    b.account_name.toLowerCase().includes(searchQ.toLowerCase()) || 
    b.account_number.includes(searchQ)
  );

  const lookupAccount = async () => {
    if (accountNo.length < 10 || !selectedBank) return;
    setVerifying(true);
    setResolvedName('');
    try {
      const res = await verifyBankAccount(accountNo, selectedBank);
      if (res.success) {
        setResolvedName(res.accountName || res.account_name);
      } else {
        throw new Error('Invalid account');
      }
    } catch (err: any) {
      Alert.alert('Lookup Failed', 'Could not verify account details automatically. Please check the account number and bank.');
    } finally {
      setVerifying(false);
    }
  };

  const fee = 10;
  const total = Number(amount) + fee;

  const handleNext = () => {
    if (step === 'recipient') {
      if (!resolvedName) return Alert.alert('Hold on', 'Please verify the recipient account first.');
      setStep('amount');
    } else {
      if (!amount || total > balance) return Alert.alert('Invalid Amount', 'Insufficient balance');
      
      const bankName = bankList.find(b => b.code === selectedBank)?.name || selectedBank;
      
      router.push({
        pathname: '/(wallet)/confirm',
        params: {
          recipientName: resolvedName,
          recipientBank: bankName,
          recipientBankCode: selectedBank,
          recipientAcct: accountNo,
          amount,
          fee: fee.toString(),
          note,
          saveBeneficiary: saveBen ? 'true' : 'false',
          currency: 'NGN'
        },
      });
    }
  };

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
        <TouchableOpacity onPress={() => step === 'amount' ? setStep('recipient') : router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Send Money</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {step === 'recipient' ? (
          <>
            {/* New recipient form */}
            <View style={styles.newTransferCard}>
              <Text style={styles.sectionTitle}>New Transfer</Text>

              {/* Bank Selector */}
              <Text style={styles.fieldLabel}>Select Bank</Text>
              <TouchableOpacity style={styles.bankSelectRow} onPress={() => setShowBanks(!showBanks)}>
                <Text style={styles.bankSelectText}>
                  {selectedBank ? bankList.find(b => b.code === selectedBank)?.name || 'Select Bank' : 'Choose a bank'}
                </Text>
                <Ionicons name={showBanks ? 'chevron-up' : 'chevron-down'} size={20} color="rgba(255,255,255,0.5)" />
              </TouchableOpacity>
              {showBanks && (
                <View style={styles.bankList}>
                  {bankList.map(b => (
                    <TouchableOpacity
                      key={b.code}
                      style={styles.bankListItem}
                      onPress={() => { setSelectedBank(b.code); setShowBanks(false); }}
                    >
                      <Text style={styles.bankListItemText}>{b.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <Text style={styles.fieldLabel}>Account Number</Text>
              <View style={styles.acctRow}>
                <TextInput
                  style={styles.acctInput}
                  placeholder="0000000000"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  keyboardType="numeric"
                  maxLength={10}
                  value={accountNo}
                  onChangeText={(val) => {
                    setAccountNo(val);
                    setResolvedName('');
                  }}
                />
                <TouchableOpacity
                  style={[styles.verifyBtn, (!selectedBank || accountNo.length < 10) && { opacity: 0.5 }]}
                  disabled={!selectedBank || accountNo.length < 10 || verifying}
                  onPress={lookupAccount}
                >
                  {verifying ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.verifyBtnText}>Verify</Text>}
                </TouchableOpacity>
              </View>

              {resolvedName ? (
                <View style={styles.resolvedBox}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.greenBright} />
                  <Text style={styles.resolvedText}>{resolvedName}</Text>
                </View>
              ) : null}
            </View>

            {/* Beneficiaries List */}
            {bens.length > 0 && (
              <View style={styles.bensSection}>
                <Text style={styles.sectionTitle}>Saved Beneficiaries</Text>
                <AppInput
                  placeholder="Search name or account"
                  value={searchQ}
                  onChangeText={setSearchQ}
                  leftIcon={<Ionicons name="search" size={18} color="rgba(255,255,255,0.4)" />}
                />
                <View style={{ marginTop: 12 }}>
                  {filteredBens.map(b => (
                    <TouchableOpacity
                      key={b.id}
                      style={styles.benRow}
                      onPress={() => {
                        setSelectedBank(b.bank_code);
                        setAccountNo(b.account_number);
                        setResolvedName(b.account_name);
                      }}
                    >
                      <View style={styles.benInitials}>
                        <Text style={styles.benInitialsText}>{b.account_name.substring(0, 2).toUpperCase()}</Text>
                      </View>
                      <View>
                        <Text style={styles.benName}>{b.account_name}</Text>
                        <Text style={styles.benBank}>{b.bank_name} · {b.account_number}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={{ marginTop: 24 }}>
              <AppButton label="Next" onPress={handleNext} disabled={!resolvedName} />
            </View>
          </>
        ) : (
          /* Amount step */
          <>
            <View style={styles.recipientHeader}>
              <View style={styles.avatarBig}>
                <Text style={styles.avatarBigText}>{resolvedName.substring(0, 2).toUpperCase()}</Text>
              </View>
              <Text style={styles.headerRecipName}>{resolvedName}</Text>
              <Text style={styles.headerRecipBank}>{bankList.find(b => b.code === selectedBank)?.name} · {accountNo}</Text>
            </View>

            <View style={styles.balCard}>
              <Text style={styles.balCardLabel}>Available Balance</Text>
              <Text style={styles.balCardVal}>{formatNGN(balance)}</Text>
            </View>

            <AppInput
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="numeric"
              prefix="₦"
            />
            {amount ? (
              <View style={styles.feeBreakdown}>
                <View style={styles.feeRow}><Text style={styles.feeLabel}>Transfer Fee</Text><Text style={styles.feeVal}>{formatNGN(fee)}</Text></View>
                <View style={[styles.feeRow, { borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.1)', paddingTop: 12, marginTop: 12 }]}>
                  <Text style={[styles.feeLabel, { color: '#fff' }]}>Total Deducted</Text>
                  <Text style={[styles.feeVal, { color: '#fff', fontFamily: 'BricolageGrotesque_600' }]}>{formatNGN(total)}</Text>
                </View>
              </View>
            ) : null}

            <AppInput
              label="Narration / Note (Optional)"
              value={note}
              onChangeText={setNote}
              placeholder="What's this for?"
            />

            <View style={styles.saveRow}>
              <View>
                <Text style={styles.saveLabel}>Save Beneficiary</Text>
                <Text style={styles.saveSub}>Add to your quick-send list</Text>
              </View>
              <Switch
                value={saveBen}
                onValueChange={setSaveBen}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: Colors.gold2 }}
                thumbColor="#fff"
              />
            </View>

            <AppButton
              label="Review & Send"
              onPress={handleNext}
              disabled={!amount || Number(amount) < 50 || total > balance}
            />
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
  newTransferCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 24 },
  sectionTitle: { fontFamily: 'Inter_600', fontSize: 13, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
  fieldLabel: { fontFamily: 'Inter_500', fontSize: 12, color: '#fff', marginBottom: 8, marginTop: 12 },
  bankSelectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  bankSelectText: { fontFamily: 'Inter_500', fontSize: 15, color: '#fff' },
  bankList: { maxHeight: 200, backgroundColor: '#111', borderRadius: 12, marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' },
  bankListItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  bankListItemText: { fontFamily: 'Inter_400', fontSize: 14, color: '#fff' },
  acctRow: { flexDirection: 'row', gap: 12 },
  acctInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, paddingHorizontal: 16, height: 52, fontFamily: 'Inter_500', fontSize: 15, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  verifyBtn: { backgroundColor: Colors.g2, borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center', alignItems: 'center' },
  verifyBtnText: { fontFamily: 'Inter_600', fontSize: 14, color: '#fff' },
  resolvedBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(16,185,129,0.1)', padding: 12, borderRadius: 12, marginTop: 12 },
  resolvedText: { fontFamily: 'Inter_600', fontSize: 14, color: Colors.greenBright },
  bensSection: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  benRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  benInitials: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  benInitialsText: { fontFamily: 'Inter_600', fontSize: 14, color: '#fff' },
  benName: { fontFamily: 'Inter_500', fontSize: 15, color: '#fff', marginBottom: 4 },
  benBank: { fontFamily: 'Inter_400', fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  recipientHeader: { alignItems: 'center', marginBottom: 32, marginTop: 12 },
  avatarBig: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarBigText: { fontFamily: 'Inter_600', fontSize: 20, color: '#fff' },
  headerRecipName: { fontFamily: 'BricolageGrotesque_600', fontSize: 20, color: '#fff', marginBottom: 4 },
  headerRecipBank: { fontFamily: 'Inter_400', fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  balCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, marginBottom: 24 },
  balCardLabel: { fontFamily: 'Inter_400', fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  balCardVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: '#fff' },
  feeBreakdown: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, padding: 16, marginTop: -8, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feeLabel: { fontFamily: 'Inter_400', fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  feeVal: { fontFamily: 'Inter_500', fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  saveRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, padding: 16, marginVertical: 24 },
  saveLabel: { fontFamily: 'Inter_500', fontSize: 15, color: '#fff', marginBottom: 2 },
  saveSub: { fontFamily: 'Inter_400', fontSize: 12, color: 'rgba(255,255,255,0.5)' },
});
