/**
 * CurrencyText — Format and display NGN or USD amounts
 */
import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { useCurrency } from '../../hooks/useCurrency';
import { Fonts, FontSizes, Colors } from '../../constants/theme';

interface CurrencyTextProps {
  amount: number;
  currency: 'NGN' | 'USD';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  color?: string;
  abbreviate?: boolean;
  weight?: 'regular' | 'medium' | 'semibold';
  style?: TextStyle;
  prefix?: string;
  showSign?: boolean;
}

export default function CurrencyText({
  amount,
  currency,
  size = 'md',
  color,
  abbreviate = false,
  weight = 'semibold',
  style,
  prefix,
  showSign = false,
}: CurrencyTextProps) {
  const { format, abbreviate: abbr } = useCurrency();

  const formatted = abbreviate ? abbr(amount, currency) : format(amount, currency);
  const displayText = prefix
    ? `${prefix}${formatted}`
    : showSign && amount > 0
    ? `+${formatted}`
    : formatted;

  const sizeFontMap: Record<string, number> = {
    sm: FontSizes.sm,
    md: FontSizes.base,
    lg: FontSizes.xl,
    xl: FontSizes['2xl'],
    '2xl': FontSizes['5xl'],
    '3xl': FontSizes['7xl'],
  };

  const weightFontMap: Record<string, string> = {
    regular: Fonts.headingRegular,
    medium: Fonts.headingMedium,
    semibold: Fonts.headingSemiBold,
  };

  const autoColor = amount < 0 ? Colors.red : amount > 0 && showSign ? Colors.greenBright : Colors.text;

  return (
    <Text
      style={[
        {
          fontSize: sizeFontMap[size],
          fontFamily: weightFontMap[weight],
          color: color || autoColor,
        },
        style,
      ]}
    >
      {displayText}
    </Text>
  );
}
