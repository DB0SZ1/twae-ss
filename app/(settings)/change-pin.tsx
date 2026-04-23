import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';
import { useRouter } from 'expo-router';

export default function ChangePinScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleUpdate = async () => {
    if (newPin.length !== 6 || confirmPin.length !== 6) {
      setErrorMsg('PINs must be exactly 6 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setErrorMsg('New PINs do not match');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    try {
      // The backend simply creates or overwrites the PIN
      const { createPIN } = require('../../controllers/authController');
      const { storage } = require('../../utils/storage');
      const userId = await storage.getItemAsync('twa_user_id');
      
      const res = await createPIN({ userId: userId || '', pin: newPin });
      if (res.success) {
        setLoading(false);
        router.back();
      } else {
        setErrorMsg('Failed to update PIN');
        setLoading(false);
      }
    } catch {
      setErrorMsg('Network error. Try again later.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Change PIN" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <AppInput label="Current PIN" value={oldPin} onChangeText={setOldPin} secureTextEntry placeholder="Enter current 6-digit PIN" keyboardType="numeric" maxLength={6} />
        <AppInput label="New PIN" value={newPin} onChangeText={setNewPin} secureTextEntry placeholder="Enter new 6-digit PIN" keyboardType="numeric" maxLength={6} />
        <AppInput label="Confirm New PIN" value={confirmPin} onChangeText={setConfirmPin} secureTextEntry placeholder="Re-enter new PIN" keyboardType="numeric" maxLength={6} />
        {errorMsg ? <View style={{marginTop: 10}}><Text style={{color: Colors.red}}>{errorMsg}</Text></View> : null}
        <AppButton label="Update PIN" onPress={handleUpdate} loading={loading} style={{marginTop: 20}} />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24 },
});
