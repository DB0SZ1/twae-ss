/**
 * twae — Create Pocket Screen
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';

const emojis = ['🏠', '✈️', '🛡️', '🎓', '🚗', '💍', '📱', '🎉', '💰', '🏖️'];

export default function CreatePocketScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🏠');
  const [target, setTarget] = useState('');
  const [currency, setCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); router.back(); }, 1500);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="New Pocket" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Create a savings pocket</Text>
        <Text style={styles.sub}>Set a goal and start saving towards it</Text>

        {/* Emoji Picker */}
        <Text style={styles.label}>CHOOSE AN ICON</Text>
        <View style={styles.emojiRow}>
          {emojis.map(e => (
            <TouchableOpacity key={e} style={[styles.emojiBtn, emoji === e && styles.emojiBtnActive]} onPress={() => setEmoji(e)}>
              <Text style={styles.emojiText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <AppInput label="Pocket Name" value={name} onChangeText={setName} placeholder="e.g. House Fund" />
        <AppInput label="Target Amount" value={target} onChangeText={setTarget} placeholder="1,000,000" keyboardType="numeric" prefix={currency === 'NGN' ? '₦' : '$'} />

        {/* Currency Toggle */}
        <View style={styles.currRow}>
          {(['NGN', 'USD'] as const).map(c => (
            <TouchableOpacity key={c} style={[styles.currBtn, currency === c && styles.currBtnActive]} onPress={() => setCurrency(c)}>
              <Text style={[styles.currText, currency === c && styles.currTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <AppButton label="Create Pocket" onPress={handleCreate} loading={loading} disabled={!name || !target} style={{ marginTop: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24, paddingTop: 16 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginBottom: 24 },
  label: { fontSize: 12, fontFamily: 'Inter_500', color: Colors.muted, letterSpacing: 0.5, marginBottom: 10 },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  emojiBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.blackAlpha05 },
  emojiBtnActive: { borderColor: Colors.g3, backgroundColor: 'rgba(50,100,209,.06)' },
  emojiText: { fontSize: 20 },
  currRow: { flexDirection: 'row', gap: 8 },
  currBtn: { flex: 1, height: 44, borderRadius: Radii.pill, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.blackAlpha05 },
  currBtnActive: { backgroundColor: Colors.g2, borderColor: 'transparent' },
  currText: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.muted },
  currTextActive: { color: '#fff' },
});
