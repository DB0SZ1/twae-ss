/**
 * Twae — Biometric Enrollment Screen (real API)
 * Calls POST /auth/enroll-biometric via the authController
 */
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';
import { useRouter } from 'expo-router';
import { enrollBiometric, getOrCreateDeviceId, getUserProfile, updateProfile } from '../../controllers/authController';
import { storage as SecureStore } from '../../utils/storage';
import * as LocalAuthentication from 'expo-local-authentication';

export default function SecurityScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [missingKeys, setMissingKeys] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const profile = await getUserProfile();
      setIsEnrolled(!!profile.biometric_enrolled);

      if (profile.biometric_enrolled) {
        // Did they enroll on a device but lose the local secret? (e.g. before the SecureStore fix)
        const secret = await SecureStore.getItemAsync('twa_biometric_secret');
        if (!secret) {
          setMissingKeys(true);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollment = async (isReEnroll = false) => {
    setEnrolling(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isSystemEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isSystemEnrolled) {
        Alert.alert('Unsupported', 'Your device does not have biometrics hardware or it is not enrolled.');
        setEnrolling(false);
        return;
      }

      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify identity to enable Biometric Login',
        fallbackLabel: 'Use PIN',
      });

      if (!authResult.success) {
        setEnrolling(false);
        return;
      }

      const deviceId = await getOrCreateDeviceId();
      const biometricType: 'face' | 'fingerprint' = Platform.OS === 'ios' ? 'face' : 'fingerprint';
      const result = await enrollBiometric(deviceId, biometricType);

      if (result.success) {
        if (result.biometric_secret) {
          await SecureStore.setItemAsync('twa_biometric_secret', result.biometric_secret);
        }
        // Explicitly sync the profile flag to be sure
        await updateProfile({ biometric_enrolled: true });
        
        setIsEnrolled(true);
        setMissingKeys(false);
        if (!isReEnroll) {
          Alert.alert('Success', 'Biometrics enrolled successfully!', [{ text: 'OK', onPress: () => router.back() }]);
        }
      }
    } catch (err: any) {
      let msg = 'Failed to enroll biometrics.';
      if (typeof err === 'string') msg = err;
      else if (err?.detail) msg = err.detail;
      else if (err?.message && typeof err.message === 'string') msg = err.message;
      Alert.alert('Enrollment Error', msg);
    } finally {
      setEnrolling(false);
    }
  };

  const handleRemove = async () => {
    setEnrolling(true);
    try {
      await updateProfile({ biometric_enrolled: false });
      await SecureStore.deleteItemAsync('twa_biometric_secret');
      setIsEnrolled(false);
      setMissingKeys(false);
      Alert.alert('Removed', 'Biometric login has been disabled.');
    } catch {
      Alert.alert('Error', 'Failed to remove biometrics. Try again later.');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Biometrics" />
        <View style={styles.body}>
          <ActivityIndicator color={Colors.gsheen} />
        </View>
      </View>
    );
  }

  const noun = Platform.OS === 'ios' ? 'Face ID' : 'Fingerprint';

  return (
    <View style={styles.container}>
      <AppHeader title="Biometrics" />
      <View style={styles.body}>
        
        {isEnrolled && !missingKeys ? (
          <>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(74,222,128,.1)' }]}>
              <Ionicons name="shield-checkmark" size={60} color={Colors.greenBright} />
            </View>
            <Text style={styles.title}>{noun} Enabled</Text>
            <Text style={styles.desc}>
              You can securely securely log in and approve transactions using your biometrics.
            </Text>
            <View style={styles.spacer} />
            <AppButton label={`Remove ${noun}`} onPress={handleRemove} variant="ghost" loading={enrolling} />
          </>
        ) : isEnrolled && missingKeys ? (
          <>
            <View style={[styles.iconWrap, { backgroundColor: 'rgba(239,68,68,.1)' }]}>
              <Ionicons name="warning" size={60} color={Colors.red} />
            </View>
            <Text style={styles.title}>Action Required</Text>
            <Text style={styles.desc}>
              Your {noun} is out of sync on this device. You need to re-enroll to restore biometric login functionality.
            </Text>
            <View style={styles.spacer} />
            <AppButton label="Re-Enroll Biometrics" onPress={() => handleEnrollment(true)} loading={enrolling} />
            <AppButton label={`Remove ${noun}`} onPress={handleRemove} variant="ghost" style={{ marginTop: 12 }} />
          </>
        ) : (
          <>
            <View style={styles.iconWrap}>
              <Ionicons name="finger-print" size={60} color={Colors.gsheen} />
            </View>
            <Text style={styles.title}>Enable {noun}</Text>
            <Text style={styles.desc}>
              Use your device's native biometrics to securely log into your Twae account without typing your PIN every time.
            </Text>
            <View style={styles.spacer} />
            <AppButton label="Enroll Biometrics" onPress={() => handleEnrollment(false)} loading={enrolling} />
            <AppButton label="Not Now" onPress={() => router.back()} variant="ghost" style={{ marginTop: 12 }} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24, flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconWrap: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(50,100,209,.06)', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, textAlign: 'center', marginBottom: 12 },
  desc: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, textAlign: 'center', lineHeight: 22 },
  spacer: { flex: 1 },
});
