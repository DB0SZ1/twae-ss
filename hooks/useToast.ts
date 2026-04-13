/**
 * useToast — Global toast trigger
 * Exposes showToast() callable from any screen.
 */
import { useState, useCallback, useRef } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastState extends ToastConfig {
  id: number;
  visible: boolean;
}

let globalShowToast: ((config: ToastConfig) => void) | null = null;

export function showToastGlobal(config: ToastConfig) {
  if (globalShowToast) globalShowToast(config);
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);
  const idCounter = useRef(0);

  const showToast = useCallback((config: ToastConfig) => {
    const id = ++idCounter.current;
    const newToast: ToastState = {
      ...config,
      id,
      visible: true,
      duration: config.duration || 3000,
    };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 400);
    }, config.duration || 3000);
  }, []);

  const hideToast = useCallback((id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 400);
  }, []);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Register global handler
  globalShowToast = showToast;

  return { toasts, showToast, hideToast, clearAll };
}
