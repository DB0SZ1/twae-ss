/**
 * AppButton — Primary, secondary, ghost, and danger button variants
 * Theme-aware: uses dynamic colors from ThemeContext.
 */
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fonts, Radii, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import TwaeLoader from './TwaeLoader';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

export default function AppButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  iconRight,
  fullWidth = true,
  style,
  size = 'lg',
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const C = useThemeColors();

  const heights = { sm: 40, md: 48, lg: 54 };
  const fontSizes = { sm: 13, md: 14, lg: 16 };

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[fullWidth && { width: '100%' }, style]}
      >
        <LinearGradient
          colors={[C.g2, C.g3]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.base,
            { height: heights[size] },
            isDisabled && styles.disabled,
          ]}
        >
          {loading ? (
            <TwaeLoader size={22} />
          ) : (
            <View style={styles.content}>
              {icon && <View style={styles.iconLeft}>{icon}</View>}
              <Text style={[styles.label, styles.labelPrimary, { fontSize: fontSizes[size] }]}>
                {label}
              </Text>
              {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles: Record<string, { bg: ViewStyle; text: TextStyle }> = {
    secondary: {
      bg: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.blackAlpha05 },
      text: { color: C.text },
    },
    ghost: {
      bg: { backgroundColor: 'transparent' },
      text: { color: C.muted },
    },
    danger: {
      bg: { backgroundColor: 'rgba(239,68,68,.06)', borderWidth: 1, borderColor: 'rgba(239,68,68,.1)' },
      text: { color: C.red },
    },
  };

  const vs = variantStyles[variant] || variantStyles.secondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        vs.bg,
        { height: heights[size] },
        isDisabled && styles.disabled,
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <TwaeLoader size={20} />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconLeft}>{icon}</View>}
          <Text style={[styles.label, vs.text, { fontSize: fontSizes[size] }]}>{label}</Text>
          {iconRight && <View style={styles.iconRight}>{iconRight}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontFamily: Fonts.headingSemiBold,
    letterSpacing: 0.3,
  },
  labelPrimary: {
    color: '#fff',
  },
  iconLeft: {
    marginRight: 4,
  },
  iconRight: {
    marginLeft: 4,
  },
  disabled: {
    opacity: 0.5,
  },
});
