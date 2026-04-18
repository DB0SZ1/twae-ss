/**
 * AppHeader — Back button, title, and right action slot
 * Automatically accounts for safe area top inset (notch, dynamic island, status bar).
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Spacing } from '../../constants/theme';
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
        transparent && styles.transparent,
        safeTop && { paddingTop: insets.top + Spacing.md },
      ]}
    >
      <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.7}>
        <Ionicons
          name="chevron-back"
          size={24}
          color={lightText ? '#fff' : Colors.text}
        />
      </TouchableOpacity>
      <Text
        style={[styles.title, lightText && styles.titleLight]}
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
    backgroundColor: Colors.bg,
  },
  transparent: {
    backgroundColor: 'transparent',
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
    color: Colors.text,
  },
  titleLight: {
    color: '#fff',
  },
  right: {
    width: 40,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
  },
});
