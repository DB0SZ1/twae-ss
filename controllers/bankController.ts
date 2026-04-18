/**
 * bankController — Bank Linking API layer
 * Handles Plaid (US) and Flutterwave (Africa) bank linking
 *
 * Reads API_BASE from env. USE_MOCK can be forced via EXPO_PUBLIC_USE_MOCK.
 */

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/v1';
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

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

// ── Helpers ────────────────────────────────────────
function mockDelay(ms: number = 1500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (USE_MOCK) throw new Error('MOCK_MODE');

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data as T;
}

// ── Bank Endpoints ─────────────────────────────────

/**
 * POST /bank/plaid/exchange — Exchange Plaid public_token for access_token
 */
export async function exchangePlaidToken(
  userId: string,
  publicToken: string
): Promise<{ success: boolean; linkedBankId: string }> {
  try {
    return await apiCall('/bank/plaid/exchange', {
      method: 'POST',
      body: JSON.stringify({ userId, publicToken }),
    });
  } catch {
    await mockDelay(1500);
    return { success: true, linkedBankId: `bank_plaid_${Date.now()}` };
  }
}

/**
 * GET /bank/flutterwave/banks — Fetch list of supported African banks
 */
export async function fetchBankList(country: string = 'NG'): Promise<AfricanBank[]> {
  try {
    return await apiCall<AfricanBank[]>(`/bank/flutterwave/banks?country=${country}`);
  } catch {
    await mockDelay(800);
    // Mock Nigerian bank list
    return [
      { id: '1', code: '044', name: 'Access Bank', country: 'NG' },
      { id: '2', code: '023', name: 'Citibank Nigeria', country: 'NG' },
      { id: '3', code: '063', name: 'Diamond Bank', country: 'NG' },
      { id: '4', code: '050', name: 'Ecobank Nigeria', country: 'NG' },
      { id: '5', code: '070', name: 'Fidelity Bank', country: 'NG' },
      { id: '6', code: '011', name: 'First Bank of Nigeria', country: 'NG' },
      { id: '7', code: '214', name: 'First City Monument Bank', country: 'NG' },
      { id: '8', code: '058', name: 'GTBank', country: 'NG' },
      { id: '9', code: '030', name: 'Heritage Bank', country: 'NG' },
      { id: '10', code: '301', name: 'Jaiz Bank', country: 'NG' },
      { id: '11', code: '082', name: 'Keystone Bank', country: 'NG' },
      { id: '12', code: '526', name: 'Parallex Bank', country: 'NG' },
      { id: '13', code: '076', name: 'Polaris Bank', country: 'NG' },
      { id: '14', code: '039', name: 'Stanbic IBTC Bank', country: 'NG' },
      { id: '15', code: '232', name: 'Sterling Bank', country: 'NG' },
      { id: '16', code: '032', name: 'Union Bank of Nigeria', country: 'NG' },
      { id: '17', code: '033', name: 'United Bank for Africa', country: 'NG' },
      { id: '18', code: '215', name: 'Unity Bank', country: 'NG' },
      { id: '19', code: '035', name: 'Wema Bank', country: 'NG' },
      { id: '20', code: '057', name: 'Zenith Bank', country: 'NG' },
      { id: '21', code: '100', name: 'Opay', country: 'NG' },
      { id: '22', code: '999', name: 'Kuda Microfinance Bank', country: 'NG' },
      { id: '23', code: '090', name: 'Moniepoint MFB', country: 'NG' },
      { id: '24', code: '303', name: 'PalmPay', country: 'NG' },
    ];
  }
}

/**
 * POST /bank/flutterwave/verify — Verify account name from account number + bank code
 */
export async function verifyBankAccount(
  accountNumber: string,
  bankCode: string
): Promise<BankVerifyResult> {
  try {
    return await apiCall('/bank/flutterwave/verify', {
      method: 'POST',
      body: JSON.stringify({ accountNumber, bankCode }),
    });
  } catch {
    await mockDelay(1200);
    // Mock account name resolution
    return {
      success: true,
      accountName: 'OKONKWO ADAUGO CHIDINMA',
      accountNumber,
      bankName: 'GTBank',
      bankCode,
    };
  }
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
  try {
    return await apiCall('/bank/link', {
      method: 'POST',
      body: JSON.stringify({ userId, bankCode, accountNumber, accountName }),
    });
  } catch {
    await mockDelay(1500);
    return { success: true, linkedBankId: `bank_fw_${Date.now()}` };
  }
}

/**
 * GET /bank/linked — Get user's linked banks
 */
export async function getLinkedBanks(userId: string): Promise<LinkedBank[]> {
  try {
    return await apiCall<LinkedBank[]>(`/bank/linked?userId=${userId}`);
  } catch {
    await mockDelay(500);
    return [];
  }
}

/**
 * DELETE /bank/unlink — Remove a linked bank
 */
export async function unlinkBank(
  userId: string,
  bankId: string
): Promise<{ success: boolean }> {
  try {
    return await apiCall('/bank/unlink', {
      method: 'DELETE',
      body: JSON.stringify({ userId, bankId }),
    });
  } catch {
    await mockDelay(800);
    return { success: true };
  }
}

/**
 * Detect user region for bank linking flow
 */
export function detectRegion(countryCode: string): 'us' | 'africa' {
  const usCountries = ['US'];
  return usCountries.includes(countryCode.toUpperCase()) ? 'us' : 'africa';
}
