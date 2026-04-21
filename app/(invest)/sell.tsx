import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Modal, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';
import { fetchPortfolio, sellAsset } from '../../controllers/investController';
import { fetchQuote } from '../../controllers/marketController';

export default function SellScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [holding, setHolding] = useState<any>(null);
  const [percentage, setPercentage] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchPortfolio().then(port => {
      const found = (port?.holdings || []).find((h: any) => h.asset.id === id);
      setHolding(found);
      setInitLoading(false);
      if (found?.asset?.symbol) {
        fetchQuote(found.asset.symbol).then(price => {
          if (price) setLivePrice(price);
        });
      }
    });
  }, [id]);

  if (initLoading) return <View style={styles.container}><ActivityIndicator style={{marginTop: 50}} color={Colors.g3} /></View>;
  if (!holding) return <View style={styles.container}><Text style={{color: 'white', padding: 20}}>Asset not found in your portfolio.</Text></View>;

  const currentPrice = livePrice || holding.asset.currentPrice || 0;
  const pctNum = Number(percentage) || 0;
  const unitsToSell = (holding.units * (pctNum / 100));
  const estimatedProceeds = unitsToSell * currentPrice;

  const handleSell = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await sellAsset(holding.asset.id, pctNum, pin);
      Alert.alert('Sale Complete', `Successfully sold ${unitsToSell.toFixed(4)} units of ${holding.asset.symbol}`, [
        { text: 'OK', onPress: () => router.back() }
      ]);
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

        <View style={styles.holdingCard}>
          <View style={styles.holdRow}>
            <Text style={styles.holdLbl}>Units Held</Text>
            <Text style={styles.holdVal}>{holding.units.toFixed(4)}</Text>
          </View>
          <View style={styles.holdRow}>
            <Text style={styles.holdLbl}>Live Price</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.holdVal}>${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
              {livePrice && <View style={styles.liveDot} />}
            </View>
          </View>
          <View style={styles.holdRow}>
            <Text style={styles.holdLbl}>Current Value</Text>
            <Text style={styles.holdVal}>${(holding.units * currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>

        <AppInput label="Percentage to Sell (1-100)" value={percentage} onChangeText={setPercentage} placeholder="0" keyboardType="numeric" />
        <AppInput label="Transaction PIN" value={pin} onChangeText={setPin} secureTextEntry keyboardType="numeric" />

        {pctNum > 0 && (
          <View style={styles.proceedsCard}>
            <Text style={styles.proceedsLbl}>ESTIMATED PROCEEDS</Text>
            <Text style={styles.proceedsVal}>${estimatedProceeds.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
            <Text style={styles.proceedsSub}>{unitsToSell.toFixed(4)} units @ ${currentPrice.toLocaleString()}</Text>
          </View>
        )}

        <AppButton label="Review Sale" onPress={() => setShowConfirm(true)} loading={loading} disabled={!percentage || !pin || pctNum <= 0 || pctNum > 100} variant="danger" />
      </View>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Sale</Text>
            <View style={styles.modalRow}><Text style={styles.modalLbl}>Asset</Text><Text style={styles.modalVal}>{holding.asset.name}</Text></View>
            <View style={styles.modalRow}><Text style={styles.modalLbl}>Selling</Text><Text style={styles.modalVal}>{pctNum}% ({unitsToSell.toFixed(4)} units)</Text></View>
            <View style={styles.modalRow}><Text style={styles.modalLbl}>Est. Proceeds</Text><Text style={[styles.modalVal, { color: Colors.greenBright }]}>${estimatedProceeds.toFixed(2)}</Text></View>
            <Text style={styles.modalDisclaimer}>This sell order will be executed at market price. Actual proceeds may differ.</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowConfirm(false)}>
                <Text style={styles.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <AppButton label="Confirm Sale" onPress={handleSell} variant="danger" style={{ flex: 1 }} />
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
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 16 },
  holdingCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: Colors.blackAlpha04 },
  holdRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  holdLbl: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.muted },
  holdVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.text },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.greenBright },
  proceedsCard: { backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,.15)' },
  proceedsLbl: { fontSize: 10, fontFamily: 'Inter_400', color: Colors.muted, letterSpacing: 0.4, marginBottom: 4 },
  proceedsVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: '#ef4444' },
  proceedsSub: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.dim, marginTop: 4 },
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
