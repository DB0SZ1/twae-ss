/**
 * twae — Asset Discovery / Market Screen
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppHeader from '../../components/layouts/AppHeader';
import { Colors, Radii, Shadows } from '../../constants/theme';
import { marketAssets } from '../../constants/mockData';
import { useCurrency } from '../../hooks/useCurrency';

const tabs = ['All', 'Stocks', 'ETFs', 'T-Bills'];

export default function DiscoveryScreen() {
  const router = useRouter();
  const { format } = useCurrency();
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = marketAssets.filter(a => {
    if (activeTab === 'Stocks' && a.type !== 'stock') return false;
    if (activeTab === 'ETFs' && a.type !== 'etf') return false;
    if (activeTab === 'T-Bills' && a.type !== 'tbill') return false;
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.symbol.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <AppHeader title="Discover" />
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={Colors.dim} />
        <TextInput style={styles.searchInput} placeholder="Search stocks, ETFs..." placeholderTextColor={Colors.dim} value={search} onChangeText={setSearch} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        {tabs.map(t => (
          <TouchableOpacity key={t} style={[styles.tab, activeTab === t && styles.tabActive]} onPress={() => setActiveTab(t)}>
            <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {filtered.map(asset => (
          <TouchableOpacity key={asset.id} style={styles.assetRow} onPress={() => router.push(`/(invest)/${asset.id}`)} activeOpacity={0.7}>
            <View style={styles.assetLogo}><Text style={styles.assetSym}>{asset.symbol}</Text></View>
            <View style={styles.assetInfo}>
              <Text style={styles.assetName}>{asset.name}</Text>
              <Text style={styles.assetExch}>{asset.exchange}</Text>
            </View>
            <View style={styles.assetRight}>
              <Text style={styles.assetPrice}>{format(asset.price, asset.currency)}</Text>
              <Text style={[styles.assetCh, { color: asset.changePercent >= 0 ? Colors.greenBright : Colors.red }]}>
                {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent}%
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, height: 44, borderRadius: 14, backgroundColor: Colors.surface, paddingHorizontal: 14, borderWidth: 1, borderColor: Colors.blackAlpha04 },
  searchInput: { flex: 1, fontFamily: 'Inter_400', fontSize: 14, color: Colors.text },
  tabScroll: { paddingHorizontal: 16, marginVertical: 12, maxHeight: 40 },
  tab: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: Radii.pill, backgroundColor: Colors.surface, marginRight: 8, borderWidth: 1, borderColor: Colors.blackAlpha05 },
  tabActive: { backgroundColor: Colors.g2, borderColor: 'transparent' },
  tabText: { fontFamily: 'Inter_500', fontSize: 12, color: Colors.muted },
  tabTextActive: { color: '#fff' },
  body: { padding: 16, paddingBottom: 40 },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: Colors.card, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: Colors.blackAlpha05, ...Shadows.card },
  assetLogo: { width: 44, height: 44, borderRadius: 13, backgroundColor: 'rgba(50,100,209,.06)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(50,100,209,.1)' },
  assetSym: { fontSize: 11, fontFamily: 'BricolageGrotesque_600', color: Colors.g2, letterSpacing: 0.5 },
  assetInfo: { flex: 1 },
  assetName: { fontSize: 14, fontFamily: 'BricolageGrotesque_600', color: Colors.text },
  assetExch: { fontSize: 11, fontFamily: 'Inter_400', color: Colors.dim, marginTop: 2 },
  assetRight: { alignItems: 'flex-end' },
  assetPrice: { fontSize: 14, fontFamily: 'BricolageGrotesque_600', color: Colors.text },
  assetCh: { fontSize: 12, fontFamily: 'Inter_600', marginTop: 2 },
});
