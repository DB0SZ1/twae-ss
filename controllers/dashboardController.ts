/**
 * dashboardController — TWA Home Dashboard API layer
 */
import { apiClient } from '../utils/apiClient';

export interface TopMover {
  symbol: string;
  changePercent: number;
}

export interface DashboardResponse {
  liveWealthAccrued: number;
  projected40YearValue: number;
  ytdContribution: number;
  liabilityCapturePercent: number;
  safetyGovernorStatus: 'green' | 'yellow' | 'red';
  topMovers: TopMover[];
  hardRailEnabled: boolean;
  ngnBalance: number;
  usdBalance: number;
  unreadNotifications: number;
  greetingName: string;
}

export interface PocketResponse {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  autoSaveEnabled: boolean;
  progressPercentage: number;
  color?: string;
}

export interface PocketListResponse {
  pockets: PocketResponse[];
  totalBalanceNgn: number;
  totalBalanceUsd: number;
}

export interface PortfolioResponse {
  holdings: any[];
  totalValueUsd: number;
  totalInvestedUsd: number;
  totalUnrealizedPnlUsd: number;
  totalPnlPercentage: number;
  dailyPnlUsd: number;
}

export interface TransactionResponse {
  id: string;
  type: string;
  amount: number;
  currency: 'NGN' | 'USD';
  status: string;
  createdAt: string;
  partnerName?: string;
  description?: string;
  category?: string;
  name?: string;
}

export interface TransactionListResponse {
  transactions: TransactionResponse[];
  page: number;
  totalPages: number;
  totalCount: number;
}

export interface DashboardAggregatedData {
  dashboard: DashboardResponse;
  savings: PocketListResponse;
  portfolio: PortfolioResponse;
  transactions: TransactionListResponse;
}

export async function fetchDashboardData(): Promise<DashboardAggregatedData> {
  // We use Promise.all to drastically reduce Time-to-Interact on the Home tab
  const [dashboard, savings, portfolio, txns] = await Promise.all([
    apiClient<DashboardResponse>('/dashboard'),
    apiClient<PocketListResponse>('/savings/plans').catch(() => ({ pockets: [], totalBalanceNgn: 0, totalBalanceUsd: 0 })),
    apiClient<PortfolioResponse>('/investment/portfolio').catch(() => ({ holdings: [], totalValueUsd: 0, totalInvestedUsd: 0, totalUnrealizedPnlUsd: 0, totalPnlPercentage: 0, dailyPnlUsd: 0 })),
    apiClient<TransactionListResponse>('/wallet/transactions?per_page=5').catch(() => ({ transactions: [], page: 1, totalPages: 1, totalCount: 0 }))
  ]);

  return {
    dashboard,
    savings,
    portfolio,
    transactions: txns
  };
}
