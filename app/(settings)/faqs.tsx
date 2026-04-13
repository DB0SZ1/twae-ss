import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AppHeader from '../../components/layouts/AppHeader';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function FAQsScreen() {
  const faqs = [
    { q: 'How do I fund my wallet?', a: 'You can fund your wallet via Bank Transfer or Card using the Add Money flow.' },
    { q: 'What are the withdrawal limits?', a: 'Limits depend on your KYC tier. Navigate to Limits & Tiers in settings.' },
    { q: 'Are my investments insured?', a: 'Yes, investments are backed by regulated partners.' },
    { q: 'How do I reset my PIN?', a: 'You can reset your PIN in the Security settings section.' },
  ];

  return (
    <View style={styles.container}>
      <AppHeader title="FAQs" />
      <ScrollView contentContainerStyle={styles.body}>
        {faqs.map((f, i) => (
          <TouchableOpacity key={i} style={styles.card} activeOpacity={0.7}>
            <View style={styles.row}>
              <Text style={styles.q}>{f.q}</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.dim} />
            </View>
            <Text style={styles.a}>{f.a}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 16 },
  card: { backgroundColor: Colors.surface, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: Colors.blackAlpha04 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  q: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.text, flex: 1 },
  a: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.muted, lineHeight: 20 },
});
