import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { Colors, Radii } from '../../constants/theme';

export default function OfflineBanner() {
  const isConnected = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: isConnected === false ? insets.top || 16 : -100,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  }, [isConnected, insets.top]);

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY: anim }] }]} pointerEvents="none">
      <Text style={styles.text}>No Internet Connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    backgroundColor: '#b91c1c', // red-700
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: Radii.pill,
    alignItems: 'center',
    zIndex: 9999,
  },
  text: {
    fontFamily: 'Inter_600',
    fontSize: 13,
    color: '#fff',
  }
});
