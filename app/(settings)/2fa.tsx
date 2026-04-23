import React, { useState } from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TwoFactorAuthScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEnable = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Two-Factor Auth" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark" size={64} color={Colors.greenBright} />
        </View>
        <Text style={styles.title}>Secure your account</Text>
        <Text style={styles.desc}>Add an extra layer of security to your twae account using an Authenticator app (like Google Authenticator or Authy).</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Setup Instructions:</Text>
          <Text style={styles.infoStep}>1. Download an authenticator app.</Text>
          <Text style={styles.infoStep}>2. Scan the QR code we will show you next.</Text>
          <Text style={styles.infoStep}>3. Enter the 6-digit code to confirm.</Text>
        </View>

        <AppButton label="Enable 2FA" onPress={handleEnable} loading={loading} style={{marginTop: 30}} />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24, alignItems: 'center' },
  iconWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(74,222,128,.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, marginBottom: 10, color: Colors.text },
  desc: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, textAlign: 'center', lineHeight: 22 },
  infoBox: { backgroundColor: Colors.surface, padding: 16, borderRadius: 12, marginTop: 20, width: '100%', borderWidth: 1, borderColor: Colors.blackAlpha05 },
  infoTitle: { fontFamily: 'Inter_500', fontSize: 13, color: Colors.text, marginBottom: 8 },
  infoStep: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.muted, marginBottom: 4 },
});
