import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';

export default function AutoSaveScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [freq, setFreq] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.container}>
      <AppHeader title="Auto-Save" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.title}>Set up auto-save</Text>
        <Text style={styles.sub}>Automatically save money on a schedule</Text>
        <AppInput label="Amount" value={amount} onChangeText={setAmount} placeholder="0.00" keyboardType="numeric" prefix="₦" />
        <Text style={styles.label}>FREQUENCY</Text>
        <View style={styles.freqRow}>
          {(['daily', 'weekly', 'monthly'] as const).map(f => (
            <TouchableOpacity key={f} style={[styles.freqBtn, freq === f && styles.freqBtnActive]} onPress={() => setFreq(f)}>
              <Text style={[styles.freqText, freq === f && styles.freqTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <AppButton label="Save Settings" onPress={() => { setLoading(true); setTimeout(() => { setLoading(false); router.back(); }, 1200); }} loading={loading} style={{ marginTop: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginBottom: 24 },
  label: { fontSize: 12, fontFamily: 'Inter_500', color: Colors.muted, letterSpacing: 0.5, marginBottom: 10 },
  freqRow: { flexDirection: 'row', gap: 8 },
  freqBtn: { flex: 1, height: 44, borderRadius: Radii.pill, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.blackAlpha05 },
  freqBtnActive: { backgroundColor: Colors.g2, borderColor: 'transparent' },
  freqText: { fontFamily: 'BricolageGrotesque_600', fontSize: 13, color: Colors.muted },
  freqTextActive: { color: '#fff' },
});
