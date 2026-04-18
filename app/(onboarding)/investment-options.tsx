/**
 * twae — Investment Options / TWA Liability Setup (Screen 1.7)
 * 4 active liability groups with toggle/slider, asset picker
 * Live 40-year vault projection, onboarding story screens
 * 10 "Coming Soon" placeholders + partner slots
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  Switch,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors, Radii, Gradients } from '../../constants/theme';
import {
  getDefaultLiabilityGroups,
  getAssetDestinations,
  getPlaceholderSlots,
  calculateProjection,
  saveInvestmentPreferences,
  type LiabilityGroup,
  type AssetDestination,
} from '../../controllers/investController';

const { width } = Dimensions.get('window');

// ── Onboarding Story Screens ──────────────────────
const storyScreens = [
  {
    icon: '👻',
    title: 'Ghost Wealth',
    subtitle: 'Hidden money in your everyday spending',
    description:
      'Every bill you pay, every subscription, every purchase — there\'s invisible wealth hiding in your liabilities. twae captures it before it disappears.',
    gradient: ['#1a3575', '#3264d1'] as [string, string],
  },
  {
    icon: '🛡️',
    title: 'L_avail Shield',
    subtitle: 'Your available liability, protected',
    description:
      'We redirect a small percentage of each liability category into real investments — automatically, silently, and securely.',
    gradient: ['#004a99', '#0066cc'] as [string, string],
  },
  {
    icon: '🏦',
    title: '40-Year Vault',
    subtitle: 'Your future, compounding now',
    description:
      'Even 5% redirected from everyday spend compounds into hundreds of thousands over 40 years. Set it once. Watch it grow.',
    gradient: ['#b8860b', '#d4a017'] as [string, string],
  },
];

export default function InvestmentOptionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string; countryCode?: string }>();

  // Story phase
  const [showStory, setShowStory] = useState(true);
  const [storyPage, setStoryPage] = useState(0);

  // Liability groups
  const [groups, setGroups] = useState<LiabilityGroup[]>(getDefaultLiabilityGroups());
  const [showAssetPicker, setShowAssetPicker] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const assets = getAssetDestinations();
  const placeholders = getPlaceholderSlots();
  const projection = calculateProjection(groups);

  const fadeIn = useRef(new Animated.Value(0)).current;
  const storyFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  // Story navigation
  const nextStory = () => {
    if (storyPage < storyScreens.length - 1) {
      Animated.timing(storyFade, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setStoryPage(p => p + 1);
        Animated.timing(storyFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    } else {
      setShowStory(false);
    }
  };

  const skipStory = () => setShowStory(false);

  // Toggle group
  const toggleGroup = (id: number) => {
    setGroups(prev =>
      prev.map(g => (g.id === id ? { ...g, enabled: !g.enabled } : g))
    );
  };

  // Update percentage
  const updatePercent = (id: number, delta: number) => {
    setGroups(prev =>
      prev.map(g => {
        if (g.id !== id) return g;
        const next = Math.max(1, Math.min(50, g.redirectPercent + delta));
        return { ...g, redirectPercent: next };
      })
    );
  };

  // Set asset destination
  const setAssetDest = (groupId: number, assetId: string) => {
    setGroups(prev =>
      prev.map(g => (g.id === groupId ? { ...g, assetDestination: assetId } : g))
    );
    setShowAssetPicker(null);
  };

  // Format currency
  const formatCurrency = (val: number): string => {
    if (val >= 1_000_000_000) return `₦${(val / 1_000_000_000).toFixed(1)}B`;
    if (val >= 1_000_000) return `₦${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `₦${(val / 1_000).toFixed(0)}K`;
    return `₦${val.toFixed(0)}`;
  };

  // Save and navigate
  const handleComplete = async () => {
    setSaving(true);
    try {
      await saveInvestmentPreferences(params.userId || '', groups);
      router.replace('/(tabs)');
    } catch {
      // Continue anyway
      router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  // ── Story Screens ─────────────────────────────────
  if (showStory) {
    const screen = storyScreens[storyPage];
    return (
      <View style={styles.container}>
        <LinearGradient colors={screen.gradient} style={StyleSheet.absoluteFill} />

        {/* Skip */}
        <TouchableOpacity style={styles.storySkip} onPress={skipStory}>
          <Text style={styles.storySkipText}>Skip</Text>
        </TouchableOpacity>

        {/* Progress dots */}
        <View style={styles.storyDots}>
          {storyScreens.map((_, i) => (
            <View
              key={i}
              style={[styles.storyDot, i === storyPage && styles.storyDotActive]}
            />
          ))}
        </View>

        <Animated.View style={[styles.storyContent, { opacity: storyFade }]}>
          <Text style={styles.storyIcon}>{screen.icon}</Text>
          <Text style={styles.storyTitle}>{screen.title}</Text>
          <Text style={styles.storySubtitle}>{screen.subtitle}</Text>
          <Text style={styles.storyDesc}>{screen.description}</Text>
        </Animated.View>

        <View style={styles.storyActions}>
          <AppButton
            label={storyPage === storyScreens.length - 1 ? 'Get Started' : 'Next'}
            onPress={nextStory}
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          />
        </View>
      </View>
    );
  }

  // ── Main Config Screen ────────────────────────────
  return (
    <View style={styles.container}>
      <AppHeader title="Investment Setup" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeIn }}>
          <Text style={styles.title}>Configure your wealth engine</Text>
          <Text style={styles.sub}>
            Choose which liability categories to redirect toward investments
          </Text>

          {/* 40-Year Vault Projection */}
          <LinearGradient colors={Gradients.primaryFull} style={styles.projectionCard}>
            <Text style={styles.projLabel}>40-Year Vault Projection</Text>
            <Text style={styles.projValue}>{formatCurrency(projection.projectedValue)}</Text>
            <Text style={styles.projInvested}>
              from {formatCurrency(projection.totalInvested)} invested
            </Text>
            {projection.breakdown.length > 0 && (
              <View style={styles.projBreakdown}>
                {projection.breakdown.map((item, i) => (
                  <View key={i} style={styles.projBreakdownItem}>
                    <View style={[styles.projDot, { backgroundColor: ['#4a7aff', '#f0c040', '#ff9500', '#22c55e'][i] || Colors.gsheen }]} />
                    <Text style={styles.projItemName}>{item.assetName}</Text>
                    <Text style={styles.projItemValue}>{formatCurrency(item.value)}</Text>
                  </View>
                ))}
              </View>
            )}
          </LinearGradient>

          {/* Active Liability Groups */}
          {groups.map(group => (
            <View key={group.id} style={[styles.groupCard, !group.enabled && styles.groupCardDisabled]}>
              <View style={styles.groupHeader}>
                <View style={styles.groupIcon}>
                  <Ionicons name={group.icon as any} size={20} color={group.enabled ? Colors.g3 : Colors.dim} />
                </View>
                <View style={styles.groupInfo}>
                  <Text style={styles.groupName}>{group.name}</Text>
                  <Text style={styles.groupDesc} numberOfLines={2}>{group.description}</Text>
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
                  {/* Percentage */}
                  <View style={styles.percentRow}>
                    <Text style={styles.percentLabel}>Redirect</Text>
                    <View style={styles.percentControl}>
                      <TouchableOpacity
                        style={styles.percentBtn}
                        onPress={() => updatePercent(group.id, -1)}
                      >
                        <Ionicons name="remove" size={16} color={Colors.text} />
                      </TouchableOpacity>
                      <Text style={styles.percentValue}>{group.redirectPercent}%</Text>
                      <TouchableOpacity
                        style={styles.percentBtn}
                        onPress={() => updatePercent(group.id, 1)}
                      >
                        <Ionicons name="add" size={16} color={Colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Simple percentage bar */}
                  <View style={styles.percentBarBg}>
                    <View style={[styles.percentBarFill, { width: `${Math.min(group.redirectPercent * 2, 100)}%` }]} />
                  </View>

                  {/* Asset destination */}
                  <TouchableOpacity
                    style={styles.assetSelector}
                    onPress={() => setShowAssetPicker(group.id)}
                  >
                    <Text style={styles.assetLabel}>Invest in:</Text>
                    <View style={styles.assetChip}>
                      <Text style={styles.assetEmoji}>
                        {assets.find(a => a.id === group.assetDestination)?.icon || '📈'}
                      </Text>
                      <Text style={styles.assetName}>
                        {assets.find(a => a.id === group.assetDestination)?.name || 'Select'}
                      </Text>
                      <Ionicons name="chevron-down" size={14} color={Colors.dim} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}

              {/* Asset Picker Dropdown */}
              {showAssetPicker === group.id && (
                <View style={styles.assetDropdown}>
                  {assets.map(asset => (
                    <TouchableOpacity
                      key={asset.id}
                      style={[
                        styles.assetOption,
                        group.assetDestination === asset.id && styles.assetOptionActive,
                      ]}
                      onPress={() => setAssetDest(group.id, asset.id)}
                    >
                      <Text style={styles.assetOptionEmoji}>{asset.icon}</Text>
                      <View style={styles.assetOptionInfo}>
                        <Text style={styles.assetOptionName}>{asset.name}</Text>
                        <Text style={styles.assetOptionReturn}>
                          {asset.ticker} • {asset.historicalReturn}% historical
                        </Text>
                      </View>
                      {group.assetDestination === asset.id && (
                        <Ionicons name="checkmark-circle" size={18} color={Colors.g3} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Coming Soon Placeholders */}
          <Text style={styles.sectionTitle}>Future Categories</Text>
          <View style={styles.placeholderGrid}>
            {placeholders.slice(0, 6).map(slot => (
              <View key={slot.id} style={styles.placeholderSlot}>
                <Ionicons name="lock-closed" size={16} color={Colors.dim} />
                <Text style={styles.placeholderText}>Coming Soon</Text>
              </View>
            ))}
          </View>

          {/* Partner Slots */}
          <Text style={styles.sectionTitle}>Partner Programs</Text>
          <View style={styles.partnerRow}>
            {[1, 2, 3].map(i => (
              <View key={i} style={styles.partnerSlot}>
                <Ionicons name="storefront-outline" size={20} color={Colors.dim} />
                <Text style={styles.partnerText}>Partner{'\n'}Coming Soon</Text>
              </View>
            ))}
          </View>

          <AppButton
            label="Complete Setup"
            onPress={handleComplete}
            loading={saving}
            style={{ marginTop: 24 }}
          />

          <TouchableOpacity
            style={styles.skipBtn}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.skipText}>Skip — Configure later in Settings</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 24, paddingTop: 16, paddingBottom: 60 },
  title: { fontFamily: 'BricolageGrotesque_600', fontSize: 24, color: Colors.text, marginBottom: 8 },
  sub: { fontFamily: 'Inter_400', fontSize: 14, color: Colors.muted, lineHeight: 20, marginBottom: 20 },

  // Story
  storySkip: { position: 'absolute', top: 60, right: 24, zIndex: 10 },
  storySkipText: { fontFamily: 'Inter_500', fontSize: 14, color: 'rgba(255,255,255,.6)' },
  storyDots: { position: 'absolute', top: 64, left: 24, flexDirection: 'row', gap: 6 },
  storyDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,.25)' },
  storyDotActive: { backgroundColor: '#fff', width: 24 },
  storyContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  storyIcon: { fontSize: 64, marginBottom: 24 },
  storyTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 32, color: '#fff', marginBottom: 8, textAlign: 'center' },
  storySubtitle: { fontFamily: 'Inter_500', fontSize: 15, color: 'rgba(255,255,255,.7)', marginBottom: 20, textAlign: 'center' },
  storyDesc: { fontFamily: 'Inter_400', fontSize: 14, color: 'rgba(255,255,255,.5)', textAlign: 'center', lineHeight: 22 },
  storyActions: { paddingHorizontal: 24, paddingBottom: 60 },

  // Projection Card
  projectionCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  projLabel: { fontFamily: 'Inter_500', fontSize: 12, color: 'rgba(255,255,255,.5)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  projValue: { fontFamily: 'BricolageGrotesque_600', fontSize: 36, color: '#fff', marginBottom: 4 },
  projInvested: { fontFamily: 'Inter_400', fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 16 },
  projBreakdown: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,.1)', paddingTop: 12, gap: 8 },
  projBreakdownItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  projDot: { width: 8, height: 8, borderRadius: 4 },
  projItemName: { flex: 1, fontFamily: 'Inter_400', fontSize: 12, color: 'rgba(255,255,255,.6)' },
  projItemValue: { fontFamily: 'Inter_600', fontSize: 13, color: '#fff' },

  // Group Card
  groupCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.blackAlpha04,
  },
  groupCardDisabled: { opacity: 0.65 },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  groupIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(50,100,209,.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupInfo: { flex: 1 },
  groupName: { fontFamily: 'BricolageGrotesque_600', fontSize: 15, color: Colors.text },
  groupDesc: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.muted, lineHeight: 16, marginTop: 2 },
  groupControls: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.blackAlpha04 },
  percentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  percentLabel: { fontFamily: 'Inter_500', fontSize: 13, color: Colors.muted },
  percentControl: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  percentBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.blackAlpha05,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentValue: { fontFamily: 'BricolageGrotesque_600', fontSize: 18, color: Colors.g3, minWidth: 48, textAlign: 'center' },
  percentBarBg: { height: 4, backgroundColor: Colors.blackAlpha05, borderRadius: 2, marginBottom: 14, overflow: 'hidden' },
  percentBarFill: { height: '100%', backgroundColor: Colors.g3, borderRadius: 2 },
  assetSelector: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  assetLabel: { fontFamily: 'Inter_500', fontSize: 12, color: Colors.muted },
  assetChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.blackAlpha05, borderRadius: Radii.pill, paddingHorizontal: 12, paddingVertical: 6 },
  assetEmoji: { fontSize: 14 },
  assetName: { fontFamily: 'Inter_500', fontSize: 13, color: Colors.text },
  assetDropdown: {
    marginTop: 12,
    backgroundColor: Colors.bg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.blackAlpha05,
    overflow: 'hidden',
  },
  assetOption: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderBottomWidth: 1, borderBottomColor: Colors.blackAlpha04 },
  assetOptionActive: { backgroundColor: 'rgba(50,100,209,.04)' },
  assetOptionEmoji: { fontSize: 20 },
  assetOptionInfo: { flex: 1 },
  assetOptionName: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.text },
  assetOptionReturn: { fontFamily: 'Inter_400', fontSize: 11, color: Colors.muted },

  // Placeholders
  sectionTitle: { fontFamily: 'BricolageGrotesque_600', fontSize: 16, color: Colors.text, marginTop: 20, marginBottom: 12 },
  placeholderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  placeholderSlot: {
    width: (width - 64) / 3,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.blackAlpha04,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    opacity: 0.5,
  },
  placeholderText: { fontFamily: 'Inter_400', fontSize: 9, color: Colors.dim, textAlign: 'center' },
  partnerRow: { flexDirection: 'row', gap: 10 },
  partnerSlot: {
    flex: 1,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.blackAlpha04,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    opacity: 0.5,
  },
  partnerText: { fontFamily: 'Inter_400', fontSize: 9, color: Colors.dim, textAlign: 'center' },
  skipBtn: { alignItems: 'center', paddingVertical: 20 },
  skipText: { fontFamily: 'Inter_500', fontSize: 14, color: Colors.dim },
});
