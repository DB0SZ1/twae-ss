import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';

export default function ChangePinScreen() {
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  return (
    <View style={styles.container}>
      <AppHeader title="Change PIN" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <AppInput label="Current PIN" value={oldPin} onChangeText={setOldPin} secureTextEntry placeholder="Enter current 6-digit PIN" keyboardType="numeric" maxLength={6} />
        <AppInput label="New PIN" value={newPin} onChangeText={setNewPin} secureTextEntry placeholder="Enter new 6-digit PIN" keyboardType="numeric" maxLength={6} />
        <AppInput label="Confirm New PIN" value={confirmPin} onChangeText={setConfirmPin} secureTextEntry placeholder="Re-enter new PIN" keyboardType="numeric" maxLength={6} />
        <AppButton label="Update PIN" onPress={() => {}} style={{marginTop: 20}} />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24 },
});
