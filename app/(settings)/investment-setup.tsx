/**
 * Twae — Investment Setup
 * Manage risk profile, asset preferences, and region-based market access.
 * Country-driven by default; can toggle global markets.
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { getUserProfile, updateProfile } from '../../controllers/authController';
import InvestmentConfigSection from '../../components/organisms/InvestmentConfigSection';

type RiskLevel = 'conservative' | 'moderate' | 'aggressive';

const REGION_ASSETS: Record<string, { label: string; assets: string[] }> = {
  NG: { label: '🇳🇬 Nigeria', assets: ['NGX Stocks', 'FGN Bonds', 'Money Market', 'Mutual Funds', 'Real Estate (REITs)'] },
  GH: { label: '🇬🇭 Ghana', assets: ['GSE Stocks', 'Fixed Income', 'Money Market', 'Treasury Bills'] },
  KE: { label: '🇰🇪 Kenya', assets: ['NSE Stocks', 'T-Bills', 'Money Market', 'Infrastructure Bonds'] },
  ZA: { label: '🇿🇦 South Africa', assets: ['JSE Stocks', 'SA Bonds', 'ETFs', 'Money Market'] },
  US: { label: '🇺🇸 United States', assets: ['US Stocks', 'ETFs', 'Bonds', 'REITs', 'Crypto'] },
};

const GLOBAL_ASSETS = ['US Stocks', 'ETFs', 'Crypto', 'Commodities', 'Forex'];

export default function InvestmentSetupScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [countryCode, setCountryCode] = useState('NG');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('moderate');
  const [globalToggle, setGlobalToggle] = useState(false);

  useEffect(() => {
    getUserProfile()
      .then(p => {
        setCountryCode(p.country_code || 'NG');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const regionData = REGION_ASSETS[countryCode] || REGION_ASSETS['NG'];
  const shownAssets = globalToggle ? [...regionData.assets, ...GLOBAL_ASSETS.filter(a => !regionData.assets.includes(a))] : regionData.assets;

  const riskOptions: { key: RiskLevel; label: string; desc: string; icon: string }[] = [
    { key: 'conservative', label: 'Conservative', desc: 'Low risk, stable returns', icon: 'shield-checkmark' },
    { key: 'moderate', label: 'Moderate', desc: 'Balanced growth & safety', icon: 'analytics' },
    { key: 'aggressive', label: 'Aggressive', desc: 'High risk, high potential', icon: 'rocket' },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      // In future: save risk profile to backend
      Alert.alert('Saved', `Risk profile set to ${riskLevel}. Global markets: ${globalToggle ? 'On' : 'Off'}.`);
    } catch (err) {
      Alert.alert('Error', 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <AppHeader title="Investment Setup" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader title="Investment Setup" />
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Region Banner */}
        <View style={styles.regionBanner}>
          <Text style={styles.regionFlag}>{regionData.label}</Text>
          <Text style={styles.regionSub}>Investments tailored to your region</Text>
        </View>

        {/* Risk Profile */}
        <Text style={styles.sectionTitle}>Risk Profile</Text>
        {riskOptions.map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.riskCard, riskLevel === opt.key && styles.riskCardActive]}
            onPress={() => setRiskLevel(opt.key)}
          >
            <Ionicons name={opt.icon as any} size={24} color={riskLevel === opt.key ? Colors.gsheen : Colors.dim} />
            <View style={styles.riskInfo}>
              <Text style={[styles.riskLabel, riskLevel === opt.key && styles.riskLabelActive]}>{opt.label}</Text>
              <Text style={styles.riskDesc}>{opt.desc}</Text>
            </View>
            {riskLevel === opt.key && (
              <Ionicons name="checkmark-circle" size={22} color={Colors.gsheen} />
            )}
          </TouchableOpacity>
        ))}

        {/* Global Markets Toggle */}
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>Enable Global Markets</Text>
            <Text style={styles.toggleSub}>Access US stocks, crypto, commodities alongside your local markets</Text>
          </View>
          <Switch
            value={globalToggle}
            onValueChange={setGlobalToggle}
            trackColor={{ false: '#333', true: Colors.gsheen }}
            thumbColor="#fff"
          />
        </View>

        {/* Available Assets */}
        <Text style={styles.sectionTitle}>Available Investments</Text>
        <View style={styles.assetGrid}>
          {shownAssets.map((asset, i) => (
            <View key={i} style={styles.assetChip}>
              <Ionicons name="trending-up" size={14} color={Colors.gsheen} />
              <Text style={styles.assetText}>{asset}</Text>
            </View>
          ))}
        </View>

        <AppButton label="Save Preferences" onPress={handleSave} loading={saving} style={{ marginTop: 24 }} />

        {/* Liability Management & Vault Projection */}
        <InvestmentConfigSection 
          showSaveButton
          onSave={async (groups) => {
            Alert.alert('Redirects Saved', 'Your liability wealth pool configuration has been updated.');
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  body: { padding: 24, paddingBottom: 60 },
  loadingText: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.dim },
  regionBanner: { backgroundColor: 'rgba(50,100,209,.06)', borderRadius: 16, padding: 20, marginBottom: 24, alignItems: 'center' },
  regionFlag: { fontSize: 20, fontFamily: 'Inter_600', color: Colors.text, marginBottom: 4 },
  regionSub: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.muted },
  sectionTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: Colors.text, marginBottom: 12, marginTop: 8 },
  riskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent', gap: 12 },
  riskCardActive: { borderColor: Colors.gsheen, backgroundColor: 'rgba(50,100,209,.04)' },
  riskInfo: { flex: 1 },
  riskLabel: { fontFamily: 'Inter_500', fontSize: 15, color: Colors.text },
  riskLabelActive: { color: Colors.gsheen },
  riskDesc: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted, marginTop: 2 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: 14, padding: 16, marginVertical: 16, gap: 12 },
  toggleLabel: { fontFamily: 'Inter_500', fontSize: 15, color: Colors.text },
  toggleSub: { fontFamily: 'Inter_400', fontSize: 12, color: Colors.muted, marginTop: 2 },
  assetGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  assetChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(50,100,209,.06)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, gap: 6 },
  assetText: { fontFamily: 'Inter_400', fontSize: 13, color: Colors.text },
});
