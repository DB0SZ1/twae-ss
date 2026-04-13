import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/layouts/AppHeader';
import { Colors, Shadows } from '../../constants/theme';

export default function LimitsScreen() {
  const tiers = [
    { level: 1, label: 'Basic', limit: '₦50,000 /day', requirements: 'Name + Phone' },
    { level: 2, label: 'Standard', limit: '₦500,000 /day', requirements: 'BVN / NIN' },
    { level: 3, label: 'Premium', limit: '₦10,000,000 /day', requirements: 'ID Docs + Selfie', current: true },
  ];

  return (
    <View style={styles.container}>
      <AppHeader title="Limits & Tiers" />
      <ScrollView contentContainerStyle={styles.body}>
        {tiers.map(t => (
          <View key={t.level} style={[styles.card, t.current && styles.cardActive]}>
            <View style={styles.row}>
              <Text style={[styles.level, t.current && { color: Colors.g3 }]}>Tier {t.level}</Text>
              {t.current && <View style={styles.badge}><Ionicons name="checkmark" size={12} color="#fff" /><Text style={styles.badgeText}>Current</Text></View>}
            </View>
            <Text style={styles.label}>{t.label}</Text>
            <Text style={styles.limit}>{t.limit}</Text>
            <Text style={styles.req}>{t.requirements}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 16 },
  card: { backgroundColor: Colors.card, borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: Colors.blackAlpha05, ...Shadows.card },
  cardActive: { borderColor: Colors.g3, backgroundColor: 'rgba(50,100,209,.03)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  level: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: Colors.text },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.g2, borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  badgeText: { fontFamily: 'Inter_500', fontSize: 10, color: '#fff' },
  label: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.muted, marginBottom: 2 },
  limit: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: Colors.text, marginBottom: 4 },
  req: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.dim },
});
