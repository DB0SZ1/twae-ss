import { apiClient } from '../utils/apiClient';

export interface SavingsPocket {
  id: string;
  name: string;
  emoji: string;
  type: 'flex' | 'lock';
  currency: string;
  targetAmount: number | null;
  currentAmount: number;
  interestRatePct: number;
  interestEarned: number;
  targetDate: string | null;
  autoSaveEnabled: boolean;
  autoSaveFrequency: 'daily' | 'weekly' | 'monthly' | null;
  autoSaveAmount: number | null;
  nextDebitDate: string | null;
  status: string;
  createdAt: string;
  isMatured: boolean;
}

export interface PocketListResponse {
  pockets: SavingsPocket[];
  totalBalanceNgn: number;
  totalBalanceUsd: number;
}

export interface CreatePocketPayload {
  name: string;
  emoji?: string;
  type: 'flex' | 'lock';
  currency?: string;
  targetAmount?: number;
  targetDate?: string;
  autoSaveEnabled?: boolean;
  autoSaveFrequency?: 'daily' | 'weekly' | 'monthly';
  autoSaveAmount?: number;
}

export interface EditPocketPayload {
  name?: string;
  emoji?: string;
  targetAmount?: number;
  targetDate?: string;
  autoSaveEnabled?: boolean;
  autoSaveFrequency?: 'daily' | 'weekly' | 'monthly';
  autoSaveAmount?: number;
}

export async function fetchSavingsPockets(): Promise<PocketListResponse> {
  return await apiClient<PocketListResponse>('/savings/plans');
}

export async function createPocket(payload: CreatePocketPayload): Promise<SavingsPocket> {
  return await apiClient<SavingsPocket>('/savings/plans', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getPocketDetail(id: string): Promise<SavingsPocket> {
  return await apiClient<SavingsPocket>(`/savings/plans/${id}`);
}

export async function editPocket(id: string, payload: EditPocketPayload): Promise<SavingsPocket> {
  return await apiClient<SavingsPocket>(`/savings/plans/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deletePocket(id: string): Promise<{ message: string }> {
  return await apiClient<{ message: string }>(`/savings/plans/${id}`, {
    method: 'DELETE',
  });
}

export async function fundPocket(id: string, amount: number, source: string, pin: string): Promise<SavingsPocket> {
  return await apiClient<SavingsPocket>(`/savings/plans/${id}/topup`, {
    method: 'POST',
    body: JSON.stringify({ amount, source, pin }),
  });
}

export async function withdrawPocket(id: string, pin: string, amount?: number, destination: string = 'wallet'): Promise<SavingsPocket> {
  return await apiClient<SavingsPocket>(`/savings/plans/${id}/withdraw`, {
    method: 'POST',
    body: JSON.stringify({ amount, pin, destination }),
  });
}
