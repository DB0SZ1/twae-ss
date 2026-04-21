/**
 * bankController — Bank Linking API layer
 * Handles Plaid (US) and Flutterwave (Africa) bank linking
 */

import { apiClient } from '../utils/apiClient';

// ── Types ──────────────────────────────────────────
export interface PlaidLinkResult {
  publicToken: string;
  accountId: string;
  institutionName: string;
  accountMask: string; // last 4 digits
  accountType: 'checking' | 'savings';
}

export interface AfricanBank {
  id: string;
  code: string;
  name: string;
  logo?: string;
  country: string;
}

export interface BankVerifyResult {
  success: boolean;
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
}

export interface LinkedBank {
  id: string;
  bankName: string;
  accountMask: string;
  accountName: string;
  isPrimary: boolean;
  provider: 'plaid' | 'flutterwave';
}

// ── Bank Endpoints ─────────────────────────────────

/**
 * POST /bank/plaid/exchange — Exchange Plaid public_token for access_token
 */
export async function exchangePlaidToken(
  userId: string,
  publicToken: string
): Promise<{ success: boolean; linkedBankId: string }> {
  return await apiClient('/bank/plaid/exchange', {
    method: 'POST',
    body: JSON.stringify({ userId, public_token: publicToken }),
  });
}

/**
 * GET /bank/flutterwave/banks — Fetch list of supported African banks
 */
export async function fetchBankList(country: string = 'NG'): Promise<AfricanBank[]> {
  return await apiClient<AfricanBank[]>(`/bank/flutterwave/banks?country=${country}`);
}

/**
 * POST /bank/flutterwave/verify — Verify account name from account number + bank code
 */
export async function verifyBankAccount(
  accountNumber: string,
  bankCode: string
): Promise<BankVerifyResult> {
  // Backend schema uses account_number and bank_code in some places 
  // Let's send in camelCase mapping internally if needed, or pass exact format backend wants.
  // The BankVerifyRequest schema has `account_number` and `bank_code`
  return await apiClient('/bank/flutterwave/verify', {
    method: 'POST',
    body: JSON.stringify({ account_number: accountNumber, bank_code: bankCode }),
  });
}

/**
 * POST /bank/link — Link a bank account (Africa flow)
 */
export async function linkBankAccount(
  userId: string,
  bankCode: string,
  accountNumber: string,
  accountName: string
): Promise<{ success: boolean; linkedBankId: string }> {
  return await apiClient('/bank/link', {
    method: 'POST',
    body: JSON.stringify({ 
      user_id: userId, 
      bank_code: bankCode, 
      account_number: accountNumber, 
      account_name: accountName 
    }),
  });
}

/**
 * GET /bank/linked — Get user's linked banks
 */
export async function getLinkedBanks(userId: string): Promise<LinkedBank[]> {
  return await apiClient<LinkedBank[]>(`/bank/linked?userId=${userId}`);
}

/**
 * DELETE /bank/unlink — Remove a linked bank
 */
export async function unlinkBank(
  userId: string,
  bankId: string
): Promise<{ success: boolean }> {
  return await apiClient(`/bank/unlink/${bankId}`, {
    method: 'DELETE',
  });
}

/**
 * Detect user region for bank linking flow
 */
export function detectRegion(countryCode: string): 'us' | 'africa' {
  const usCountries = ['US'];
  return usCountries.includes(countryCode.toUpperCase()) ? 'us' : 'africa';
}
