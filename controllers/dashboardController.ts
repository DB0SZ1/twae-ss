/**
 * dashboardController — TWA Home Dashboard API layer
 */
import { apiClient } from '../utils/apiClient';

export interface TopMover {
  symbol: string;
  change_percent: number;
}

export interface DashboardResponse {
  live_wealth_accrued: number;
  projected_40_year_value: number;
  ytd_contribution: number;
  liability_capture_percent: number;
  top_movers: TopMover[];
  ngn_balance: number;
  usd_balance: number;
  unread_notifications: number;
  greeting_name: string;
  email: string;
  full_name: string;
  tier: string;
}

export interface PocketResponse {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  currency: string;
  auto_save_enabled: boolean;
  progress_percentage: number;
  color?: string;
}

export interface PocketListResponse {
  pockets: PocketResponse[];
  total_balance_ngn: number;
  total_balance_usd: number;
}

export interface PortfolioResponse {
  holdings: any[];
  total_value_usd: number;
  total_invested_usd: number;
  total_unrealized_pnl_usd: number;
  total_pnl_percentage: number;
  daily_pnl_usd: number;
}

export interface TransactionResponse {
  id: string;
  type: string;
  amount: number;
  currency: 'NGN' | 'USD';
  status: string;
  created_at: string;
  partner_name?: string;
  description?: string;
  category?: string;
  name?: string;
}

export interface TransactionListResponse {
  transactions: TransactionResponse[];
  page: number;
  total_pages: number;
  total_count: number;
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
    apiClient<PocketListResponse>('/savings/plans').catch(() => ({ pockets: [], total_balance_ngn: 0, total_balance_usd: 0 })),
    apiClient<PortfolioResponse>('/investment/portfolio').catch(() => ({ holdings: [], total_value_usd: 0, total_invested_usd: 0, total_unrealized_pnl_usd: 0, total_pnl_percentage: 0, daily_pnl_usd: 0 })),
    apiClient<TransactionListResponse>('/wallet/transactions?per_page=5').catch(() => ({ transactions: [], page: 1, total_pages: 1, total_count: 0 }))
  ]);

  return {
    dashboard,
    savings,
    portfolio,
    transactions: txns
  };
}
