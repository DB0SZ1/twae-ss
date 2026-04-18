import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';
import { fetchPortfolio, sellAsset } from '../../controllers/investController';

export default function SellScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [holding, setHolding] = useState<any>(null);
  const [percentage, setPercentage] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio().then(port => {
      const found = (port?.holdings || []).find((h: any) => h.asset.id === id);
      setHolding(found);
      setInitLoading(false);
    });
  }, [id]);

  if (initLoading) return <View style={styles.container}><ActivityIndicator style={{marginTop: 50}} color={Colors.g3} /></View>;
  if (!holding) return <View style={styles.container}><Text style={{color: 'white', padding: 20}}>Asset not found in your portfolio.</Text></View>;

  const handleSell = async () => {
      setLoading(true);
      try {
          await sellAsset(holding.asset.id, Number(percentage), pin);
          router.back();
      } catch (err: any) {
          console.warn("Sell failed:", err);
          Alert.alert('Sale Failed', err.message || 'Transaction failed');
      } finally {
          setLoading(false);
      }
  };

  return (
    <View style={styles.container}>
      <AppHeader title={`Sell ${holding.asset.symbol}`} />
      <View style={styles.body}>
        <Text style={styles.title}>Sell {holding.asset.name}</Text>
        <Text style={styles.sub}>You hold {holding.units.toFixed(4)} units</Text>
        <AppInput label="Percentage to Sell (1-100)" value={percentage} onChangeText={setPercentage} placeholder="0" keyboardType="numeric" />
        <AppInput label="Transaction PIN (e.g. 142536)" value={pin} onChangeText={setPin} secureTextEntry keyboardType="numeric" />
        <AppButton label={`Confirm Sale`} onPress={handleSell} loading={loading} disabled={!percentage || !pin} variant="danger" />
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
