/**
 * walletController — Wallet & Transfers API layer
 */
import { apiClient } from '../utils/apiClient';

export async function fetchWalletBalances() {
  return await apiClient<any>('/wallet/balances');
}

export async function fetchVirtualAccount() {
  return await apiClient<any>('/wallet/virtual-account');
}

export async function fundWallet(payload: { amount: number; currency: string; method: string }) {
  return await apiClient<any>('/wallet/fund', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function transferMoney(payload: any) {
  return await apiClient<any>('/wallet/transfer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getExchangeRate(fromCurrency: string = 'NGN', toCurrency: string = 'USD') {
  return await apiClient<any>(`/wallet/exchange-rate?from_currency=${fromCurrency}&to_currency=${toCurrency}`);
}

export async function convertCurrency(payload: { fromCurrency: string; toCurrency: string; amount: number }) {
  // Map JS camelCase to the snake_case expected by Pydantic if needed, but fetch uses JSON strings.
  // The backend Pydantic model uses camelCase for the frontend, but wait — backend expects snake_case unless configured. Let's send snake_case to be safe, or check backend schemas.
  return await apiClient<any>('/wallet/convert', {
    method: 'POST',
    body: JSON.stringify({
      from_currency: payload.fromCurrency,
      to_currency: payload.toCurrency,
      amount: payload.amount,
    }),
  });
}

export async function verifyBankAccount(accountNo: string, bankCode: string) {
  return await apiClient<any>('/wallet/verify-account', {
    method: 'POST',
    body: JSON.stringify({ account_number: accountNo, bank_code: bankCode }),
  });
}

export async function fetchBankList() {
  return await apiClient<any>('/wallet/bank-list');
}

export async function fetchBeneficiaries() {
  return await apiClient<any>('/wallet/beneficiaries');
}

export async function fetchTransactions(type?: string) {
  const query = type ? `?type=${type}` : '';
  return await apiClient<any>(`/wallet/transactions${query}`);
}
