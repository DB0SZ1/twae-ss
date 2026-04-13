import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import AppHeader from '../../components/layouts/AppHeader';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ActiveSessionsScreen() {
  const sessions = [
    { id: 1, device: 'iPhone 15 Pro', location: 'Lagos, NG', time: 'Active now', current: true },
    { id: 2, device: 'MacBook Pro M2', location: 'Lagos, NG', time: 'Last active 2 hrs ago', current: false },
  ];

  return (
    <View style={styles.container}>
      <AppHeader title="Active Sessions" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.desc}>Review all devices currently logged into your account. Ensure you recognize them.</Text>
        
        {sessions.map(s => (
          <View key={s.id} style={styles.card}>
            <View style={styles.iconWrap}>
              <Ionicons name={s.device.includes('Mac') ? 'laptop' : 'phone-portrait'} size={24} color={Colors.gsheen} />
            </View>
            <View style={styles.info}>
              <Text style={styles.device}>{s.device} {s.current && <Text style={styles.badge}>(This device)</Text>}</Text>
              <Text style={styles.meta}>{s.location} · {s.time}</Text>
            </View>
            {!s.current && (
              <TouchableOpacity>
                <Text style={styles.revoke}>Revoke</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24 },
  desc: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.dim, marginBottom: 20 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.blackAlpha04, paddingVertical: 16, gap: 12 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(50,100,209,.06)', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  device: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.text, marginBottom: 4 },
  badge: { color: Colors.greenBright, fontSize: 12 },
  meta: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted },
  revoke: { fontFamily: 'Inter_500', fontSize: 13, color: Colors.red },
});
