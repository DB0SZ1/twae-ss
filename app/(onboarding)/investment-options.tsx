/**
 * twae — Investment Options / TWA Liability Setup (Screen 1.7)
 * Onboarding story screens + Reusable InvestmentConfigSection
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../../components/layouts/AppHeader';
import AppButton from '../../components/atoms/AppButton';
import { Colors } from '../../constants/theme';
import { saveInvestmentPreferences } from '../../controllers/investController';
import InvestmentConfigSection from '../../components/organisms/InvestmentConfigSection';

// ── Onboarding Story Screens ──────────────────────
const storyScreens = [
  {
    icon: 'eye-off-outline',
    title: 'Ghost Wealth',
    subtitle: 'Hidden money in your everyday spending',
    description:
      'Every bill you pay, every subscription, every purchase — there\'s invisible wealth hiding in your liabilities. twae captures it before it disappears.',
    gradient: ['#1a3575', '#3264d1'] as [string, string],
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'L_avail Shield',
    subtitle: 'Your available liability, protected',
    description:
      'We redirect a small percentage of each liability category into real investments — automatically, silently, and securely.',
    gradient: ['#004a99', '#0066cc'] as [string, string],
  },
  {
    icon: 'business-outline',
    title: '40-Year Vault',
    subtitle: 'Your future, compounding now',
    description:
      'Even 5% redirected from everyday spend compounds into hundreds of thousands over 40 years. Set it once. Watch it grow.',
    gradient: ['#b8860b', '#d4a017'] as [string, string],
  },
];

export default function InvestmentOptionsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string; countryCode?: string; skipStory?: string }>();

  // Story phase
  const [showStory, setShowStory] = useState(params.skipStory !== 'true');
  const [storyPage, setStoryPage] = useState(0);
  const storyFade = useRef(new Animated.Value(1)).current;

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
          <Ionicons name={screen.icon as any} size={72} color="#fff" style={{ marginBottom: 24 }} />
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

  return (
    <View style={styles.container}>
      <AppHeader title="Investment Options" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <InvestmentConfigSection 
          showSaveButton 
          onSave={async (groups) => {
            await saveInvestmentPreferences(params.userId || 'curr', groups);
            router.push('/(tabs)');
          }} 
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 24, paddingBottom: 60 },
  storySkip: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 10,
  },
  storySkipText: {
    color: 'rgba(255,255,255,0.6)',
    fontFamily: 'Inter_500',
    fontSize: 14,
  },
  storyDots: {
    position: 'absolute',
    top: 64,
    left: 24,
    flexDirection: 'row',
    gap: 6,
  },
  storyDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  storyDotActive: {
    backgroundColor: '#fff',
  },
  storyContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 40,
  },
  storyTitle: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 36,
    color: '#fff',
    marginBottom: 12,
  },
  storySubtitle: {
    fontFamily: 'Inter_600',
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  storyDesc: {
    fontFamily: 'Inter_400',
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 26,
  },
  storyActions: {
    padding: 24,
    paddingBottom: 48,
  },
});
