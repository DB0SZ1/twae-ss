/**
 * twae — Profile Screen
 * Account management hub with settings
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, CreditCard, Layers, Lock, Fingerprint, ShieldCheck, Monitor, MessageCircle, HelpCircle, Trash2, Info, ChevronRight, Palette, LogOut, TrendingUp } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Fonts, FontSizes, Radii, Shadows, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrency } from '../../hooks/useCurrency';
import { useState, useEffect, useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { fetchDashboardData, DashboardAggregatedData } from '../../controllers/dashboardController';
import { getUserProfile, UserProfileResponse } from '../../controllers/authController';

type SettingsGroup = {
  title: string;
  items: {
    Icon: any;
    label: string;
    sub: string;
    color: string;
    bg: string;
    border: string;
    route?: string;
    toggle?: boolean;
  }[];
};

export default function ProfileScreen() {
  const router = useRouter();
  const { abbreviate } = useCurrency();
  const C = useThemeColors();
  const { mode } = useTheme();

  const [bioEnabled, setBioEnabled] = useState(true);
  const [data, setData] = useState<DashboardAggregatedData | null>(null);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const [dashResp, profResp] = await Promise.all([
        fetchDashboardData().catch(() => null),
        getUserProfile().catch(() => null)
      ]);
      if (dashResp) setData(dashResp);
      if (profResp) {
        setProfile(profResp);
        setBioEnabled(profResp.biometric_enrolled);
      }
    } catch (e) {
      console.warn('Profile fetch failed', e);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleBioToggle = () => {
    if (!profile?.biometric_enrolled) {
      Alert.alert('Enable Biometrics', 'You have not enrolled any biometrics yet. Visit Settings > Security to configure Face ID or Fingerprint.', [
        { text: 'Later', style: 'cancel' },
        { text: 'Set Up', onPress: () => router.push('/(settings)/security') }
      ]);
      return;
    }
    setBioEnabled(prev => !prev);
  }

  const doLogout = () => {
    Alert.alert('Log out?', 'You will be signed out of your account on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => router.replace('/(auth)/login') },
    ]);
  };

  const modeLabel = mode === 'auto' ? 'System' : mode === 'dark' ? 'Dark' : 'Light';

  const bankLabel = profile?.bank_link_status !== 'none' ? 'Manage accounts' : 'No banks linked';
  const profileIncomplete = profile && (!profile.is_phone_verified || profile.kyc_status === 'none' || profile.kyc_status === 'pending' || !profile.biometric_enrolled);
  const isVerified = profile?.kyc_status === 'verified';

  const settingsGroups: SettingsGroup[] = [
    {
      title: 'Account',
      items: [
        { Icon: User, label: 'Personal Info', sub: 'Name, phone, address', color: C.gsheen, bg: 'rgba(50,100,209,.06)', border: 'rgba(50,100,209,.1)', route: '/(settings)/personal-info' },
        { Icon: CreditCard, label: 'Linked Banks', sub: bankLabel, color: C.gold3, bg: 'rgba(212,160,23,.06)', border: 'rgba(212,160,23,.1)', route: '/(settings)/bank-accounts' },
        { Icon: TrendingUp, label: 'Investment Setup', sub: 'Risk profile & asset preferences', color: C.greenBright, bg: 'rgba(74,222,128,.06)', border: 'rgba(74,222,128,.1)', route: '/(settings)/investment-setup' },
        { Icon: Palette, label: 'Appearance', sub: `Theme: ${modeLabel}`, color: C.g3, bg: 'rgba(74,122,255,.06)', border: 'rgba(74,122,255,.1)', route: '/(settings)/appearance' },
        ...(profileIncomplete ? [{ Icon: ShieldCheck, label: 'Complete My Profile', sub: 'Finish onboarding steps', color: C.red, bg: 'rgba(239,68,68,.06)', border: 'rgba(239,68,68,.1)', route: '/(onboarding)/otp-verify' }] : []),
      ],
    },
    {
      title: 'Security',
      items: [
        { Icon: Lock, label: 'Change PIN', sub: 'Update transaction PIN', color: C.red, bg: 'rgba(239,68,68,.06)', border: 'rgba(239,68,68,.1)', route: '/(settings)/change-pin' },
        { Icon: Fingerprint, label: 'Biometrics', sub: profile?.biometric_enrolled ? 'Enrolled · Enabled' : 'Not enrolled — Tap to set up', color: C.gold3, bg: 'rgba(212,160,23,.06)', border: 'rgba(212,160,23,.1)', toggle: !profile?.biometric_enrolled ? false : true, route: '/(settings)/security' },
        { Icon: Monitor, label: 'Active Sessions', sub: 'Manage device access', color: C.skyDark, bg: 'rgba(30,95,168,.06)', border: 'rgba(30,95,168,.1)', route: '/(settings)/active-sessions' },
      ],
    },
    {
      title: 'Support',
      items: [
        { Icon: MessageCircle, label: 'Live Chat', sub: 'Chat with a support agent', color: C.gsheen, bg: 'rgba(50,100,209,.06)', border: 'rgba(50,100,209,.1)', route: '/(settings)/live-chat' },
        { Icon: HelpCircle, label: 'FAQs', sub: 'Common questions answered', color: C.gold3, bg: 'rgba(212,160,23,.06)', border: 'rgba(212,160,23,.1)', route: '/(settings)/faqs' },
        { Icon: Trash2, label: 'Delete Account', sub: 'Permanently remove your data', color: C.red, bg: 'rgba(239,68,68,.06)', border: 'rgba(239,68,68,.1)', route: '/(settings)/delete-account' },
        { Icon: Info, label: 'App Version', sub: 'v1.0.0', color: C.dim, bg: 'rgba(0,0,0,.03)', border: 'rgba(0,0,0,.05)' },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <StatusBar barStyle="light-content" />

      {/* Profile Top */}
      <LinearGradient
        colors={['#1a3575', '#3264d1', '#001a0d']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        style={styles.top}
      >
        <View style={styles.decoGold} />

        <View style={styles.profileRow}>
          <LinearGradient colors={[C.gold2, C.goldsheen]} style={styles.avatar}>
            <Text style={[styles.avatarText, { color: C.g1 }]}>{profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : (data?.dashboard?.greetingName ? data.dashboard.greetingName.charAt(0).toUpperCase() : 'U')}</Text>
          </LinearGradient>
          <View>
            <Text style={styles.name}>{profile?.full_name || data?.dashboard?.fullName || 'User'}</Text>
            <Text style={styles.email}>{profile?.email || data?.dashboard?.email || 'Loading...'}</Text>
            <View style={[styles.tierPill, { backgroundColor: isVerified ? '#22c55e' : C.gold2 }]}>
              <ShieldCheck size={12} color={isVerified ? '#fff' : '#000'} strokeWidth={2} />
              <Text style={[styles.tierText, isVerified && { color: '#fff' }]}>{isVerified ? 'Verified' : 'Unverified'}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{abbreviate(data?.portfolio?.totalValueUsd || 0, 'USD')}</Text>
            <Text style={styles.statLabel}>NET WORTH</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{data?.portfolio?.holdings?.length || 0}</Text>
            <Text style={styles.statLabel}>HOLDINGS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{data?.savings?.pockets?.length || 0}</Text>
            <Text style={styles.statLabel}>POCKETS</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Settings List */}
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.g1} />}
      >
        {/* Verification Check Notice */}
        {profile && profile.kyc_status !== 'verified' && (
          <TouchableOpacity 
            style={[styles.settingsCard, { backgroundColor: C.surface, borderColor: C.gold1, marginBottom: 16, borderWidth: 1 }]}
            onPress={() => router.push('/(onboarding)/kyc-identity')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(212,160,23,.1)', borderColor: 'rgba(212,160,23,.2)' }]}>
                <Info size={16} color={C.gold2} strokeWidth={2} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontFamily: Fonts.bodySemiBold, fontSize: 15, color: C.text }}>Complete My Profile</Text>
                <Text style={{ fontFamily: Fonts.bodyRegular, fontSize: 13, color: C.muted, marginTop: 2 }}>Unlock transfers and higher limits.</Text>
              </View>
              <ChevronRight size={16} color={C.dim} strokeWidth={2} />
            </View>
          </TouchableOpacity>
        )}

        {/* Biometrics Warning Notice */}
        {profile && !profile.biometric_enrolled && (
          <TouchableOpacity 
            style={[styles.settingsCard, { backgroundColor: C.surface, borderColor: '#e11d48', marginBottom: 16, borderWidth: 1 }]}
            onPress={() => router.push('/(settings)/security')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
              <View style={[styles.iconBox, { backgroundColor: 'rgba(225,29,72,.1)', borderColor: 'rgba(225,29,72,.2)' }]}>
                <Fingerprint size={16} color="#e11d48" strokeWidth={2} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontFamily: Fonts.bodySemiBold, fontSize: 15, color: '#e11d48' }}>Biometrics Not Configured</Text>
                <Text style={{ fontFamily: Fonts.bodyRegular, fontSize: 13, color: C.muted, marginTop: 2 }}>Tap to enable Face ID or Fingerprint for enhanced security.</Text>
              </View>
              <ChevronRight size={16} color={C.dim} strokeWidth={2} />
            </View>
          </TouchableOpacity>
        )}

        {settingsGroups.map(group => (
          <View key={group.title}>
            <Text style={[styles.sectionTitle, { color: C.muted }]}>{group.title}</Text>
            <View style={[styles.settingsCard, { backgroundColor: C.card, borderColor: C.blackAlpha05 }]}>
              {group.items.map((item, i) => {
                const ItemIcon = item.Icon;
                return (
                  <TouchableOpacity
                    key={i}
                    style={[styles.settingsRow, i < group.items.length - 1 && [styles.settingsRowBorder, { borderBottomColor: C.blackAlpha04 }]]}
                    onPress={() => item.route && router.push(item.route as any)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.iconBox, { backgroundColor: item.bg, borderColor: item.border }]}>
                      <ItemIcon size={16} color={item.color} strokeWidth={2} />
                    </View>
                    <View style={styles.rowInfo}>
                      <Text style={[styles.rowLabel, { color: C.text }]}>{item.label}</Text>
                      <Text style={[styles.rowSub, { color: C.muted }]}>{item.sub}</Text>
                    </View>
                    {item.toggle ? (
                      <TouchableOpacity onPress={item.label === 'Biometrics' ? handleBioToggle : undefined} style={[styles.toggleSwitch, (item.label === 'Biometrics' && bioEnabled) ? { backgroundColor: C.greenBright } : { backgroundColor: C.g3 }]}>
                        <View style={[styles.toggleKnob, (item.label === 'Biometrics' && bioEnabled) ? { transform: [{ translateX: 14 }] } : {}]} />
                      </TouchableOpacity>
                    ) : (
                      <ChevronRight size={16} color={C.dim} strokeWidth={2} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={doLogout} activeOpacity={0.7}>
          <LogOut size={16} color={C.red} strokeWidth={2} style={{ marginRight: 8 }} />
          <Text style={[styles.logoutText, { color: C.red }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  top: {
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 32,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  decoGold: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(212,160,23,.15)',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  avatarText: {
    fontSize: 22,
    fontFamily: 'BricolageGrotesque_600',
  },
  name: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 20,
    color: '#fff',
  },
  email: {
    fontFamily: 'Inter_400',
    fontSize: 12,
    color: 'rgba(255,255,255,.5)',
    marginTop: 3,
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: Radii.pill,
    paddingVertical: 5,
    paddingHorizontal: 14,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  tierText: {
    fontSize: 12,
    fontFamily: 'Inter_600',
    color: '#000',
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.25)',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.06)',
  },
  statVal: {
    fontSize: 16,
    fontFamily: 'BricolageGrotesque_600',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'Inter_400',
    color: 'rgba(255,255,255,.4)',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  body: {
    padding: 16,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Inter_600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    ...Shadows.card,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingsRowBorder: {
    borderBottomWidth: 1,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  rowInfo: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500',
  },
  rowSub: {
    fontSize: 11,
    fontFamily: 'Inter_400',
    marginTop: 1,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    position: 'absolute',
    right: 2,
  },
  logoutBtn: {
    height: 50,
    borderRadius: Radii.pill,
    backgroundColor: 'rgba(239,68,68,.06)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'BricolageGrotesque_600',
  },
});
