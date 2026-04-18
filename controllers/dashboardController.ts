/**
 * dashboardController — TWA Home Dashboard API layer
 */
import { apiClient } from '../utils/apiClient';

export interface DashboardData {
  liveWealthAccrued: number;
  projected40YearValue: number;
  ytdContribution: number;
  liabilityCapturePercent: number;
  safetyGovernorStatus: 'green' | 'yellow' | 'red';
  topMovers: Array<{ symbol: string; changePercent: number }>;
  hardRailEnabled: boolean;
  ngnBalance: number;
  usdBalance: number;
  unreadNotifications: number;
  greetingName: string;
}

export async function fetchDashboardData(): Promise<DashboardData> {
  return await apiClient<DashboardData>('/dashboard');
}
