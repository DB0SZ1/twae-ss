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
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Fonts, FontSizes, Radii, Shadows, Spacing } from '../../constants/theme';
import { currentUser, portfolioTotal } from '../../constants/mockData';
import { useCurrency } from '../../hooks/useCurrency';

export default function ProfileScreen() {
  const router = useRouter();
  const { abbreviate } = useCurrency();

  const doLogout = () => {
    Alert.alert('Log out?', 'You will be signed out of your account on this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => router.replace('/(auth)/login') },
    ]);
  };

  const settingsGroups = [
    {
      title: 'Account',
      items: [
        { icon: 'person', label: 'Personal Info', sub: 'Name, DOB, address', color: Colors.gsheen, bg: 'rgba(50,100,209,.06)', border: 'rgba(50,100,209,.1)', route: '/(settings)/personal-info' },
        { icon: 'card', label: 'Linked Banks', sub: 'GTBank · 2 accounts', color: Colors.gold3, bg: 'rgba(212,160,23,.06)', border: 'rgba(212,160,23,.1)' },
        { icon: 'layers', label: 'Limits & Tiers', sub: 'Tier 3 · ₦10M daily limit', color: Colors.skyDark, bg: 'rgba(30,95,168,.06)', border: 'rgba(30,95,168,.1)' },
      ],
    },
    {
      title: 'Security',
      items: [
        { icon: 'lock-closed', label: 'Change PIN', sub: 'Last changed 30 days ago', color: Colors.red, bg: 'rgba(239,68,68,.06)', border: 'rgba(239,68,68,.1)', route: '/(settings)/change-pin' },
        { icon: 'finger-print', label: 'Biometrics', sub: 'Face ID · Enabled', color: Colors.gold3, bg: 'rgba(212,160,23,.06)', border: 'rgba(212,160,23,.1)', toggle: true },
        { icon: 'shield-checkmark', label: '2FA Authentication', sub: 'Authenticator app · On', color: Colors.greenBright, bg: 'rgba(74,222,128,.06)', border: 'rgba(74,222,128,.1)', route: '/(settings)/2fa' },
        { icon: 'desktop', label: 'Active Sessions', sub: '2 devices', color: Colors.skyDark, bg: 'rgba(30,95,168,.06)', border: 'rgba(30,95,168,.1)', route: '/(settings)/active-sessions' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'chatbubbles', label: 'Live Chat', sub: 'Chat with a support agent', color: Colors.gsheen, bg: 'rgba(50,100,209,.06)', border: 'rgba(50,100,209,.1)', route: '/(settings)/live-chat' },
        { icon: 'help-circle', label: 'FAQs', sub: 'Common questions answered', color: Colors.gold3, bg: 'rgba(212,160,23,.06)', border: 'rgba(212,160,23,.1)', route: '/(settings)/faqs' },
        { icon: 'trash', label: 'Delete Account', sub: 'Permanently remove your data', color: Colors.red, bg: 'rgba(239,68,68,.06)', border: 'rgba(239,68,68,.1)', route: '/(settings)/delete-account' },
        { icon: 'information-circle', label: 'App Version', sub: 'v1.0.0', color: Colors.dim, bg: 'rgba(0,0,0,.03)', border: 'rgba(0,0,0,.05)' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
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
          <LinearGradient colors={[Colors.gold2, Colors.goldsheen]} style={styles.avatar}>
            <Text style={styles.avatarText}>{currentUser.initials}</Text>
          </LinearGradient>
          <View>
            <Text style={styles.name}>{currentUser.fullName}</Text>
            <Text style={styles.email}>{currentUser.email}</Text>
            <View style={styles.tierPill}>
              <Ionicons name="shield-checkmark" size={12} color="#000" />
              <Text style={styles.tierText}>{currentUser.tierLabel}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>{abbreviate(portfolioTotal, 'NGN')}</Text>
            <Text style={styles.statLabel}>NET WORTH</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>5</Text>
            <Text style={styles.statLabel}>HOLDINGS</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>3</Text>
            <Text style={styles.statLabel}>POCKETS</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Settings List */}
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {settingsGroups.map(group => (
          <View key={group.title}>
            <Text style={styles.sectionTitle}>{group.title}</Text>
            <View style={styles.settingsCard}>
              {group.items.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.settingsRow, i < group.items.length - 1 && styles.settingsRowBorder]}
                  onPress={() => item.route && router.push(item.route as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconBox, { backgroundColor: item.bg, borderColor: item.border }]}>
                    <Ionicons name={item.icon as any} size={16} color={item.color} />
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowLabel}>{item.label}</Text>
                    <Text style={styles.rowSub}>{item.sub}</Text>
                  </View>
                  {item.toggle ? (
                    <View style={styles.toggleSwitch}>
                      <View style={styles.toggleKnob} />
                    </View>
                  ) : (
                    <Ionicons name="chevron-forward" size={16} color={Colors.dim} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={doLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
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
    shadowColor: Colors.gold2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 4,
  },
  avatarText: {
    fontSize: 22,
    fontFamily: 'BricolageGrotesque_600',
    color: Colors.g1,
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
    backgroundColor: Colors.gold2,
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
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingsCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.blackAlpha05,
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
    borderBottomColor: Colors.blackAlpha04,
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
    color: Colors.text,
  },
  rowSub: {
    fontSize: 11,
    fontFamily: 'Inter_400',
    color: Colors.muted,
    marginTop: 1,
  },
  toggleSwitch: {
    width: 44,
    height: 24,
    backgroundColor: Colors.g3,
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
    marginTop: 8,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'BricolageGrotesque_600',
    color: Colors.red,
  },
});
