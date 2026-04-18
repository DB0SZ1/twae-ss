/**
 * dashboardController — TWA Home Dashboard API layer
 * Handles fetching dashboard stats, mock generic streams, and governance flags
 *
 * Reads API_BASE from env. USE_MOCK can be forced via EXPO_PUBLIC_USE_MOCK.
 */

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/v1';
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true' || true; // Currently forced True for mock data

import { walletBalances, transactions } from '../constants/mockData';

export interface DashboardData {
  liveWealthAccrued: number;
  projected40YearValue: number;
  ytdContribution: number;
  liabilityCapturePercent: number;
  safetyGovernorStatus: 'green' | 'yellow' | 'red';
  topMovers: Array<{ symbol: string; changePercent: number }>;
  hardRailEnabled: boolean;
}

const mockDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function fetchDashboardData(): Promise<DashboardData> {
  if (USE_MOCK) {
    await mockDelay(600);
    return {
      liveWealthAccrued: 4528.25,
      projected40YearValue: 1250000.0,
      ytdContribution: 12500.0,
      liabilityCapturePercent: 88,
      safetyGovernorStatus: 'green',
      topMovers: [
        { symbol: 'DANGCEM', changePercent: 4.28 },
        { symbol: 'MTNN', changePercent: -1.1 },
        { symbol: 'AAPL', changePercent: 1.5 },
      ],
      hardRailEnabled: false,
    };
  }
  
  const response = await fetch(`${API_BASE}/dashboard`);
  if (!response.ok) throw new Error('Failed to fetch dashboard data');
  return await response.json();
}
