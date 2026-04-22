/**
 * ThemeContext — Global dark/light mode provider
 * 
 * Detects device color scheme via useColorScheme().
 * Persists user override ("light" | "dark" | "auto") in SecureStore.
 * Exposes: mode, setMode, isDark, resolvedScheme
 */
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '../utils/storage';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextValue {
  /** User's chosen preference */
  mode: ThemeMode;
  /** Update and persist user preference */
  setMode: (m: ThemeMode) => void;
  /** Whether the resolved theme is dark */
  isDark: boolean;
  /** The resolved scheme after applying user override */
  resolvedScheme: 'light' | 'dark';
}

const STORE_KEY = 'twae_theme_pref';

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'auto',
  setMode: () => {},
  isDark: false,
  resolvedScheme: 'light',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceScheme = useColorScheme() ?? 'light';
  const [mode, setModeState] = useState<ThemeMode>('auto');
  const [loaded, setLoaded] = useState(false);

  // Load persisted preference on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await storage.getItemAsync(STORE_KEY);
        if (saved === 'light' || saved === 'dark' || saved === 'auto') {
          setModeState(saved);
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const setMode = useCallback(async (m: ThemeMode) => {
    setModeState(m);
    try {
      await storage.setItemAsync(STORE_KEY, m);
    } catch {}
  }, []);

  const resolvedScheme = useMemo(() => {
    if (mode === 'auto') return deviceScheme;
    return mode;
  }, [mode, deviceScheme]);

  const isDark = resolvedScheme === 'dark';

  const value = useMemo(() => ({
    mode, setMode, isDark, resolvedScheme,
  }), [mode, setMode, isDark, resolvedScheme]);

  // Don't render until we've loaded the persisted preference (prevents flash)
  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
