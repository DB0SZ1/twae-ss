/**
 * AppHeader — Back button, title, and right action slot
 * Automatically accounts for safe area top inset (notch, dynamic island, status bar).
 * Theme-aware: uses dynamic colors from ThemeContext.
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { Fonts, FontSizes, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  lightText?: boolean;
  /** Set to false if the parent already handles safe area top inset */
  safeTop?: boolean;
}

export default function AppHeader({
  title,
  onBack,
  rightAction,
  transparent = false,
  lightText = false,
  safeTop = true,
}: AppHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C = useThemeColors();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: transparent ? 'transparent' : C.bg },
        safeTop && { paddingTop: insets.top + Spacing.md },
      ]}
    >
      <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
        <ChevronLeft
          size={24}
          color={lightText ? '#fff' : C.text}
          strokeWidth={2}
        />
      </TouchableOpacity>
      <Text
        style={[styles.title, { color: lightText ? '#fff' : C.text }]}
        numberOfLines={1}
      >
        {title}
      </Text>
      <View style={styles.right}>
        {rightAction || <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSizes['2xl'],
    fontFamily: Fonts.headingSemiBold,
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
  },
});
