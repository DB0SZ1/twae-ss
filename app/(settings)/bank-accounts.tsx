import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Shadows } from '../../constants/theme';

export default function BankAccountsScreen() {
  const banks = [
    { name: 'GTBank', acct: '0123456789', type: 'Savings', active: true },
    { name: 'GTBank', acct: '0987654321', type: 'Current', active: true },
  ];

  return (
    <View style={styles.container}>
      <AppHeader title="Linked Banks" />
      <ScrollView contentContainerStyle={styles.body}>
        {banks.map((b, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.row}><Text style={styles.name}>{b.name}</Text><View style={styles.activeBadge}><Text style={styles.activeText}>Active</Text></View></View>
            <Text style={styles.acct}>{b.acct} · {b.type}</Text>
          </View>
        ))}
        <AppButton label="+ Link New Bank" onPress={() => {}} variant="secondary" style={{ marginTop: 12 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 16 },
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.blackAlpha05, ...Shadows.card },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: Colors.text },
  acct: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted },
  activeBadge: { backgroundColor: 'rgba(74,222,128,.1)', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  activeText: { fontFamily: 'Inter_500', fontSize: 10, color: Colors.greenBright },
});
