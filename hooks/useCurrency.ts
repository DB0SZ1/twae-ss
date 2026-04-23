/**
 * useCurrency — Country-aware currency formatting
 * Reads user's country_code from SecureStore / profile context
 * to determine the primary display currency.
 */
import { useCallback, useState, useEffect } from 'react';
import { storage as SecureStore } from '../utils/storage';

type CurrencyCode = 'NGN' | 'USD' | 'GHS' | 'KES' | 'ZAR';

const CURRENCY_MAP: Record<string, { code: CurrencyCode; symbol: string; locale: string }> = {
  NG: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
  GH: { code: 'GHS', symbol: 'GH₵', locale: 'en-GH' },
  KE: { code: 'KES', symbol: 'KSh', locale: 'en-KE' },
  ZA: { code: 'ZAR', symbol: 'R', locale: 'en-ZA' },
  US: { code: 'USD', symbol: '$', locale: 'en-US' },
};

const exchangeRate = { ngnToUsd: 1/1560.50, usdToNgn: 1560.50 };

export function useCurrency() {
  const [userCountry, setUserCountry] = useState<string>('NG');

  useEffect(() => {
    SecureStore.getItemAsync('twa_country_code').then(cc => {
      if (cc) setUserCountry(cc.toUpperCase());
    });
  }, []);

  const currencyInfo = CURRENCY_MAP[userCountry] || CURRENCY_MAP['NG'];

  const formatLocal = useCallback((amount: number, showSymbol = true): string => {
    const formatted = Math.abs(amount).toLocaleString(currencyInfo.locale, {
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
    const sign = amount < 0 ? '-' : '';
    return showSymbol ? `${sign}${currencyInfo.symbol}${formatted}` : `${sign}${formatted}`;
  }, [currencyInfo]);

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

  const format = useCallback((amount: number, currency: 'NGN' | 'USD' | string, showSymbol = true): string => {
    if (currency === 'LOCAL') return formatLocal(amount, showSymbol);
    if (currency === 'NGN') return formatNGN(amount, showSymbol);
    return formatUSD(amount, showSymbol);
  }, [formatNGN, formatUSD, formatLocal]);

  const abbreviate = useCallback((amount: number, currency: 'NGN' | 'USD' | string): string => {
    const symbol = currency === 'LOCAL' ? currencyInfo.symbol : (currency === 'NGN' ? '₦' : '$');
    const abs = Math.abs(amount);
    if (abs >= 1_000_000_000) return `${symbol}${(abs / 1_000_000_000).toFixed(1)}B`;
    if (abs >= 1_000_000) return `${symbol}${(abs / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `${symbol}${(abs / 1_000).toFixed(1)}K`;
    return format(amount, currency);
  }, [format, currencyInfo]);

  const convert = useCallback((amount: number, from: 'NGN' | 'USD', to: 'NGN' | 'USD'): number => {
    if (from === to) return amount;
    return from === 'NGN' ? amount * exchangeRate.ngnToUsd : amount * exchangeRate.usdToNgn;
  }, []);

  const getSymbol = useCallback((currency?: 'NGN' | 'USD' | 'LOCAL' | string): string => {
    if (!currency || currency === 'LOCAL') return currencyInfo.symbol;
    if (currency === 'NGN') return '₦';
    if (currency === 'USD') return '$';
    return currencyInfo.symbol;
  }, [currencyInfo]);

  return {
    formatNGN, formatUSD, formatLocal, format, abbreviate, convert, getSymbol,
    primaryCurrency: currencyInfo.code,
    primarySymbol: currencyInfo.symbol,
    countryCode: userCountry,
  };
}
