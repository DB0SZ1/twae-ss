/**
 * useAuth — Auth state, token management, session control
 */
import { useState, useCallback, useRef, useEffect } from 'react';


export interface User { id: string; firstName: string; email: string; initials: string; fullName: string; tierLabel: string; }
const currentUser: User = { id: 'x', firstName: 'User', email: 'test@twae.app', initials: 'U', fullName: 'User Account', tierLabel: 'Tier 1' };
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes for demo

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionExpiring, setSessionExpiring] = useState(false);
  const activityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetActivityTimer = useCallback(() => {
    if (activityTimer.current) clearTimeout(activityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    setSessionExpiring(false);

    if (isAuthenticated) {
      warningTimer.current = setTimeout(() => {
        setSessionExpiring(true);
      }, SESSION_TIMEOUT - 60000);

      activityTimer.current = setTimeout(() => {
        logout();
      }, SESSION_TIMEOUT);
    }
  }, [isAuthenticated]);

  const login = useCallback(async (email?: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setUser(currentUser);
    setIsAuthenticated(true);
    setIsLoading(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setSessionExpiring(false);
    if (activityTimer.current) clearTimeout(activityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
  }, []);

  const extendSession = useCallback(() => {
    setSessionExpiring(false);
    resetActivityTimer();
  }, [resetActivityTimer]);

  return {
    user,
    isAuthenticated,
    isLoading,
    sessionExpiring,
    login,
    logout,
    extendSession,
    resetActivityTimer,
  };
}
