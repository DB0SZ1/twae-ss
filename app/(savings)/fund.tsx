/**
 * twae — Fund Pocket Screen
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';
import { fundPocket } from '../../controllers/savingsController';

export default function FundPocketScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFund = async () => {
    setLoading(true);
    try {
      await fundPocket(id, parseFloat(amount.replace(/,/g, '')), 'wallet', pin);
      router.back();
    } catch (e: any) {
      alert(e.message || 'Failed to fund pocket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Fund Pocket" />
      <View style={styles.body}>
        <Text style={styles.title}>How much?</Text>
        <Text style={styles.sub}>From your Wallet to Pocket</Text>
        <AppInput label="Amount" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" prefix="₦" />
        <AppInput label="Transaction PIN" value={pin} onChangeText={setPin} placeholder="****" secureTextEntry keyboardType="numeric" maxLength={6} />
        <AppButton label="Fund Pocket" onPress={handleFund} loading={loading} disabled={!amount || pin.length < 4} style={{ marginTop: 16 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginBottom: 24 },
});
