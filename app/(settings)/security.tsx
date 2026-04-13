import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/layouts/AppHeader';
import { Colors, Shadows } from '../../constants/theme';

export default function SecurityScreen() {
  const items = [
    { icon: 'lock-closed', label: 'Change PIN', sub: 'Update your 6-digit PIN' },
    { icon: 'key', label: 'Change Password', sub: 'Update your login password' },
    { icon: 'shield-checkmark', label: '2FA Settings', sub: 'Manage authenticator app' },
    { icon: 'desktop', label: 'Active Sessions', sub: '2 devices currently active' },
    { icon: 'trash', label: 'Delete Account', sub: 'Permanently close your account', danger: true },
  ];

  return (
    <View style={styles.container}>
      <AppHeader title="Security" />
      <ScrollView contentContainerStyle={styles.body}>
        {items.map((item, i) => (
          <TouchableOpacity key={i} style={styles.row} activeOpacity={0.7}>
            <View style={[styles.iconBox, item.danger && styles.iconBoxDanger]}>
              <Ionicons name={item.icon as any} size={16} color={item.danger ? Colors.red : Colors.gsheen} />
            </View>
            <View style={styles.info}><Text style={[styles.label, item.danger && { color: Colors.red }]}>{item.label}</Text><Text style={styles.sub}>{item.sub}</Text></View>
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
  iconBox: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(50,100,209,.06)', alignItems: 'center', justifyContent: 'center' },
  iconBoxDanger: { backgroundColor: 'rgba(239,68,68,.06)' },
  info: { flex: 1 },
  label: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.text },
  sub: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.muted, marginTop: 2 },
});
