/**
 * AppInput — Text input with label, error, and icon support
 * 
 * Uses React.forwardRef so parent screens can chain focus between fields.
 * Minimal focus state change — only borderColor, no shadows/elevation.
 */
import React, { useState, forwardRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, FontSizes, Radii, Spacing } from '../../constants/theme';

interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefix?: string;
  containerStyle?: ViewStyle;
}

const AppInput = forwardRef<TextInput, AppInputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  prefix,
  secureTextEntry,
  containerStyle,
  onFocus,
  onBlur,
  ...rest
}, ref) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [focused, setFocused] = useState(false);

  const handleFocus = useCallback((e: any) => {
    setFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  const handleBlur = useCallback((e: any) => {
    setFocused(false);
    onBlur?.(e);
  }, [onBlur]);

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <TextInput
          ref={ref}
          style={styles.input}
          placeholderTextColor={Colors.dim}
          selectionColor={Colors.gsheen}
          secureTextEntry={isSecure}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.rightIconBtn}
            onPress={() => setIsSecure(prev => !prev)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons
              name={isSecure ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={Colors.dim}
            />
          </TouchableOpacity>
        ) : null}
        {rightIcon && !secureTextEntry ? (
          <View style={styles.rightIcon}>{rightIcon}</View>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

AppInput.displayName = 'AppInput';
export default AppInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.bodyMedium,
    color: Colors.muted,
    marginBottom: 7,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: Radii.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.blackAlpha04,
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: 'rgba(50,100,209,0.45)',
  },
  inputError: {
    borderColor: Colors.red,
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    fontSize: FontSizes.lg,
    fontFamily: Fonts.bodyRegular,
    color: Colors.text,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  prefix: {
    fontSize: FontSizes.base,
    color: Colors.muted,
    fontFamily: Fonts.bodyRegular,
    marginRight: 8,
  },
  leftIcon: {
    marginRight: 10,
  },
  rightIcon: {
    marginLeft: 10,
  },
  rightIconBtn: {
    marginLeft: 10,
    padding: 4,
  },
  error: {
    fontSize: FontSizes.xs,
    color: Colors.red,
    marginTop: 5,
    paddingLeft: 4,
    fontFamily: Fonts.bodyRegular,
  },
});
