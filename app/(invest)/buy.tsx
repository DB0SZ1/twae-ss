import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';
import { fetchAssets, buyAsset } from '../../controllers/investController';

export default function BuyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [asset, setAsset] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    fetchAssets().then(assets => {
      const found = assets.find((a: any) => a.id === id);
      setAsset(found);
      setInitLoading(false);
    });
  }, [id]);

  if (initLoading) return <View style={styles.container}><ActivityIndicator style={{marginTop: 50}} color={Colors.g3} /></View>;
  if (!asset) return <View style={styles.container}><Text style={{color: 'white', padding: 20}}>Asset not found.</Text></View>;

  const units = amount && !isNaN(Number(amount)) ? (Number(amount) / asset.currentPrice).toFixed(4) : '0.0000';

  const handleBuy = async () => {
      setLoading(true);
      try {
          await buyAsset(asset.id, Number(amount), asset.currency, pin);
          router.back();
      } catch (err: any) {
          console.warn("Buy failed:", err);
          Alert.alert('Purchase Failed', err.message || 'Transaction failed');
      } finally {
          setLoading(false);
      }
  };

  return (
    <View style={styles.container}>
      <AppHeader title={`Buy ${asset.symbol}`} />
      <View style={styles.body}>
        <Text style={styles.title}>Buy {asset.name}</Text>
        <Text style={styles.sub}>Current Price: {asset.currency} {asset.currentPrice.toLocaleString()}</Text>
        <AppInput label={`Amount to Invest (${asset.currency})`} value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" />
        <AppInput label="Transaction PIN (e.g. 142536)" value={pin} onChangeText={setPin} secureTextEntry keyboardType="numeric" />
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>ESTIMATED UNITS RECEIVED</Text>
          <Text style={styles.totalVal}>{units}</Text>
        </View>
        <AppButton label="Confirm Purchase" onPress={handleBuy} loading={loading} disabled={!amount || !pin} />
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
