/**
 * governorController — Fiduciary Governor (DVA) API layer
 */
import { apiClient } from '../utils/apiClient';

export interface GovernorConfig {
  id: string;
  is_enabled: boolean;
  buffer_percent: number;
  hard_rail_enabled: boolean;
  spend_limit_daily: number;
  spend_limit_weekly: number;
  bill_protection_enabled: boolean;
  estimated_monthly_bills: number;
  alert_on_large_spend: boolean;
  large_spend_threshold: number;
  alert_on_low_balance: boolean;
  low_balance_threshold: number;
  risk_tolerance: string;
}

export interface GovernorAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  message: string;
  is_read: boolean;
  transaction_id?: string;
  created_at: string;
}

export interface GovernorStatus {
  status: 'green' | 'yellow' | 'red';
  l_avail: number;
  total_balance: number;
  reserved_for_bills: number;
  buffer_percent: number;
  hard_rail_active: boolean;
  message: string;
  recent_alerts: GovernorAlert[];
}

export interface SpendCheckResult {
  allowed: boolean;
  blocked: boolean;
  warning: string | null;
}

export async function fetchGovernorStatus(): Promise<GovernorStatus> {
  return await apiClient<GovernorStatus>('/governor/status');
}

export async function fetchGovernorConfig(): Promise<GovernorConfig> {
  return await apiClient<GovernorConfig>('/governor/config');
}

export async function updateGovernorConfig(updates: Partial<GovernorConfig>): Promise<GovernorConfig> {
  return await apiClient<GovernorConfig>('/governor/config', {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

export async function fetchGovernorAlerts(): Promise<GovernorAlert[]> {
  return await apiClient<GovernorAlert[]>('/governor/alerts');
}

export async function markAlertRead(alertId: string) {
  return await apiClient<any>(`/governor/alerts/${alertId}/read`, { method: 'PATCH' });
}

export async function markAllAlertsRead() {
  return await apiClient<any>('/governor/alerts/read-all', { method: 'POST' });
}

export async function checkSpend(amount: number, currency: string = 'NGN'): Promise<SpendCheckResult> {
  return await apiClient<SpendCheckResult>('/governor/check-spend', {
    method: 'POST',
    body: JSON.stringify({ amount, currency }),
  });
}
