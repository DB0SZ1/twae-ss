/**
 * EmptyState — Illustrated empty state with CTA
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../atoms/AppButton';
import { Colors, Fonts, FontSizes, Spacing } from '../../constants/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message: string;
  cta?: {
    label: string;
    onPress: () => void;
  };
}

export default function EmptyState({ icon = 'file-tray-outline', title, message, cta }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon as any} size={48} color={Colors.dim} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {cta && (
        <View style={styles.ctaWrap}>
          <AppButton
            label={cta.label}
            onPress={cta.onPress}
            size="md"
            fullWidth={false}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontFamily: Fonts.headingSemiBold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: FontSizes.base,
    fontFamily: Fonts.bodyRegular,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaWrap: {
    marginTop: Spacing.xxl,
  },
});
