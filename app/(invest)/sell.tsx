import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';

export default function SellScreen() {
  const router = useRouter();
  const [units, setUnits] = useState('');
  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.container}>
      <AppHeader title="Sell" />
      <View style={styles.body}>
        <Text style={styles.title}>Sell Holdings</Text>
        <Text style={styles.sub}>You hold 120 units of DCEM</Text>
        <AppInput label="Units to Sell" value={units} onChangeText={setUnits} placeholder="0" keyboardType="numeric" />
        <AppButton label="Confirm Sale" onPress={() => { setLoading(true); setTimeout(() => { setLoading(false); router.back(); }, 1500); }} loading={loading} disabled={!units} variant="danger" />
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
