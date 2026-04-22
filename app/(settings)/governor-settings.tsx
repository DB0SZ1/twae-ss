/**
 * twae — Governor Settings (Detailed Config)
 * Granular controls: buffer %, spend limits, bill protection, alert thresholds.
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Switch, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii } from '../../constants/theme';
import { fetchGovernorConfig, updateGovernorConfig, GovernorConfig } from '../../controllers/governorController';

export default function GovernorSettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<GovernorConfig | null>(null);

  // Local editing state
  const [bufferPercent, setBufferPercent] = useState('20');
  const [liabilityCapture, setLiabilityCapture] = useState('10');
  const [dailyLimit, setDailyLimit] = useState('0');
  const [weeklyLimit, setWeeklyLimit] = useState('0');
  const [monthlyBills, setMonthlyBills] = useState('0');
  const [largeThreshold, setLargeThreshold] = useState('50000');
  const [lowBalThreshold, setLowBalThreshold] = useState('10000');
  const [billProtection, setBillProtection] = useState(true);
  const [alertLargeSpend, setAlertLargeSpend] = useState(true);
  const [alertLowBal, setAlertLowBal] = useState(true);

  useEffect(() => { loadConfig(); }, []);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const c = await fetchGovernorConfig();
      setConfig(c);
      setBufferPercent(String(c.buffer_percent));
      setLiabilityCapture(String(c.liability_capture_percent || 10));
      setDailyLimit(String(c.spend_limit_daily));
      setWeeklyLimit(String(c.spend_limit_weekly));
      setMonthlyBills(String(c.estimated_monthly_bills));
      setLargeThreshold(String(c.large_spend_threshold));
      setLowBalThreshold(String(c.low_balance_threshold));
      setBillProtection(c.bill_protection_enabled);
      setAlertLargeSpend(c.alert_on_large_spend);
      setAlertLowBal(c.alert_on_low_balance);
    } catch (e) {
      console.warn('Config load err', e);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const updated = await updateGovernorConfig({
        buffer_percent: parseFloat(bufferPercent) || 20,
        liability_capture_percent: parseFloat(liabilityCapture) || 10,
        spend_limit_daily: parseFloat(dailyLimit) || 0,
        spend_limit_weekly: parseFloat(weeklyLimit) || 0,
        estimated_monthly_bills: parseFloat(monthlyBills) || 0,
        large_spend_threshold: parseFloat(largeThreshold) || 50000,
        low_balance_threshold: parseFloat(lowBalThreshold) || 10000,
        bill_protection_enabled: billProtection,
        alert_on_large_spend: alertLargeSpend,
        alert_on_low_balance: alertLowBal,
      });
      setConfig(updated);
      Alert.alert('Saved', 'Governor settings updated successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not save settings.');
    } finally {
      setSaving(false);
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
      <AppHeader title="Governor Settings" />

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">

        {/* Liability Capture */}
        <Text style={styles.sectionTitle}>Capture Dynamics</Text>
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Liability Capture (%)</Text>
          <Text style={styles.fieldHint}>Percentage of total unallocated incoming funds designated into the strict capture vault.</Text>
          <TextInput
            style={styles.numInput}
            value={liabilityCapture}
            onChangeText={setLiabilityCapture}
            keyboardType="numeric"
            placeholder="10"
            placeholderTextColor={Colors.dim}
          />
          {/* Quick Presets */}
          <View style={styles.presetRow}>
            {[10, 15, 20, 25, 50].map(v => (
              <TouchableOpacity
                key={v}
                style={[styles.preset, liabilityCapture === String(v) && styles.presetActive]}
                onPress={() => setLiabilityCapture(String(v))}
              >
                <Text style={[styles.presetText, liabilityCapture === String(v) && styles.presetTextActive]}>{v}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Buffer % */}
        <Text style={styles.sectionTitle}>Bill Protection Buffer</Text>
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Buffer Percentage (%)</Text>
          <Text style={styles.fieldHint}>Percentage of your total balance reserved to cover bills.</Text>
          <TextInput
            style={styles.numInput}
            value={bufferPercent}
            onChangeText={setBufferPercent}
            keyboardType="numeric"
            placeholder="20"
            placeholderTextColor={Colors.dim}
          />
          {/* Quick Presets */}
          <View style={styles.presetRow}>
            {[10, 15, 20, 25, 30].map(v => (
              <TouchableOpacity
                key={v}
                style={[styles.preset, bufferPercent === String(v) && styles.presetActive]}
                onPress={() => setBufferPercent(String(v))}
              >
                <Text style={[styles.presetText, bufferPercent === String(v) && styles.presetTextActive]}>{v}%</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Estimated Monthly Bills (₦)</Text>
          <Text style={styles.fieldHint}>Total expected bill payments per month (rent, utilities, subscriptions).</Text>
          <TextInput
            style={styles.numInput}
            value={monthlyBills}
            onChangeText={setMonthlyBills}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={Colors.dim}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Bill Protection</Text>
            <Text style={styles.toggleHint}>Reserve funds specifically for bill payments</Text>
          </View>
          <Switch
            value={billProtection}
            onValueChange={setBillProtection}
            trackColor={{ false: '#ccc', true: 'rgba(50,100,209,0.3)' }}
            thumbColor={billProtection ? Colors.gsheen : '#999'}
          />
        </View>

        {/* Spend Limits */}
        <Text style={styles.sectionTitle}>Spend Limits</Text>
        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Daily Spend Limit (₦)</Text>
          <Text style={styles.fieldHint}>Set to 0 for no limit.</Text>
          <TextInput
            style={styles.numInput}
            value={dailyLimit}
            onChangeText={setDailyLimit}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={Colors.dim}
          />
        </View>

        <View style={styles.fieldCard}>
          <Text style={styles.fieldLabel}>Weekly Spend Limit (₦)</Text>
          <Text style={styles.fieldHint}>Set to 0 for no limit.</Text>
          <TextInput
            style={styles.numInput}
            value={weeklyLimit}
            onChangeText={setWeeklyLimit}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={Colors.dim}
          />
        </View>

        {/* Alert Thresholds */}
        <Text style={styles.sectionTitle}>Alert Preferences</Text>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Large Spend Alerts</Text>
            <Text style={styles.toggleHint}>Notify when a single spend exceeds threshold</Text>
          </View>
          <Switch
            value={alertLargeSpend}
            onValueChange={setAlertLargeSpend}
            trackColor={{ false: '#ccc', true: 'rgba(50,100,209,0.3)' }}
            thumbColor={alertLargeSpend ? Colors.gsheen : '#999'}
          />
        </View>

        {alertLargeSpend && (
          <View style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>Large Spend Threshold (₦)</Text>
            <TextInput
              style={styles.numInput}
              value={largeThreshold}
              onChangeText={setLargeThreshold}
              keyboardType="numeric"
              placeholderTextColor={Colors.dim}
            />
          </View>
        )}

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Low Balance Alerts</Text>
            <Text style={styles.toggleHint}>Notify when L_avail drops below threshold</Text>
          </View>
          <Switch
            value={alertLowBal}
            onValueChange={setAlertLowBal}
            trackColor={{ false: '#ccc', true: 'rgba(50,100,209,0.3)' }}
            thumbColor={alertLowBal ? Colors.gsheen : '#999'}
          />
        </View>

        {alertLowBal && (
          <View style={styles.fieldCard}>
            <Text style={styles.fieldLabel}>Low Balance Threshold (₦)</Text>
            <TextInput
              style={styles.numInput}
              value={lowBalThreshold}
              onChangeText={setLowBalThreshold}
              keyboardType="numeric"
              placeholderTextColor={Colors.dim}
            />
          </View>
        )}

        {/* Save Button */}
        <View style={{ marginHorizontal: 20, marginTop: 32 }}>
          {saving ? (
            <ActivityIndicator color={Colors.gsheen} size="large" />
          ) : (
            <AppButton label="Save Settings" onPress={saveConfig} />
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { paddingBottom: 80 },

  sectionTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: Colors.text, marginHorizontal: 20, marginTop: 28, marginBottom: 12 },

  fieldCard: { marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  fieldLabel: { fontFamily: 'Inter_600', fontSize: 14, color: Colors.text, marginBottom: 4 },
  fieldHint: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted, marginBottom: 12 },
  numInput: { backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: Radii.sm, height: 48, paddingHorizontal: 16, fontFamily: 'Inter_500', fontSize: 16, color: Colors.text },

  presetRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  preset: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.04)' },
  presetActive: { backgroundColor: Colors.gsheen },
  presetText: { fontFamily: 'Inter_500', fontSize: 13, color: Colors.dim },
  presetTextActive: { color: '#fff' },

  toggleRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
  toggleLabel: { fontFamily: 'Inter_600', fontSize: 14, color: Colors.text },
  toggleHint: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted, marginTop: 2 },
});
