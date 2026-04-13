import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';

export default function WithdrawScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.container}>
      <AppHeader title="Withdraw" />
      <View style={styles.body}>
        <Text style={styles.title}>Withdraw funds</Text>
        <Text style={styles.sub}>Funds will be sent to your Naira wallet</Text>
        <AppInput label="Amount" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" prefix="₦" />
        <View style={styles.warn}>
          <Text style={styles.warnText}>Early withdrawal may forfeit accrued interest for the current period.</Text>
        </View>
        <AppButton label="Withdraw" onPress={() => { setLoading(true); setTimeout(() => { setLoading(false); router.back(); }, 1500); }} loading={loading} disabled={!amount} variant="danger" />
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
