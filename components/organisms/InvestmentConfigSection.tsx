import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radii, Gradients } from '../../constants/theme';
import {
  getDefaultLiabilityGroups,
  getAssetDestinations,
  calculateProjection,
  type LiabilityGroup,
} from '../../controllers/investController';

interface Props {
  onSave?: (groups: LiabilityGroup[]) => void;
  showSaveButton?: boolean;
}

export default function InvestmentConfigSection({ onSave, showSaveButton = false }: Props) {
  const [groups, setGroups] = useState<LiabilityGroup[]>(getDefaultLiabilityGroups());
  const [showAssetPicker, setShowAssetPicker] = useState<number | null>(null);
  const assets = getAssetDestinations();
  const projection = calculateProjection(groups);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const toggleGroup = (id: number) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, enabled: !g.enabled } : g));
  };

  const updatePercent = (id: number, delta: number) => {
    setGroups(prev => prev.map(g => {
      if (g.id !== id) return g;
      const newVal = Math.max(0, Math.min(100, g.redirectPercent + delta));
      return { ...g, redirectPercent: newVal };
    }));
  };

  const setAssetDest = (groupId: number, assetId: string) => {
    setGroups(prev => prev.map(g => g.id === groupId ? { ...g, assetDestination: assetId } : g));
    setShowAssetPicker(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>40-Year Vault Projection</Text>
      <LinearGradient colors={Gradients.primaryFull} style={styles.projectionCard}>
        <Text style={styles.projLabel}>Estimated Wealth Pool</Text>
        <Text style={styles.projValue}>{formatCurrency(projection.projectedValue)}</Text>
        <Text style={styles.projInvested}>
          from {formatCurrency(projection.totalInvested)} invested
        </Text>
        {projection.breakdown.length > 0 && (
          <View style={styles.projBreakdown}>
            {projection.breakdown.map((item, i) => (
              <View key={i} style={styles.projBreakdownItem}>
                <View style={[styles.projDot, { backgroundColor: ['#4a7aff', '#f0c040', '#ff9500', '#22c55e'][i] || Colors.gsheen }]} />
                <Text style={styles.projItemName} numberOfLines={1}>{item.assetName}</Text>
                <Text style={styles.projItemValue}>{formatCurrency(item.value)}</Text>
              </View>
            ))}
          </View>
        )}
      </LinearGradient>

      <Text style={styles.sectionTitle}>Liability Redirects</Text>
      {groups.map(group => (
        <View key={group.id} style={[styles.groupCard, !group.enabled && styles.groupCardDisabled]}>
          <View style={styles.groupHeader}>
            <View style={styles.groupIcon}>
              <Ionicons name={group.icon as any} size={20} color={group.enabled ? Colors.g3 : Colors.dim} />
            </View>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupDesc} numberOfLines={1}>{group.description}</Text>
            </View>
            <Switch
              value={group.enabled}
              onValueChange={() => toggleGroup(group.id)}
              trackColor={{ false: Colors.blackAlpha15, true: 'rgba(50,100,209,0.3)' }}
              thumbColor={group.enabled ? Colors.g3 : Colors.dim}
            />
          </View>

          {group.enabled && (
            <View style={styles.groupControls}>
              <View style={styles.percentRow}>
                <Text style={styles.percentLabel}>Redirect</Text>
                <View style={styles.percentControl}>
                  <TouchableOpacity style={styles.percentBtn} onPress={() => updatePercent(group.id, -1)}>
                    <Ionicons name="remove" size={16} color={Colors.text} />
                  </TouchableOpacity>
                  <Text style={styles.percentValue}>{group.redirectPercent}%</Text>
                  <TouchableOpacity style={styles.percentBtn} onPress={() => updatePercent(group.id, 1)}>
                    <Ionicons name="add" size={16} color={Colors.text} />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.assetSelector} onPress={() => setShowAssetPicker(group.id)}>
                <Text style={styles.assetLabel}>Invest in:</Text>
                <View style={styles.assetChip}>
                  <Text style={styles.assetEmoji}>{assets.find(a => a.id === group.assetDestination)?.icon || '📈'}</Text>
                  <Text style={styles.assetNameText}>{assets.find(a => a.id === group.assetDestination)?.name || 'Select'}</Text>
                  <Ionicons name="chevron-down" size={12} color={Colors.dim} />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {showAssetPicker === group.id && (
            <View style={styles.assetDropdown}>
              {assets.map(asset => (
                <TouchableOpacity
                  key={asset.id}
                  style={[styles.assetOption, group.assetDestination === asset.id && styles.assetOptionActive]}
                  onPress={() => setAssetDest(group.id, asset.id)}
                >
                  <Text style={styles.assetOptionEmoji}>{asset.icon}</Text>
                  <Text style={styles.assetOptionName}>{asset.name}</Text>
                  {group.assetDestination === asset.id && <Ionicons name="checkmark-circle" size={16} color={Colors.gsheen} />}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ))}

      {showSaveButton && onSave && (
        <TouchableOpacity style={styles.saveBtn} onPress={() => onSave(groups)}>
          <Text style={styles.saveBtnText}>Save Configuration</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 24 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: Colors.text, marginBottom: 12 },
  projectionCard: { borderRadius: 16, padding: 20, marginBottom: 24 },
  projLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.5, fontFamily: 'Inter_500', marginBottom: 4 },
  projValue: { fontSize: 32, fontFamily: 'BricolageGrotesque_600', color: '#fff', letterSpacing: -1 },
  projInvested: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'Inter_400', marginTop: 4 },
  projBreakdown: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', gap: 8 },
  projBreakdownItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  projDot: { width: 8, height: 8, borderRadius: 4 },
  projItemName: { flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.8)', fontFamily: 'Inter_400' },
  projItemValue: { fontSize: 11, color: '#fff', fontFamily: 'Inter_600' },
  sectionTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: Colors.text, marginBottom: 16, marginTop: 8 },
  groupCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.blackAlpha05 },
  groupCardDisabled: { opacity: 0.6 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  groupIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.03)', alignItems: 'center', justifyContent: 'center' },
  groupInfo: { flex: 1 },
  groupName: { fontSize: 15, fontFamily: 'BricolageGrotesque_600', color: Colors.text },
  groupDesc: { fontSize: 12, color: Colors.muted, fontFamily: 'Inter_400', marginTop: 2 },
  groupControls: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.blackAlpha05, gap: 12 },
  percentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  percentLabel: { fontSize: 13, fontFamily: 'Inter_500', color: Colors.muted },
  percentControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bg, borderRadius: Radii.pill, padding: 4 },
  percentBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  percentValue: { paddingHorizontal: 16, fontSize: 14, fontFamily: 'BricolageGrotesque_600', color: Colors.text },
  assetSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  assetLabel: { fontSize: 13, fontFamily: 'Inter_500', color: Colors.muted },
  assetChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.bg, paddingVertical: 6, paddingHorizontal: 12, borderRadius: Radii.pill },
  assetEmoji: { fontSize: 14 },
  assetNameText: { fontSize: 12, fontFamily: 'Inter_600', color: Colors.text },
  assetDropdown: { marginTop: 12, backgroundColor: Colors.bg, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: Colors.blackAlpha05 },
  assetOption: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10, borderRadius: 8 },
  assetOptionActive: { backgroundColor: 'rgba(50,100,209,0.05)' },
  assetOptionEmoji: { fontSize: 16 },
  assetOptionInfo: { flex: 1 },
  assetOptionName: { fontSize: 13, fontFamily: 'Inter_500', color: Colors.text },
  saveBtn: { backgroundColor: Colors.g3, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#fff', fontFamily: 'BricolageGrotesque_600', fontSize: 14 },
});
