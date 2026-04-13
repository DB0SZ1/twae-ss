import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';

export default function ScheduleTransferScreen() {
  const router = useRouter();
  const [freq, setFreq] = useState<'once' | 'daily' | 'weekly' | 'monthly'>('once');
  return (
    <View style={styles.container}>
      <AppHeader title="Schedule Transfer" />
      <View style={styles.body}>
        <Text style={styles.title}>Schedule a transfer</Text>
        <Text style={styles.sub}>Set up a one-time or recurring transfer</Text>
        <Text style={styles.label}>FREQUENCY</Text>
        <View style={styles.row}>
          {(['once', 'daily', 'weekly', 'monthly'] as const).map(f => (
            <TouchableOpacity key={f} style={[styles.btn, freq === f && styles.btnActive]} onPress={() => setFreq(f)}>
              <Text style={[styles.btnText, freq === f && styles.btnTextActive]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <AppInput label="Start Date" value="" placeholder="DD/MM/YYYY" />
        <AppButton label="Schedule" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginBottom: 24 },
  label: { fontSize: 12, fontFamily: 'Inter_500', color: Colors.muted, letterSpacing: 0.5, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 6, marginBottom: 24, flexWrap: 'wrap' },
  btn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: Radii.pill, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.blackAlpha05 },
  btnActive: { backgroundColor: Colors.g2, borderColor: 'transparent' },
  btnText: { fontFamily: 'Inter_500', fontSize: 12, color: Colors.muted },
  btnTextActive: { color: '#fff' },
});
