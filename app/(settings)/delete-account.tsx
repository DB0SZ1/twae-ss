import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import AppHeader from '../../components/layouts/AppHeader';
import AppInput from '../../components/atoms/AppInput';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function DeleteAccountScreen() {
  const [reason, setReason] = useState('');

  return (
    <View style={styles.container}>
      <AppHeader title="Delete Account" />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.warnBox}>
          <Ionicons name="warning" size={24} color={Colors.red} />
          <Text style={styles.warnText}>Deleting your account is permanent. All your data, wallet balances, and investment history will be irretrievably lost.</Text>
        </View>

        <AppInput label="Why are you leaving?" value={reason} onChangeText={setReason} placeholder="Optional" />
        
        <AppButton label=" Permanently Delete Account" onPress={() => {}} variant="danger" style={{marginTop: 20}} />
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24 },
  warnBox: { backgroundColor: 'rgba(239,68,68,.1)', padding: 16, borderRadius: 12, flexDirection: 'row', gap: 12, marginBottom: 20, alignItems: 'center' },
  warnText: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.red, flex: 1, lineHeight: 20 },
});
