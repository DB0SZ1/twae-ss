import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Modal, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';
import { fetchAssets, buyAsset } from '../../controllers/investController';
import { fetchQuote } from '../../controllers/marketController';

export default function BuyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [asset, setAsset] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  useEffect(() => {
    fetchAssets().then(assets => {
      const found = assets.find((a: any) => a.id === id);
      setAsset(found);
      setInitLoading(false);
      // Fetch live price for this asset
      if (found?.symbol) {
        fetchQuote(found.symbol).then(price => {
          if (price) setLivePrice(price);
        });
      }
    });
  }, [id]);

  // Refresh live price every 30s
  useEffect(() => {
    if (!asset?.symbol) return;
    const interval = setInterval(() => {
      fetchQuote(asset.symbol).then(price => {
        if (price) setLivePrice(price);
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [asset?.symbol]);

  if (initLoading) return <View style={styles.container}><ActivityIndicator style={{marginTop: 50}} color={Colors.g3} /></View>;
  if (!asset) return <View style={styles.container}><Text style={{color: 'white', padding: 20}}>Asset not found.</Text></View>;

  const currentPrice = livePrice || asset.currentPrice;
  const units = amount && !isNaN(Number(amount)) ? (Number(amount) / currentPrice).toFixed(6) : '0.000000';

  const handleBuy = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const result = await buyAsset(asset.id, Number(amount), asset.currency, pin);
      setOrderResult(result);
    } catch (err: any) {
      console.warn("Buy failed:", err);
      Alert.alert('Purchase Failed', err.message || 'Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  if (orderResult) {
    return (
      <View style={styles.container}>
        <AppHeader title="Order Placed" />
        <View style={styles.resultBody}>
          <View style={styles.resultIcon}>
            <Text style={{ fontSize: 40 }}>{'✓'}</Text>
          </View>
          <Text style={styles.resultTitle}>Order Submitted</Text>
          <Text style={styles.resultSub}>Your fractional buy order for {asset.symbol} has been sent to the exchange.</Text>
          <View style={styles.resultCard}>
            <View style={styles.resultRow}><Text style={styles.resLbl}>Asset</Text><Text style={styles.resVal}>{asset.name}</Text></View>
            <View style={styles.resultRow}><Text style={styles.resLbl}>Amount</Text><Text style={styles.resVal}>${Number(amount).toFixed(2)}</Text></View>
            <View style={styles.resultRow}><Text style={styles.resLbl}>Est. Units</Text><Text style={styles.resVal}>{units}</Text></View>
            <View style={styles.resultRow}><Text style={styles.resLbl}>Status</Text><Text style={[styles.resVal, { color: Colors.greenBright }]}>{orderResult.status || 'pending'}</Text></View>
          </View>
          <AppButton label="Done" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title={`Buy ${asset.symbol}`} />
      <View style={styles.body}>
        <Text style={styles.title}>Buy {asset.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.sub}>Live Price:</Text>
          <Text style={styles.livePriceTxt}>${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          {livePrice && <View style={styles.liveDot} />}
        </View>

        <AppInput label={`Amount to Invest (${asset.currency})`} value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" />
        <AppInput label="Transaction PIN" value={pin} onChangeText={setPin} secureTextEntry keyboardType="numeric" />

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>ESTIMATED UNITS RECEIVED</Text>
          <Text style={styles.totalVal}>{units}</Text>
          <Text style={styles.totalSub}>@ ${currentPrice.toLocaleString()} per unit</Text>
        </View>

        <AppButton label="Review Order" onPress={() => setShowConfirm(true)} loading={loading} disabled={!amount || !pin || Number(amount) <= 0} />
      </View>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Purchase</Text>
            <View style={styles.modalRow}><Text style={styles.modalLbl}>Asset</Text><Text style={styles.modalVal}>{asset.name} ({asset.symbol})</Text></View>
            <View style={styles.modalRow}><Text style={styles.modalLbl}>Amount</Text><Text style={styles.modalVal}>${Number(amount || 0).toFixed(2)}</Text></View>
            <View style={styles.modalRow}><Text style={styles.modalLbl}>Units</Text><Text style={styles.modalVal}>{units}</Text></View>
            <View style={styles.modalRow}><Text style={styles.modalLbl}>Price</Text><Text style={styles.modalVal}>${currentPrice.toLocaleString()}</Text></View>
            <Text style={styles.modalDisclaimer}>This order will be executed as a market order. Actual fill price may differ slightly.</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowConfirm(false)}>
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <AppButton label="Confirm Buy" onPress={handleBuy} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted },
  livePriceTxt: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: Colors.greenBright },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.greenBright },
  totalCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: Colors.blackAlpha04 },
  totalLabel: { fontSize: 10, fontFamily: 'Inter_400', color: Colors.muted, letterSpacing: 0.4, marginBottom: 4 },
  totalVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.greenBright },
  totalSub: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.dim, marginTop: 4 },
  // Result
  resultBody: { padding: 24, alignItems: 'center' },
  resultIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(74,222,128,.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  resultTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 22, color: Colors.text, marginBottom: 8 },
  resultSub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, textAlign: 'center', marginBottom: 24 },
  resultCard: { width: '100%', backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: Colors.blackAlpha04 },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  resLbl: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.muted },
  resVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.text },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,.7)', justifyContent: 'center', paddingHorizontal: 24 },
  modalCard: { backgroundColor: Colors.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: Colors.blackAlpha04 },
  modalTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 20, color: Colors.text, marginBottom: 16, textAlign: 'center' },
  modalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,.04)' },
  modalLbl: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.muted },
  modalVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.text },
  modalDisclaimer: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.dim, marginTop: 12, textAlign: 'center' },
  modalCancelBtn: { flex: 0.6, alignItems: 'center', justifyContent: 'center', borderRadius: Radii.pill, borderWidth: 1, borderColor: 'rgba(255,255,255,.1)', paddingVertical: 14 },
  modalCancelTxt: { fontFamily: 'Inter_600', fontSize: 14, color: Colors.muted },
});
