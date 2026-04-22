/**
 * useThemeColors — Returns the active color palette based on theme context.
 * 
 * Usage:
 *   const C = useThemeColors();
 *   <View style={{ backgroundColor: C.bg }}>
 *     <Text style={{ color: C.text }}>Hello</Text>
 *   </View>
 */
import { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { LightColors, DarkColors } from '../constants/theme';

// Use a widened type so both palettes are assignable
export type ThemeColors = {
  [K in keyof typeof LightColors]: string;
};

export function useThemeColors(): ThemeColors {
  const { isDark } = useTheme();
  return useMemo(() => isDark ? DarkColors : LightColors, [isDark]);
}
