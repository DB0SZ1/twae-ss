import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import AppHeader from '../../components/layouts/AppHeader';
import { Colors, Shadows } from '../../constants/theme';
import { beneficiaries } from '../../constants/mockData';

export default function BeneficiariesScreen() {
  return (
    <View style={styles.container}>
      <AppHeader title="Beneficiaries" />
      <ScrollView contentContainerStyle={styles.body}>
        {beneficiaries.map(b => (
          <View key={b.id} style={styles.row}>
            <View style={styles.avatar}><Text style={styles.initials}>{b.initials}</Text></View>
            <View style={styles.info}><Text style={styles.name}>{b.name}</Text><Text style={styles.sub}>{b.bankName} · {b.accountNumber}</Text></View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: Colors.card, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: Colors.blackAlpha05, ...Shadows.card },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  initials: { fontFamily: 'BricolageGrotesque_600', fontSize: 14, color: Colors.g2 },
  info: { flex: 1 },
  name: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.text },
  sub: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.muted, marginTop: 2 },
});
