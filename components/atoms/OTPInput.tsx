/**
 * OTPInput — 6 individual digit boxes with auto-advance
 */
import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Clipboard,
  Platform,
} from 'react-native';
import { Colors, Fonts, FontSizes, Radii, Spacing } from '../../constants/theme';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  error?: boolean;
}

export default function OTPInput({
  length = 6,
  onComplete,
  error = false,
}: OTPInputProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    // Handle paste
    if (text.length > 1) {
      const chars = text.slice(0, length).split('');
      const newValues = [...values];
      chars.forEach((char, i) => {
        if (index + i < length) newValues[index + i] = char;
      });
      setValues(newValues);
      const nextIndex = Math.min(index + chars.length, length - 1);
      refs.current[nextIndex]?.focus();
      if (newValues.every(v => v !== '')) {
        onComplete(newValues.join(''));
      }
      return;
    }

    const newValues = [...values];
    newValues[index] = text;
    setValues(newValues);

    if (text && index < length - 1) {
      refs.current[index + 1]?.focus();
    }

    if (newValues.every(v => v !== '')) {
      onComplete(newValues.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !values[index] && index > 0) {
      refs.current[index - 1]?.focus();
      const newValues = [...values];
      newValues[index - 1] = '';
      setValues(newValues);
    }
  };

  const clearAll = () => {
    setValues(Array(length).fill(''));
    refs.current[0]?.focus();
  };

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => (
        <TextInput
          key={index}
          ref={ref => (refs.current[index] = ref)}
          style={[
            styles.box,
            values[index] ? styles.boxFilled : {},
            error && styles.boxError,
          ]}
          value={values[index]}
          onChangeText={text => handleChange(text, index)}
          onKeyPress={e => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={index === 0 ? length : 1} // Allow paste on first
          selectionColor={Colors.gsheen}
          autoFocus={index === 0}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: Radii.xs,
    borderWidth: 1.5,
    borderColor: Colors.blackAlpha05,
    backgroundColor: Colors.surface,
    textAlign: 'center',
    fontSize: 22,
    fontFamily: Fonts.headingSemiBold,
    color: Colors.text,
  },
  boxFilled: {
    borderColor: Colors.g3,
    backgroundColor: 'rgba(50,100,209,.04)',
  },
  boxError: {
    borderColor: Colors.red,
    backgroundColor: 'rgba(239,68,68,.04)',
  },
});
