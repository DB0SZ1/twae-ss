/**
 * twae — Governor Status Screen (Shield Detail)
 * Real-time fiduciary governor dashboard showing L_avail, shield status, 
 * alerts feed, and quick toggles.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Switch, Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../../components/layouts/AppHeader';
import { Colors, Radii } from '../../constants/theme';
import {
  fetchGovernorStatus, fetchGovernorConfig, updateGovernorConfig,
  fetchGovernorAlerts, markAllAlertsRead,
  GovernorStatus, GovernorConfig, GovernorAlert,
} from '../../controllers/governorController';
import { useCurrency } from '../../hooks/useCurrency';

export default function GovernorScreen() {
  const router = useRouter();
  const { formatNGN } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [status, setStatus] = useState<GovernorStatus | null>(null);
  const [config, setConfig] = useState<GovernorConfig | null>(null);
  const [alerts, setAlerts] = useState<GovernorAlert[]>([]);

  useFocusEffect(
    useCallback(() => { loadAll(); }, [])
  );

  const loadAll = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [s, c, a] = await Promise.all([
        fetchGovernorStatus(),
        fetchGovernorConfig(),
        fetchGovernorAlerts(),
      ]);
      setStatus(s);
      setConfig(c);
      setAlerts(a);
    } catch (e) {
      console.warn('Governor load error', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleHardRail = async (val: boolean) => {
    if (val) {
      Alert.alert(
        'Enable Hard Rail?',
        'This will block ALL non-essential spending immediately. Only bill payments will proceed.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Enable', style: 'destructive', onPress: async () => {
            const updated = await updateGovernorConfig({ hard_rail_enabled: true });
            setConfig(updated);
            loadAll();
          }},
        ]
      );
    } else {
      const updated = await updateGovernorConfig({ hard_rail_enabled: false });
      setConfig(updated);
      loadAll();
    }
  };

  const toggleGovernor = async (val: boolean) => {
    const updated = await updateGovernorConfig({ is_enabled: val });
    setConfig(updated);
    loadAll();
  };

  const getShieldColor = () => {
    if (!status) return Colors.dim;
    switch (status.status) {
      case 'green': return '#10b981';
      case 'yellow': return '#f59e0b';
      case 'red': return '#ef4444';
      default: return Colors.dim;
    }
  };

  const getShieldBg = (): [string, string] => {
    if (!status) return ['#1a1a2e', '#16213e'];
    switch (status.status) {
      case 'green': return ['#064e3b', '#065f46'];
      case 'yellow': return ['#78350f', '#92400e'];
      case 'red': return ['#7f1d1d', '#991b1b'];
      default: return ['#1a1a2e', '#16213e'];
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return 'alert-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'ellipse';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'info': return Colors.gsheen;
      default: return Colors.dim;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.gsheen} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Safety Governor" />

      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadAll(true)} tintColor={Colors.gsheen} />}
      >
        {/* Shield Status Hero */}
        <View style={styles.heroWrap}>
          <LinearGradient colors={getShieldBg()} style={styles.heroGradient}>
            <View style={styles.shieldCircle}>
              <MaterialCommunityIcons name="shield-check" size={56} color={getShieldColor()} />
            </View>
            <Text style={styles.heroStatus}>{status?.status.toUpperCase()}</Text>
            <Text style={styles.heroMessage}>{status?.message}</Text>

            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>L_avail</Text>
                <Text style={styles.heroStatVal}>₦{(status?.l_avail ?? 0).toLocaleString()}</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>Reserved</Text>
                <Text style={styles.heroStatVal}>₦{(status?.reserved_for_bills ?? 0).toLocaleString()}</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatLabel}>Buffer</Text>
                <Text style={styles.heroStatVal}>{status?.buffer_percent ?? 0}%</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Controls */}
        <Text style={styles.sectionTitle}>Controls</Text>
        <View style={styles.controlCard}>
          <View style={styles.controlRow}>
            <View style={styles.controlInfo}>
              <MaterialCommunityIcons name="shield-outline" size={22} color={Colors.gsheen} />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.controlLabel}>Governor Enabled</Text>
                <Text style={styles.controlSub}>Monitor spending and protect bills</Text>
              </View>
            </View>
            <Switch
              value={config?.is_enabled ?? true}
              onValueChange={toggleGovernor}
              trackColor={{ false: '#ccc', true: 'rgba(50,100,209,0.3)' }}
              thumbColor={config?.is_enabled ? Colors.gsheen : '#999'}
            />
          </View>

          <View style={styles.controlDivider} />

          <View style={styles.controlRow}>
            <View style={styles.controlInfo}>
              <MaterialCommunityIcons name="shield-lock" size={22} color="#ef4444" />
              <View style={{ marginLeft: 12, flex: 1 }}>
                <Text style={styles.controlLabel}>Hard Rail</Text>
                <Text style={styles.controlSub}>Block ALL non-essential spending</Text>
              </View>
            </View>
            <Switch
              value={config?.hard_rail_enabled ?? false}
              onValueChange={toggleHardRail}
              trackColor={{ false: '#ccc', true: 'rgba(239,68,68,0.3)' }}
              thumbColor={config?.hard_rail_enabled ? '#ef4444' : '#999'}
            />
          </View>
        </View>

        {/* Settings Link */}
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/(settings)/governor-settings')}
        >
          <Ionicons name="settings-outline" size={20} color={Colors.gsheen} />
          <Text style={styles.settingsBtnText}>Configure Limits & Thresholds</Text>
          <Ionicons name="chevron-forward" size={18} color={Colors.dim} />
        </TouchableOpacity>

        {/* Alerts Feed */}
        <View style={styles.alertsHeader}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          {alerts.length > 0 && (
            <TouchableOpacity onPress={() => { markAllAlertsRead(); loadAll(); }}>
              <Text style={styles.markRead}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {alerts.length === 0 ? (
          <View style={styles.emptyAlerts}>
            <Ionicons name="checkmark-circle-outline" size={48} color="rgba(0,0,0,0.1)" />
            <Text style={styles.emptyText}>No alerts. Your finances are in good shape.</Text>
          </View>
        ) : (
          alerts.map(a => (
            <View key={a.id} style={[styles.alertCard, !a.is_read && styles.alertUnread]}>
              <View style={styles.alertIcon}>
                <Ionicons name={getSeverityIcon(a.severity) as any} size={20} color={getSeverityColor(a.severity)} />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{a.title}</Text>
                <Text style={styles.alertMsg}>{a.message}</Text>
                <Text style={styles.alertTime}>{new Date(a.created_at).toLocaleString()}</Text>
              </View>
            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { paddingBottom: 60 },

  heroWrap: { marginHorizontal: 20, marginTop: 16, borderRadius: 24, overflow: 'hidden' },
  heroGradient: { padding: 28, alignItems: 'center' },
  shieldCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  heroStatus: { fontFamily: 'BricolageGrotesque_700', fontSize: 24, color: '#fff', letterSpacing: 2, marginBottom: 8 },
  heroMessage: { fontFamily: 'Inter_400', fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 20, marginBottom: 24, paddingHorizontal: 16 },
  heroStats: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  heroStat: { alignItems: 'center' },
  heroStatLabel: { fontFamily: 'Inter_500', fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  heroStatVal: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: '#fff' },
  heroDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 12 },

  sectionTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: Colors.text, marginHorizontal: 20, marginTop: 28, marginBottom: 14 },

  controlCard: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  controlInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  controlLabel: { fontFamily: 'Inter_600', fontSize: 14, color: Colors.text },
  controlSub: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted, marginTop: 2 },
  controlDivider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginHorizontal: 16 },

  settingsBtn: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 16, backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  settingsBtnText: { flex: 1, fontFamily: 'Inter_500', fontSize: 14, color: Colors.text },

  alertsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 28, marginBottom: 14 },
  markRead: { fontFamily: 'Inter_500', fontSize: 13, color: Colors.gsheen },

  emptyAlerts: { alignItems: 'center', paddingVertical: 48 },
  emptyText: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, marginTop: 16 },

  alertCard: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 10, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)' },
  alertUnread: { borderLeftWidth: 3, borderLeftColor: Colors.gsheen },
  alertIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.03)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  alertContent: { flex: 1 },
  alertTitle: { fontFamily: 'Inter_600', fontSize: 14, color: Colors.text, marginBottom: 4 },
  alertMsg: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.muted, lineHeight: 18, marginBottom: 6 },
  alertTime: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.dim },
});
