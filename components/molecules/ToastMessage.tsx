/**
 * ToastMessage — Global toast notification component
 */
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Radii, Shadows, Spacing } from '../../constants/theme';
import { ToastType } from '../../hooks/useToast';

interface ToastMessageProps {
  message: string;
  type: ToastType;
  visible: boolean;
}

const typeConfig: Record<ToastType, { bg: string; icon: string; iconColor: string }> = {
  success: { bg: 'rgba(38,76,163,.92)', icon: 'checkmark-circle', iconColor: '#4ade80' },
  error: { bg: 'rgba(120,20,20,.92)', icon: 'close-circle', iconColor: '#ff5f5f' },
  info: { bg: 'rgba(30,60,80,.92)', icon: 'information-circle', iconColor: '#7aa2ff' },
  warning: { bg: 'rgba(100,70,0,.92)', icon: 'alert-circle', iconColor: '#f0c040' },
};

export default function ToastMessage({ message, type, visible }: ToastMessageProps) {
  const config = typeConfig[type];

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: config.bg,
          opacity: visible ? 1 : 0,
          transform: [{ translateY: visible ? 0 : -80 }],
        },
      ]}
    >
      <Ionicons name={config.icon as any} size={16} color={config.iconColor} />
      <Text style={styles.text} numberOfLines={2}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: Radii.pill,
    maxWidth: 340,
    ...Shadows.toast,
  },
  text: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.bodyMedium,
    color: '#fff',
  },
});
