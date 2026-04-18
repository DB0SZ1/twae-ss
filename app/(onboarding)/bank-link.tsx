/**
 * twae — Bank Linking Screen (Screen 1.6)
 * US → Plaid Link SDK, Africa → Flutterwave bank list
 * Account verification, skip option, success state
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';
import {
  detectRegion,
  fetchBankList,
  verifyBankAccount,
  linkBankAccount,
  exchangePlaidToken,
  type AfricanBank,
} from '../../controllers/bankController';

export default function BankLinkScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string; countryCode?: string }>();
  const region = detectRegion(params.countryCode || 'NG');

  // Africa flow state
  const [banks, setBanks] = useState<AfricanBank[]>([]);
  const [selectedBank, setSelectedBank] = useState<AfricanBank | null>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [linking, setLinking] = useState(false);
  const [linked, setLinked] = useState(false);
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [error, setError] = useState('');

  // US Plaid flow state
  const [plaidLoading, setPlaidLoading] = useState(false);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    if (region === 'africa') {
      loadBanks();
    }
  }, []);

  const loadBanks = async () => {
    const list = await fetchBankList(params.countryCode || 'NG');
    setBanks(list);
  };

  // Africa: verify account name
  const handleAccountVerify = async () => {
    if (!selectedBank || accountNumber.length < 10) return;
    setVerifying(true);
    setError('');
    setAccountName('');

    try {
      const result = await verifyBankAccount(accountNumber, selectedBank.code);
      if (result.success) {
        setAccountName(result.accountName);
        setVerified(true);
      } else {
        setError('Could not verify account. Check details and try again.');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  // Africa: link account
  const handleLinkAfricaBank = async () => {
    if (!selectedBank || !accountNumber || !accountName) return;
    setLinking(true);
    try {
      const result = await linkBankAccount(
        params.userId || '',
        selectedBank.code,
        accountNumber,
        accountName
      );
      if (result.success) {
        setLinked(true);
        Animated.spring(successScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }).start();
      }
    } catch {
      setError('Failed to link account. Please try again.');
    } finally {
      setLinking(false);
    }
  };

  // US: open Plaid Link
  const handlePlaidLink = async () => {
    setPlaidLoading(true);
    try {
      // In production: PlaidLink.openLink()
      // Simulate Plaid success
      const mockToken = 'plaid_public_token_mock';
      const result = await exchangePlaidToken(params.userId || '', mockToken);
      if (result.success) {
        setLinked(true);
        Animated.spring(successScale, {
          toValue: 1,
          tension: 60,
          friction: 6,
          useNativeDriver: true,
        }).start();
      }
    } catch {
      setError('Plaid connection failed. Please try again.');
    } finally {
      setPlaidLoading(false);
    }
  };

  const handleSkip = () => {
    navigateNext();
  };

  const handleContinue = () => {
    navigateNext();
  };

  const navigateNext = () => {
    router.push({
      pathname: '/(onboarding)/investment-options',
      params: { userId: params.userId, countryCode: params.countryCode },
    });
  };

  const filteredBanks = bankSearch
    ? banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()))
    : banks;

  // Success state
  if (linked) {
    return (
      <View style={styles.container}>
        <AppHeader title="Bank Linked" />
        <Animated.View style={[styles.successContent, { opacity: fadeIn }]}>
          <Animated.View style={[styles.successWrap, { transform: [{ scale: successScale }] }]}>
            <View style={styles.successCircle}>
              <Ionicons name="checkmark" size={40} color="#fff" />
            </View>
            <Text style={styles.successTitle}>Bank account linked!</Text>
            <View style={styles.linkedInfoCard}>
              <Ionicons name="business-outline" size={20} color={Colors.g3} />
              <View style={styles.linkedInfoText}>
                <Text style={styles.linkedBankName}>
                  {region === 'africa' ? selectedBank?.name || 'Bank' : 'Your Bank Account'}
                </Text>
                <Text style={styles.linkedAccountMask}>
                  {region === 'africa'
                    ? `****${accountNumber.slice(-4)}`
                    : '****1234'
                  }
                </Text>
              </View>
            </View>
            <AppButton
              label="Continue"
              onPress={handleContinue}
              style={{ marginTop: 32, width: '100%' }}
            />
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Link Bank Account" />
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeIn }}>
          <Text style={styles.title}>Link your bank account</Text>
          <Text style={styles.sub}>
            {region === 'us'
              ? 'Connect your US bank account securely through Plaid.'
              : 'Select your bank and enter your account details to link.'}
          </Text>

          {/* US — Plaid Link */}
          {region === 'us' && (
            <View style={styles.plaidSection}>
              <TouchableOpacity
                style={styles.plaidCard}
                onPress={handlePlaidLink}
                activeOpacity={0.85}
                disabled={plaidLoading}
              >
                <LinearGradient
                  colors={['#0A7CFF', '#45A5FF']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.plaidGradient}
                >
                  <Ionicons name="link" size={28} color="#fff" />
                  <Text style={styles.plaidTitle}>Connect with Plaid</Text>
                  <Text style={styles.plaidSubtitle}>
                    Securely link your bank account using Plaid's encrypted connection
                  </Text>
                  {plaidLoading && (
                    <Text style={styles.plaidLoading}>Opening Plaid Link…</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <View style={styles.plaidBadges}>
                <View style={styles.badge}><Ionicons name="lock-closed" size={12} color={Colors.greenBright} /><Text style={styles.badgeText}>256-bit Encrypted</Text></View>
                <View style={styles.badge}><Ionicons name="shield-checkmark" size={12} color={Colors.greenBright} /><Text style={styles.badgeText}>Bank-Level Security</Text></View>
              </View>
            </View>
          )}

          {/* Africa — Bank List + Account */}
          {region === 'africa' && (
            <View style={styles.africaSection}>
              {/* Bank selector */}
              <Text style={styles.inputLabel}>Select Bank</Text>
              <TouchableOpacity
                style={styles.bankSelector}
                onPress={() => setShowBankPicker(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="business-outline" size={18} color={selectedBank ? Colors.text : Colors.dim} />
                <Text style={[styles.bankSelectorText, !selectedBank && styles.bankSelectorPlaceholder]}>
                  {selectedBank?.name || 'Choose your bank'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={Colors.dim} />
              </TouchableOpacity>

              {/* Account number */}
              <AppInput
                label="Account number"
                value={accountNumber}
                onChangeText={(text) => {
                  setAccountNumber(text.replace(/\D/g, ''));
                  setVerified(false);
                  setAccountName('');
                }}
                placeholder="0123456789"
                keyboardType="number-pad"
                maxLength={10}
              />

              {/* Verify button */}
              {selectedBank && accountNumber.length >= 10 && !verified && (
                <AppButton
                  label="Verify Account"
                  onPress={handleAccountVerify}
                  loading={verifying}
                  variant="secondary"
                  size="md"
                  style={{ marginBottom: 16 }}
                />
              )}

              {/* Verified account name */}
              {verified && accountName && (
                <View style={styles.verifiedCard}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.greenBright} />
                  <View>
                    <Text style={styles.verifiedLabel}>Account Name</Text>
                    <Text style={styles.verifiedName}>{accountName}</Text>
                  </View>
                </View>
              )}

              {verified && (
                <AppButton
                  label="Link Account"
                  onPress={handleLinkAfricaBank}
                  loading={linking}
                  style={{ marginTop: 8 }}
                />
              )}
            </View>
          )}

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.red} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Skip option */}
          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>Skip — I'll link later from Profile</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Bank Picker Modal */}
      <Modal visible={showBankPicker} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Bank</Text>
              <TouchableOpacity onPress={() => setShowBankPicker(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={18} color={Colors.dim} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search banks…"
                placeholderTextColor={Colors.dim}
                value={bankSearch}
                onChangeText={setBankSearch}
                autoFocus
              />
            </View>

            <ScrollView>
              {filteredBanks.map(bank => (
                <TouchableOpacity
                  key={bank.id}
                  style={[
                    styles.bankItem,
                    selectedBank?.id === bank.id && styles.bankItemActive,
                  ]}
                  onPress={() => {
                    setSelectedBank(bank);
                    setShowBankPicker(false);
                    setBankSearch('');
                    setVerified(false);
                    setAccountName('');
                  }}
                >
                  <View style={styles.bankIcon}>
                    <Ionicons name="business" size={18} color={Colors.g3} />
                  </View>
                  <Text style={styles.bankName}>{bank.name}</Text>
                  {selectedBank?.id === bank.id && (
                    <Ionicons name="checkmark-circle" size={20} color={Colors.g3} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 24, paddingTop: 16 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, lineHeight: 20, marginBottom: 24 },

  // Plaid
  plaidSection: { marginBottom: 24 },
  plaidCard: { borderRadius: 20, overflow: 'hidden', marginBottom: 12 },
  plaidGradient: { padding: 24, alignItems: 'center', gap: 10 },
  plaidTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 20, color: '#fff' },
  plaidSubtitle: { fontFamily: 'Inter_400', fontSize: 13, color: 'rgba(255,255,255,.7)', textAlign: 'center' },
  plaidLoading: { fontFamily: 'Inter_400', fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 8 },
  plaidBadges: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeText: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.muted },

  // Africa
  africaSection: { marginBottom: 16 },
  inputLabel: { fontFamily: 'Inter_500', fontSize: 12, color: Colors.muted, marginBottom: 7, letterSpacing: 0.5, textTransform: 'uppercase' },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: Radii.sm,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: Colors.blackAlpha04,
    gap: 10,
    marginBottom: 16,
  },
  bankSelectorText: { flex: 1, fontFamily: 'Inter_500', fontSize: 15, color: Colors.text },
  bankSelectorPlaceholder: { color: Colors.dim },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(34,197,94,.04)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,.12)',
  },
  verifiedLabel: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.muted },
  verifiedName: { fontFamily: 'Inter_600', fontSize: 14, color: Colors.text },

  // Error
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(239,68,68,.06)', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.red, flex: 1 },

  // Skip
  skipBtn: { alignItems: 'center', paddingVertical: 20 },
  skipText: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.dim },

  // Success
  successContent: { flex: 1, paddingHorizontal: 24, paddingTop: 40, alignItems: 'center' },
  successWrap: { alignItems: 'center', width: '100%' },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.greenBright,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: Colors.greenBright,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  successTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 22, color: Colors.text, marginBottom: 16 },
  linkedInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.blackAlpha04,
  },
  linkedInfoText: { flex: 1 },
  linkedBankName: { fontFamily: 'Inter_600', fontSize: 15, color: Colors.text },
  linkedAccountMask: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.muted, marginTop: 2 },

  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 20, color: Colors.text },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: Radii.sm,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.blackAlpha04,
  },
  searchInput: { flex: 1, fontFamily: 'Inter_400', fontSize: 14, color: Colors.text, paddingVertical: 0 },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.blackAlpha04,
    gap: 12,
  },
  bankItemActive: { backgroundColor: 'rgba(50,100,209,.04)' },
  bankIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(50,100,209,.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankName: { flex: 1, fontFamily: 'Inter_500', fontSize: 15, color: Colors.text },
});
