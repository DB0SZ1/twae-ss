/**
 * AppInput — Text input with label, error, and icon support
 * 
 * Uses React.forwardRef so parent screens can chain focus between fields.
 * Theme-aware: uses dynamic colors from ThemeContext.
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
import { Eye, EyeOff } from 'lucide-react-native';
import { Fonts, FontSizes, Radii, Spacing } from '../../constants/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

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
  const C = useThemeColors();

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
      {label ? <Text style={[styles.label, { color: C.muted }]}>{label}</Text> : null}
      <View
        style={[
          styles.inputWrap,
          { backgroundColor: C.surface, borderColor: C.blackAlpha04 },
          focused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {prefix ? <Text style={[styles.prefix, { color: C.muted }]}>{prefix}</Text> : null}
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <TextInput
          ref={ref}
          style={[styles.input, { color: C.text }]}
          placeholderTextColor={C.dim}
          selectionColor={C.gsheen}
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
            {isSecure
              ? <Eye size={18} color={C.dim} strokeWidth={1.5} />
              : <EyeOff size={18} color={C.dim} strokeWidth={1.5} />
            }
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
    marginBottom: 7,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: Radii.sm,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  inputFocused: {
    borderColor: 'rgba(50,100,209,0.45)',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  input: {
    flex: 1,
    alignSelf: 'stretch',
    fontSize: FontSizes.lg,
    fontFamily: Fonts.bodyRegular,
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  prefix: {
    fontSize: FontSizes.base,
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
    color: '#ef4444',
    marginTop: 5,
    paddingLeft: 4,
    fontFamily: Fonts.bodyRegular,
  },
});
