/**
 * useCurrency — Format and convert between NGN and USD
 */
import { useCallback } from 'react';
import { exchangeRate } from '../constants/mockData';

export function useCurrency() {
  const formatNGN = useCallback((amount: number, showSymbol = true): string => {
    const formatted = Math.abs(amount).toLocaleString('en-NG', {
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
    const sign = amount < 0 ? '-' : '';
    return showSymbol ? `${sign}₦${formatted}` : `${sign}${formatted}`;
  }, []);

  const formatUSD = useCallback((amount: number, showSymbol = true): string => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const sign = amount < 0 ? '-' : '';
    return showSymbol ? `${sign}$${formatted}` : `${sign}${formatted}`;
  }, []);

  const format = useCallback((amount: number, currency: 'NGN' | 'USD', showSymbol = true): string => {
    return currency === 'NGN' ? formatNGN(amount, showSymbol) : formatUSD(amount, showSymbol);
  }, [formatNGN, formatUSD]);

  const abbreviate = useCallback((amount: number, currency: 'NGN' | 'USD'): string => {
    const symbol = currency === 'NGN' ? '₦' : '$';
    const abs = Math.abs(amount);
    if (abs >= 1_000_000_000) return `${symbol}${(abs / 1_000_000_000).toFixed(1)}B`;
    if (abs >= 1_000_000) return `${symbol}${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${symbol}${(abs / 1_000).toFixed(1)}K`;
    return format(amount, currency);
  }, [format]);

  const convert = useCallback((amount: number, from: 'NGN' | 'USD', to: 'NGN' | 'USD'): number => {
    if (from === to) return amount;
    return from === 'NGN' ? amount * exchangeRate.ngnToUsd : amount * exchangeRate.usdToNgn;
  }, []);

  const getSymbol = useCallback((currency: 'NGN' | 'USD'): string => {
    return currency === 'NGN' ? '₦' : '$';
  }, []);

  return { formatNGN, formatUSD, format, abbreviate, convert, getSymbol };
}
