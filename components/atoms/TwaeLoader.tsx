/**
 * TwaeLoader — Custom animated loading indicator using the Twae logo
 * Rotates with a smooth ease-in-out and pulses opacity for a premium feel.
 * Drop-in replacement for ActivityIndicator everywhere in the app.
 */
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View, StyleSheet, Image } from 'react-native';

interface TwaeLoaderProps {
  size?: number;
  color?: string;
}

const logoSource = require('../../assets/Twae-Logo.png');

export default function TwaeLoader({ size = 48 }: TwaeLoaderProps) {
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 2400,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      })
    );

    const breathe = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.6,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    spin.start();
    breathe.start();

    return () => {
      spin.stop();
      breathe.stop();
    };
  }, []);

  const spinInterpolation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={{
          transform: [{ rotate: spinInterpolation }],
          opacity: pulse,
        }}
      >
        <Image
          source={logoSource}
          style={{ width: size, height: size }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
