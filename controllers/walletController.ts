/**
 * walletController — Wallet & Transfers API layer
 */
import { apiClient } from '../utils/apiClient';

export async function fetchWalletBalances() {
  return await apiClient<any>('/wallet/balances');
}

export async function getExchangeRate() {
  return await apiClient<any>('/wallet/exchange-rate');
}

export async function transferMoney(payload: any) {
  return await apiClient<any>('/wallet/transfer', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyBankAccount(accountNo: string, bankCode: string) {
  return await apiClient<any>('/wallet/verify-account', {
    method: 'POST',
    body: JSON.stringify({ accountNumber: accountNo, bankCode }),
  });
}
