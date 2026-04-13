/**
 * twae — Create PIN Screen
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import PINPad from '../../components/atoms/PINPad';
import { usePIN } from '../../hooks/usePIN';
import { Colors } from '../../constants/theme';

export default function CreatePINScreen() {
  const router = useRouter();
  const { digits, addDigit, deleteDigit, isComplete, length } = usePIN({ length: 6, correctPIN: '' });

  React.useEffect(() => {
    if (isComplete) {
      router.push({ pathname: '/(onboarding)/confirm-pin', params: { pin: digits.join('') } });
    }
  }, [isComplete]);

  return (
    <View style={styles.container}>
      <AppHeader title="Create PIN" />
      <View style={styles.content}>
        <Text style={styles.title}>Set your PIN</Text>
        <Text style={styles.sub}>Create a 6-digit PIN for transactions and login</Text>
        <PINPad length={6} digits={digits} onDigitPress={addDigit} onDelete={deleteDigit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32, alignItems: 'center' },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginBottom: 40, textAlign: 'center' },
});
