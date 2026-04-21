import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Dimensions } from 'react-native';
import { Colors, Radii, Shadows } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface ToastItem {
  id: string;
  amount: number;
  merchant: string;
  latency_ms: number;
}

interface WealthToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

const { width } = Dimensions.get('window');

const ToastNode = ({ item, onDismiss }: { item: ToastItem, onDismiss: () => void }) => {
  const panAnim = useRef(new Animated.ValueXY({ x: 0, y: -100 })).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pop in
    Animated.parallel([
      Animated.spring(panAnim, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
        bounciness: 12,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();

    // Auto dismiss after 4 seconds
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(panAnim, { toValue: { x: width, y: 0 }, duration: 400, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 400, useNativeDriver: true })
      ]).start(() => onDismiss());
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[
      styles.toastCard,
      { opacity: opacityAnim, transform: panAnim.getTranslateTransform() }
    ]}>
      <View style={styles.glowBox}>
        <Text style={styles.sign}>+</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.amount}>${item.amount.toFixed(2)} Captured</Text>
        <Text style={styles.merchant}>from {item.merchant}</Text>
      </View>
      <View style={styles.latencyBadge}>
        <View style={styles.latencyDot} />
        <Text style={styles.latencyTxt}>{item.latency_ms}ms</Text>
      </View>
    </Animated.View>
  );
};

export default function WealthToast({ toasts, onDismiss }: WealthToastProps) {
  const insets = useSafeAreaInsets();
  
  if (toasts.length === 0) return null;

  return (
    <View style={[styles.container, { top: insets.top + 16 }]} pointerEvents="none">
      {toasts.slice(0, 3).map((item, index) => (
        <ToastNode key={item.id} item={item} onDismiss={() => onDismiss(item.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999,
    gap: 12,
  },
  toastCard: {
    backgroundColor: '#1E293B',
    borderRadius: Radii.card,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.2)', // Amber subtle border
    ...Shadows.cardLg,
    shadowColor: Colors.gold1,
  },
  glowBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(234,179,8,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sign: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 24,
    color: Colors.gold1,
    marginTop: -2,
  },
  amount: {
    fontFamily: 'BricolageGrotesque_600',
    fontSize: 16,
    color: '#fff',
  },
  merchant: {
    fontFamily: 'Inter_400',
    fontSize: 13,
    color: Colors.dim,
    marginTop: 2,
  },
  latencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74,222,128,0.1)', // Green
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.pill,
  },
  latencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.greenBright,
    marginRight: 6,
  },
  latencyTxt: {
    fontFamily: 'Inter_600',
    fontSize: 10,
    color: Colors.greenBright,
  }
});
