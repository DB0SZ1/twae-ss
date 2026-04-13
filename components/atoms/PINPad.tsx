/**
 * PINPad — Numeric keypad with dot indicator
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Radii, Spacing } from '../../constants/theme';

interface PINPadProps {
  length: 4 | 6;
  digits: string[];
  onDigitPress: (digit: string) => void;
  onDelete: () => void;
  error?: boolean;
  showBiometric?: boolean;
  onBiometricPress?: () => void;
}

export default function PINPad({
  length,
  digits,
  onDigitPress,
  onDelete,
  error = false,
  showBiometric = false,
  onBiometricPress,
}: PINPadProps) {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [showBiometric ? 'bio' : '', '0', 'del'],
  ];

  return (
    <View style={styles.container}>
      {/* Dot Indicator */}
      <View style={styles.dotsRow}>
        {Array.from({ length }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < digits.length && styles.dotFilled,
              error && styles.dotError,
            ]}
          />
        ))}
      </View>

      {/* Keypad */}
      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyRow}>
            {row.map((key, colIndex) => {
              if (key === '') {
                return <View key={colIndex} style={styles.keyEmpty} />;
              }
              if (key === 'del') {
                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={styles.key}
                    onPress={onDelete}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="backspace-outline" size={24} color={Colors.text} />
                  </TouchableOpacity>
                );
              }
              if (key === 'bio') {
                return (
                  <TouchableOpacity
                    key={colIndex}
                    style={styles.key}
                    onPress={onBiometricPress}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="finger-print" size={24} color={Colors.g3} />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={colIndex}
                  style={styles.key}
                  onPress={() => onDigitPress(key)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 40,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.dim,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: Colors.g3,
    borderColor: Colors.g3,
  },
  dotError: {
    borderColor: Colors.red,
    backgroundColor: Colors.red,
  },
  keypad: {
    width: '100%',
    maxWidth: 300,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  keyEmpty: {
    width: 72,
    height: 72,
  },
  keyText: {
    fontSize: 28,
    fontFamily: Fonts.headingMedium,
    color: Colors.text,
  },
});
