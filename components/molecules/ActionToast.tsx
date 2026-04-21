/**
 * ActionToast — Global action feedback toast component
 * Shows contextual confirmation for user actions across all screens.
 * 
 * Usage: ActionToast.show("Copied!", "success")
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Radii } from '../../constants/theme';

const { width } = Dimensions.get('window');

type ToastType = 'success' | 'error' | 'info' | 'loading';

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

// Global singleton reference
let _showToast: ((message: string, type?: ToastType, duration?: number) => void) | null = null;

export const ActionToast = {
  show: (message: string, type: ToastType = 'success', duration: number = 3000) => {
    _showToast?.(message, type, duration);
  },
};

const ICON_MAP: Record<ToastType, { name: string; color: string }> = {
  success: { name: 'checkmark-circle', color: Colors.greenBright },
  error: { name: 'close-circle', color: '#ef4444' },
  info: { name: 'information-circle', color: '#38bdf8' },
  loading: { name: 'sync', color: Colors.gold1 },
};

export default function ActionToastProvider() {
  const [toast, setToast] = useState<ToastState>({ visible: false, message: '', type: 'success' });
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'success', duration: number = 3000) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    setToast({ visible: true, message, type });

    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 10 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    timerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -100, duration: 300, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setToast(prev => ({ ...prev, visible: false })));
    }, duration);
  }, []);

  useEffect(() => {
    _showToast = showToast;
    return () => { _showToast = null; };
  }, [showToast]);

  if (!toast.visible) return null;

  const icon = ICON_MAP[toast.type];

  return (
    <Animated.View 
      style={[
        styles.container,
        { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }
      ]}
      pointerEvents="none"
    >
      <View style={[styles.pill, { borderColor: `${icon.color}30` }]}>
        <Ionicons name={icon.name as any} size={18} color={icon.color} />
        <Text style={styles.message}>{toast.message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: Radii.pill,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  message: {
    fontFamily: 'Inter_500',
    fontSize: 14,
    color: '#fff',
  },
});
