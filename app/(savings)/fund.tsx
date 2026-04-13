/**
 * twae — Fund Pocket Screen
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';

export default function FundPocketScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const handleFund = () => { setLoading(true); setTimeout(() => { setLoading(false); router.back(); }, 1500); };

  return (
    <View style={styles.container}>
      <AppHeader title="Fund Pocket" />
      <View style={styles.body}>
        <Text style={styles.title}>How much?</Text>
        <Text style={styles.sub}>From your Naira wallet → House Fund</Text>
        <AppInput label="Amount" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" prefix="₦" />
        <AppButton label="Fund Pocket" onPress={handleFund} loading={loading} disabled={!amount} style={{ marginTop: 16 }} />
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
