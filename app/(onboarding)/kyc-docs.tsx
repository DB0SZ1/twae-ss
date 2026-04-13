/**
 * twae — KYC Documents Upload Screen
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii, Shadows } from '../../constants/theme';

export default function KYCDocsScreen() {
  const router = useRouter();
  const [idFront, setIdFront] = useState(false);
  const [idBack, setIdBack] = useState(false);
  const [selfie, setSelfie] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/(tabs)');
    }, 2500);
  };

  const DocSlot = ({ label, done, onPress }: { label: string; done: boolean; onPress: () => void }) => (
    <TouchableOpacity style={[styles.docSlot, done && styles.docSlotDone]} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.docIcon, done && styles.docIconDone]}>
        <Ionicons name={done ? 'checkmark' : 'camera'} size={24} color={done ? '#fff' : Colors.g3} />
      </View>
      <Text style={styles.docLabel}>{label}</Text>
      <Text style={styles.docStatus}>{done ? 'Captured ✓' : 'Tap to capture'}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <AppHeader title="Document Upload" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Upload documents</Text>
        <Text style={styles.sub}>Take photos of your government-issued ID and a selfie for liveness verification.</Text>

        <DocSlot label="ID Card — Front" done={idFront} onPress={() => setIdFront(true)} />
        <DocSlot label="ID Card — Back" done={idBack} onPress={() => setIdBack(true)} />
        <DocSlot label="Selfie" done={selfie} onPress={() => setSelfie(true)} />

        <AppButton
          label="Submit for Review"
          onPress={handleSubmit}
          loading={loading}
          disabled={!idFront || !idBack || !selfie}
          style={{ marginTop: 16 }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 24, paddingTop: 16 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, lineHeight: 20, marginBottom: 24 },
  docSlot: { borderRadius: 16, borderWidth: 1.5, borderColor: Colors.blackAlpha05, borderStyle: 'dashed', padding: 20, alignItems: 'center', marginBottom: 14, backgroundColor: Colors.surface },
  docSlotDone: { borderColor: Colors.greenBright, borderStyle: 'solid', backgroundColor: 'rgba(34,197,94,.04)' },
  docIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(50,100,209,.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  docIconDone: { backgroundColor: Colors.greenBright },
  docLabel: { fontFamily: 'BricolageGrotesque_600', fontSize: 15, color: Colors.text, marginBottom: 4 },
  docStatus: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted },
});
