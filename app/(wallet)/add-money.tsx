import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';

export default function AddMoneyScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  return (
    <View style={styles.container}>
      <AppHeader title="Add Money" />
      <View style={styles.body}>
        <Text style={styles.title}>Fund your wallet</Text>
        <Text style={styles.sub}>Transfer from your bank to your twae Naira wallet</Text>
        <View style={styles.acctCard}>
          <Text style={styles.acctLabel}>YOUR ACCOUNT DETAILS</Text>
          <Text style={styles.acctVal}>0123456789</Text>
          <Text style={styles.acctBank}>GTBank · Naira Wallet</Text>
        </View>
        <Text style={styles.hint}>Transfer to this account number from your bank app. Funds arrive instantly.</Text>
        <AppButton label="I've Sent The Money" onPress={() => router.back()} style={{ marginTop: 20 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginBottom: 24 },
  acctCard: { backgroundColor: 'rgba(50,100,209,.04)', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: 'rgba(50,100,209,.08)', marginBottom: 16 },
  acctLabel: { fontSize: 10, fontFamily: 'Inter_400', color: Colors.muted, letterSpacing: 0.6, marginBottom: 8 },
  acctVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 28, color: Colors.g2, letterSpacing: 2 },
  acctBank: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted, marginTop: 6 },
  hint: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.dim, lineHeight: 18 },
});
