/**
 * useGhostEngine — Real-time TWA capture event hook
 * 
 * Connects to the WebSocket server, parses Ghost Engine events,
 * and updates Shadow Action Feed state with exponential backoff reconnection.
 */
import { useState, useEffect, useRef, useCallback } from 'react';

export interface CaptureEvent {
  id: string;
  amount: number;
  merchant: string;
  latency_ms: number;
  status: string;
  timestamp: number;
}

export interface GhostEngineState {
  captures: CaptureEvent[];
  totalWealth: number;
  latestEvent: CaptureEvent | null;
  isConnected: boolean;
}

export default function useGhostEngine(userId: string, token: string) {
  const [state, setState] = useState<GhostEngineState>({
    captures: [],
    totalWealth: 0,
    latestEvent: null,
    isConnected: false,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const retryDelayRef = useRef(1000);
  const unmountedRef = useRef(false);

  const connect = useCallback(() => {
    if (unmountedRef.current || !userId) return;

    const baseUrl = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000')
      .replace(/^http/, 'ws');
    
    const ws = new WebSocket(`${baseUrl}/ws/${userId}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      retryDelayRef.current = 1000; // Reset backoff
      setState(prev => ({ ...prev, isConnected: true }));
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        
        if (payload.type === 'capture_event' || payload.event === 'capture_event') {
          const data = payload.data || payload;
          const capture: CaptureEvent = {
            id: `cap_${Date.now()}`,
            amount: data.amount || 0,
            merchant: data.merchant || 'Ghost Capture',
            latency_ms: data.latency_ms || 0,
            status: data.status || 'completed',
            timestamp: Date.now(),
          };

          setState(prev => ({
            captures: [capture, ...prev.captures].slice(0, 50),
            totalWealth: prev.totalWealth + capture.amount,
            latestEvent: capture,
            isConnected: true,
          }));
        }

        if (payload.type === 'investment_executed' || payload.event === 'investment_executed') {
          const data = payload.data || payload;
          const investEvent: CaptureEvent = {
            id: `inv_${Date.now()}`,
            amount: data.amount || 0,
            merchant: `Invested in ${data.ticker || 'Asset'}`,
            latency_ms: 0,
            status: data.status || 'success',
            timestamp: Date.now(),
          };

          setState(prev => ({
            ...prev,
            captures: [investEvent, ...prev.captures].slice(0, 50),
            latestEvent: investEvent,
          }));
        }

        if (payload.type === 'market_price_update') {
          // Global market price updates — can be consumed by charts
          // No state mutation needed here; the price will be in the payload
        }
      } catch (e) {
        console.log('Ghost Engine WS parse error:', e);
      }
    };

    ws.onclose = () => {
      setState(prev => ({ ...prev, isConnected: false }));
      if (unmountedRef.current) return;

      // Exponential backoff: 1s → 2s → 4s → 8s → max 30s
      setTimeout(() => {
        retryDelayRef.current = Math.min(retryDelayRef.current * 2, 30000);
        connect();
      }, retryDelayRef.current);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [userId, token]);

  useEffect(() => {
    unmountedRef.current = false;
    connect();
    return () => {
      unmountedRef.current = true;
      wsRef.current?.close();
    };
  }, [connect]);

  return state;
}
