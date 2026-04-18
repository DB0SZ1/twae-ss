/**
 * investController — Investment / TWA Liability API layer
 * Handles liability groups, projections, and asset destinations
 */

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/v1';

// ── Types ──────────────────────────────────────────
export type LiabilityGroupId = 1 | 2 | 3 | 4;

export interface LiabilityGroup {
  id: LiabilityGroupId;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  redirectPercent: number; // 0-100
  assetDestination: string;
  isActive: boolean; // false = coming soon placeholder
}

export interface AssetDestination {
  id: string;
  name: string;
  ticker: string;
  type: 'etf' | 'bond' | 'crypto' | 'cash';
  historicalReturn: number; // annual %
  icon: string;
}

export interface ProjectionResult {
  years: number;
  totalInvested: number;
  projectedValue: number;
  currency: string;
  breakdown: Array<{
    assetName: string;
    value: number;
    percentage: number;
  }>;
}

export interface InvestmentPreferences {
  userId: string;
  groups: LiabilityGroup[];
  savedAt: string;
}

// ── Helpers ────────────────────────────────────────
function mockDelay(ms: number = 1500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Data ───────────────────────────────────────────

export function getDefaultLiabilityGroups(): LiabilityGroup[] {
  return [
    {
      id: 1,
      name: 'Mandatory Spend',
      description: 'Utilities, rent, subscriptions — redirect savings from bills you\'re already paying',
      icon: 'receipt-outline',
      enabled: true,
      redirectPercent: 5,
      assetDestination: 'sp500',
      isActive: true,
    },
    {
      id: 2,
      name: 'Discounts & Cashback',
      description: 'Auto-invest your discount savings and cashback rewards',
      icon: 'pricetag-outline',
      enabled: false,
      redirectPercent: 10,
      assetDestination: 'muni_bond',
      isActive: true,
    },
    {
      id: 3,
      name: 'Loyalty Points',
      description: 'Convert loyalty points to real investments instead of letting them expire',
      icon: 'star-outline',
      enabled: false,
      redirectPercent: 15,
      assetDestination: 'btc_etf',
      isActive: true,
    },
    {
      id: 4,
      name: 'Government Programs',
      description: 'Tax rebates, subsidies, and government cashback auto-invested',
      icon: 'shield-outline',
      enabled: false,
      redirectPercent: 20,
      assetDestination: 'cash_reserve',
      isActive: true,
    },
  ];
}

export function getAssetDestinations(): AssetDestination[] {
  return [
    {
      id: 'sp500',
      name: 'S&P 500 ETF',
      ticker: 'VOO',
      type: 'etf',
      historicalReturn: 10.5,
      icon: '📈',
    },
    {
      id: 'muni_bond',
      name: 'Municipal Bond',
      ticker: 'MUB',
      type: 'bond',
      historicalReturn: 4.2,
      icon: '🏛️',
    },
    {
      id: 'btc_etf',
      name: 'Bitcoin ETF',
      ticker: 'IBIT',
      type: 'crypto',
      historicalReturn: 25.0,
      icon: '₿',
    },
    {
      id: 'cash_reserve',
      name: 'Cash Reserve',
      ticker: 'HYSA',
      type: 'cash',
      historicalReturn: 5.0,
      icon: '💰',
    },
  ];
}

export function getPlaceholderSlots(): Array<{ id: number; name: string }> {
  return Array.from({ length: 10 }, (_, i) => ({
    id: i + 5,
    name: `Category ${i + 5}`,
  }));
}

// ── Endpoints ──────────────────────────────────────

/**
 * Calculate 40-year vault projection based on liability redirects
 */
export function calculateProjection(
  groups: LiabilityGroup[],
  monthlySpend: number = 200000, // ₦200k default
  years: number = 40
): ProjectionResult {
  const destinations = getAssetDestinations();
  let totalInvested = 0;
  let projectedValue = 0;
  const breakdown: ProjectionResult['breakdown'] = [];

  const activeGroups = groups.filter(g => g.enabled && g.isActive);

  for (const group of activeGroups) {
    const monthlyRedirect = (monthlySpend * (group.redirectPercent / 100));
    const dest = destinations.find(d => d.id === group.assetDestination);
    if (!dest) continue;

    const annualContribution = monthlyRedirect * 12;
    const totalContrib = annualContribution * years;
    totalInvested += totalContrib;

    // Compound interest: FV = PMT × [((1 + r)^n - 1) / r]
    const monthlyRate = dest.historicalReturn / 100 / 12;
    const months = years * 12;
    const fv = monthlyRedirect * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    projectedValue += fv;

    breakdown.push({
      assetName: dest.name,
      value: fv,
      percentage: 0, // calculated below
    });
  }

  // Calculate percentages
  for (const item of breakdown) {
    item.percentage = projectedValue > 0 ? (item.value / projectedValue) * 100 : 0;
  }

  return {
    years,
    totalInvested,
    projectedValue,
    currency: '₦',
    breakdown,
  };
}

/**
 * POST /invest/save-preferences — Save user's liability group preferences
 */
export async function saveInvestmentPreferences(
  userId: string,
  groups: LiabilityGroup[]
): Promise<{ success: boolean }> {
  try {
    await mockDelay(1000);
    return { success: true };
  } catch {
    return { success: false };
  }
}

// ── Flow 4 (Investments API) ───────────────────────
import { apiClient } from '../utils/apiClient';

export async function submitRiskProfile(score: number): Promise<{ riskLevel: string; recommendedAllocation: string }> {
  try {
    return await apiClient<{ riskLevel: string; recommendedAllocation: string }>('/investment/risk-profile', {
      method: 'POST',
      body: JSON.stringify({ score })
    });
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export async function fetchAssets(): Promise<any[]> {
  try {
    return await apiClient<any[]>('/investment/assets', {
      method: 'GET'
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function fetchPortfolio(): Promise<any> {
  try {
    return await apiClient<any>('/investment/portfolio', {
      method: 'GET'
    });
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function buyAsset(assetId: string, amount: number, currency: string, pin: string): Promise<any> {
    return await apiClient<any>('/investment/trade/buy', {
      method: 'POST',
      body: JSON.stringify({ asset_id: assetId, amount, currency, pin })
    });
}

export async function sellAsset(assetId: string, percentage: number, pin: string): Promise<any> {
    return await apiClient<any>('/investment/trade/sell', {
      method: 'POST',
      body: JSON.stringify({ asset_id: assetId, percentage, pin })
    });
}

export async function fetchOrderHistory(): Promise<any[]> {
    try {
        return await apiClient<any[]>('/investment/orders', {
          method: 'GET'
        });
    } catch (e) {
        console.error(e);
        return [];
    }
}
