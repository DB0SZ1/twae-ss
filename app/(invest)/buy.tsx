import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';

export default function BuyScreen() {
  const router = useRouter();
  const [units, setUnits] = useState('');
  const [loading, setLoading] = useState(false);
  const price = 1240.50;
  const total = units ? (parseFloat(units) * price).toLocaleString() : '0.00';

  return (
    <View style={styles.container}>
      <AppHeader title="Buy DCEM" />
      <View style={styles.body}>
        <Text style={styles.title}>Buy Dangote Cement</Text>
        <Text style={styles.sub}>Current Price: ₦{price.toLocaleString()}</Text>
        <AppInput label="Number of Units" value={units} onChangeText={setUnits} placeholder="0" keyboardType="numeric" />
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>ESTIMATED TOTAL</Text>
          <Text style={styles.totalVal}>₦{total}</Text>
        </View>
        <AppButton label="Confirm Purchase" onPress={() => { setLoading(true); setTimeout(() => { setLoading(false); router.back(); }, 2000); }} loading={loading} disabled={!units} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginBottom: 24 },
  totalCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.blackAlpha04 },
  totalLabel: { fontSize: 10, fontFamily: 'Inter_400', color: Colors.muted, letterSpacing: 0.4, marginBottom: 4 },
  totalVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.greenBright },
});
