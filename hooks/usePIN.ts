/**
 * usePIN — PIN entry state and validation logic
 */
import { useState, useCallback, useRef } from 'react';

interface UsePINOptions {
  length?: 4 | 6;
  maxAttempts?: number;
  lockDuration?: number; // ms
  correctPIN?: string;
}

export function usePIN(options: UsePINOptions = {}) {
  const {
    length = 6,
    maxAttempts = 5,
    lockDuration = 30000,
    correctPIN = '123456',
  } = options;

  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const lockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addDigit = useCallback((d: string) => {
    if (isLocked) return;
    setError(false);
    setDigits(prev => {
      if (prev.length >= length) return prev;
      return [...prev, d];
    });
  }, [isLocked, length]);

  const deleteDigit = useCallback(() => {
    if (isLocked) return;
    setError(false);
    setDigits(prev => prev.slice(0, -1));
  }, [isLocked]);

  const verifyPIN = useCallback((): boolean => {
    if (isLocked) return false;
    const entered = digits.join('');
    if (entered === correctPIN) {
      setError(false);
      setAttempts(0);
      return true;
    }
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setError(true);
    setDigits([]);
    if (newAttempts >= maxAttempts) {
      setIsLocked(true);
      lockTimer.current = setTimeout(() => {
        setIsLocked(false);
        setAttempts(0);
      }, lockDuration);
    }
    return false;
  }, [digits, correctPIN, attempts, maxAttempts, isLocked, lockDuration]);

  const resetPIN = useCallback(() => {
    setDigits([]);
    setError(false);
  }, []);

  const isComplete = digits.length === length;
  const attemptsLeft = maxAttempts - attempts;

  return {
    digits,
    addDigit,
    deleteDigit,
    verifyPIN,
    resetPIN,
    isComplete,
    error,
    isLocked,
    attemptsLeft,
    length,
  };
}
