import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Shadows } from '../../constants/theme';

export default function HelpScreen() {
  const items = [
    { icon: 'chatbubble-ellipses', label: 'Live Chat', sub: 'Chat with support agent' },
    { icon: 'mail', label: 'Email Support', sub: 'support@twae.app' },
    { icon: 'call', label: 'Call Us', sub: '+234 800 TWAE APP' },
    { icon: 'document-text', label: 'FAQs', sub: 'Common questions' },
  ];

  return (
    <View style={styles.container}>
      <AppHeader title="Help & Support" />
      <ScrollView contentContainerStyle={styles.body}>
        {items.map((item, i) => (
          <TouchableOpacity key={i} style={styles.row} activeOpacity={0.7}>
            <View style={styles.iconBox}><Ionicons name={item.icon as any} size={18} color={Colors.gsheen} /></View>
            <View style={styles.info}><Text style={styles.label}>{item.label}</Text><Text style={styles.sub}>{item.sub}</Text></View>
            <Ionicons name="chevron-forward" size={16} color={Colors.dim} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: Colors.card, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: Colors.blackAlpha05, ...Shadows.card },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(50,100,209,.06)', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  label: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.text },
  sub: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.muted, marginTop: 2 },
});
