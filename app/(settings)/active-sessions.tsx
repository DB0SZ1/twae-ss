/**
 * Twae — Active Sessions (real API)
 * Fetches device sessions from GET /auth/sessions
 * Revokes via DELETE /auth/sessions/:id
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import AppHeader from '../../components/layouts/AppHeader';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { getSessions, revokeSession, SessionInfo } from '../../controllers/authController';

export default function ActiveSessionsScreen() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (e) {
      console.error('Error loading sessions:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    try {
      await revokeSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      console.error('Error revoking session:', e);
    } finally {
      setRevokingId(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Active now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Active Sessions" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.desc}>
          Review all devices currently logged into your account. Revoke access for any device you don't recognize.
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.gsheen} style={{ marginTop: 40 }} />
        ) : sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="desktop-outline" size={48} color={Colors.dim} />
            <Text style={styles.emptyText}>No active sessions found</Text>
          </View>
        ) : (
          sessions.map(s => (
            <View key={s.id} style={styles.card}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name={s.os_name?.toLowerCase().includes('ios') ? 'phone-portrait' : 'laptop'}
                  size={24}
                  color={Colors.gsheen}
                />
              </View>
              <View style={styles.info}>
                <Text style={styles.device}>
                  {s.device_name}
                  {s.is_current && <Text style={styles.badge}> (This device)</Text>}
                </Text>
                <Text style={styles.meta}>
                  {s.os_name} · {s.last_active ? formatDate(s.last_active) : 'Unknown'}
                </Text>
              </View>
              {!s.is_current && (
                <TouchableOpacity onPress={() => handleRevoke(s.id)} disabled={revokingId === s.id}>
                  {revokingId === s.id ? (
                    <ActivityIndicator size="small" color={Colors.red} />
                  ) : (
                    <Text style={styles.revoke}>Revoke</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
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
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.dim },
});
