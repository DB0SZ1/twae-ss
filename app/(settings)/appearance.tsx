/**
 * Twae — Appearance Settings Screen
 * Toggle between Light / Dark / Auto (system) theme
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sun, Moon, Monitor } from 'lucide-react-native';
import AppHeader from '../../components/layouts/AppHeader';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import { Fonts, FontSizes, Radii, Spacing } from '../../constants/theme';

const options: { key: ThemeMode; label: string; icon: typeof Sun; desc: string }[] = [
  { key: 'light', label: 'Light', icon: Sun, desc: 'Always use light theme' },
  { key: 'dark', label: 'Dark', icon: Moon, desc: 'Always use dark theme' },
  { key: 'auto', label: 'Auto', icon: Monitor, desc: 'Match device setting' },
];

export default function AppearanceScreen() {
  const { mode, setMode } = useTheme();
  const C = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <AppHeader title="Appearance" />

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: C.muted }]}>THEME</Text>

        {options.map(opt => {
          const isActive = mode === opt.key;
          const Icon = opt.icon;
          return (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.option,
                { backgroundColor: C.surface, borderColor: isActive ? C.g3 : C.blackAlpha04 },
                isActive && { borderColor: C.g3, borderWidth: 2 },
              ]}
              onPress={() => setMode(opt.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, { backgroundColor: isActive ? 'rgba(74,122,255,.1)' : C.blackAlpha04 }]}>
                <Icon size={22} color={isActive ? C.g3 : C.muted} strokeWidth={2} />
              </View>
              <View style={styles.textWrap}>
                <Text style={[styles.optionLabel, { color: C.text }]}>{opt.label}</Text>
                <Text style={[styles.optionDesc, { color: C.muted }]}>{opt.desc}</Text>
              </View>
              {isActive && (
                <View style={[styles.activeDot, { backgroundColor: C.g3 }]} />
              )}
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.footer, { color: C.dim }]}>
          When set to Auto, Twae will follow your device's system appearance setting.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xxl },
  sectionTitle: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.xs,
    letterSpacing: 1,
    marginBottom: Spacing.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: Radii.sm,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  textWrap: { flex: 1 },
  optionLabel: {
    fontFamily: Fonts.headingSemiBold,
    fontSize: FontSizes.lg,
    marginBottom: 2,
  },
  optionDesc: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  footer: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    lineHeight: 18,
    marginTop: Spacing.lg,
    textAlign: 'center',
  },
});
