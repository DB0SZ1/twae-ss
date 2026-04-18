/**
 * walletController — Wallet & Transfers API layer
 * Handles fetching balances, Add Money, Send Money, FX Convert
 */

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/v1';
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true' || true;

const mockDelay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export async function fetchWalletBalances() {
  if (USE_MOCK) {
    await mockDelay(400);
    return {
      ngnBalance: 1250000.50,
      usdBalance: 450.75,
    };
  }
  const response = await fetch(`${API_BASE}/wallet/balances`);
  if (!response.ok) throw new Error('Failed to fetch wallet balances');
  return response.json();
}

export async function getExchangeRate() {
  if (USE_MOCK) {
    await mockDelay(300);
    return { rate: 1560.50, expiresAt: Date.now() + 30000 };
  }
  const response = await fetch(`${API_BASE}/wallet/exchange-rate`);
  if (!response.ok) throw new Error('Failed to fetch exchange rate');
  return response.json();
}

export async function transferMoney(payload: any) {
  if (USE_MOCK) {
    await mockDelay(1500);
    return { success: true, ref: `TXN_${Date.now()}` };
  }
  const response = await fetch(`${API_BASE}/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error('Transfer failed');
  return response.json();
}

export async function verifyBankAccount(accountNo: string, bankCode: string) {
  if (USE_MOCK) {
    await mockDelay(600);
    if (accountNo.length === 10) return { success: true, name: 'Adaugo Okonkwo' };
    throw new Error('Invalid account number');
  }
  // Connects to actual endpoint defined in bank backend 
  const response = await fetch(`${API_BASE}/bank/flutterwave/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountNumber: accountNo, bankCode })
  });
  if (!response.ok) throw new Error('Verification failed');
  return response.json();
}
