/**
 * Twae — Personal Information (real API)
 * GET /auth/me for profile data
 * PUT /auth/me for saving changes
 * Re-fetches profile after save to ensure UI reflects persisted data.
 */
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';
import { getUserProfile, updateProfile } from '../../controllers/authController';

export default function PersonalInfoScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);

  const [data, setData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
  });

  const loadProfile = async () => {
    try {
      const resp = await getUserProfile();
      setData({
        name: resp.full_name || '',
        phone: resp.phone || '',
        email: resp.email || '',
        address: resp.street_address || '',
        city: resp.city || '',
        state: resp.state_province || '',
        postalCode: resp.postal_code || '',
      });
      setKycVerified(resp.kyc_status === 'verified');
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  useEffect(() => {
    loadProfile().finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, any> = {};
      // Only send non-empty fields
      if (data.name.trim()) payload.fullName = data.name.trim();
      if (data.phone.trim()) payload.phone = data.phone.trim();
      if (data.address.trim()) payload.streetAddress = data.address.trim();
      if (data.city.trim()) payload.city = data.city.trim();
      if (data.state.trim()) payload.stateProvince = data.state.trim();
      if (data.postalCode.trim()) payload.postalCode = data.postalCode.trim();

      // Don't send name if KYC verified
      if (kycVerified) delete payload.fullName;

      await updateProfile(payload as any);
      // Re-fetch to confirm persistence
      await loadProfile();
      Alert.alert('Success', 'Your profile has been updated.');
    } catch (err: any) {
      let msg = 'Failed to save changes.';
      if (typeof err === 'string') msg = err;
      else if (err?.detail) msg = err.detail;
      else if (err?.message && typeof err.message === 'string') msg = err.message;
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Personal Information" />
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.g3} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <AppInput
            label={kycVerified ? 'Full Name (Locked — KYC verified)' : 'Full Name'}
            value={data.name}
            onChangeText={(t) => setData({ ...data, name: t })}
            editable={!kycVerified}
          />
          <AppInput
            label="Phone Number"
            value={data.phone}
            onChangeText={(t) => setData({ ...data, phone: t })}
            keyboardType="phone-pad"
          />
          <AppInput
            label="Email Address"
            value={data.email}
            onChangeText={() => {}}
            editable={false}
          />
          <AppInput
            label="Street Address"
            value={data.address}
            onChangeText={(t) => setData({ ...data, address: t })}
          />
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <AppInput
                label="City"
                value={data.city}
                onChangeText={(t) => setData({ ...data, city: t })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppInput
                label="State / Province"
                value={data.state}
                onChangeText={(t) => setData({ ...data, state: t })}
              />
            </View>
          </View>
          <AppInput
            label="Postal Code"
            value={data.postalCode}
            onChangeText={(t) => setData({ ...data, postalCode: t })}
            keyboardType="numeric"
          />
          <AppButton label="Save Changes" onPress={handleSave} loading={saving} style={{ marginTop: 10 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24, paddingBottom: 60 },
  row: { flexDirection: 'row', gap: 12 },
});
