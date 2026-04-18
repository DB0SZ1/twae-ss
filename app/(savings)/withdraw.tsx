import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';
import { withdrawPocket } from '../../controllers/savingsController';

export default function WithdrawScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleWithdraw = async () => {
    setLoading(true);
    try {
      await withdrawPocket(id, pin, parseFloat(amount.replace(/,/g, '')));
      router.back();
    } catch (e: any) {
      alert(e.message || 'Failed to withdraw from pocket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Withdraw" />
      <View style={styles.body}>
        <Text style={styles.title}>Withdraw funds</Text>
        <Text style={styles.sub}>Funds will be sent to your Wallet</Text>
        <AppInput label="Amount" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" prefix="₦" />
        <AppInput label="Transaction PIN" value={pin} onChangeText={setPin} placeholder="****" secureTextEntry keyboardType="numeric" maxLength={6} />
        <View style={styles.warn}>
          <Text style={styles.warnText}>If this is a locked pocket, early withdrawal may forfeit some accrued interest or face a 10% penalty.</Text>
        </View>
        <AppButton label="Withdraw" onPress={handleWithdraw} loading={loading} disabled={!amount || pin.length < 4} variant="danger" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginBottom: 24 },
  warn: { backgroundColor: 'rgba(212,160,23,.06)', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(212,160,23,.1)' },
  warnText: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted, lineHeight: 18 },
});
