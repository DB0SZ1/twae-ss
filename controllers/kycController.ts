/**
 * kycController — KYC / Identity Verification API layer
 * Handles BVN, NIN, SSN submission, document uploads, liveness check
 *
 * Reads API_BASE from env. USE_MOCK can be forced via EXPO_PUBLIC_USE_MOCK.
 */
import { apiClient } from '../utils/apiClient';

// ── Types ──────────────────────────────────────────
export type KYCDocType = 'bvn' | 'nin' | 'ssn' | 'passport';

export type KYCStatus = 'pending' | 'processing' | 'verified' | 'failed' | 'requires_docs';

export type KYCTier = 1 | 2 | 3;

export interface KYCSubmitPayload {
  userId: string;
  type: KYCDocType;
  value: string; // encrypted before sending
}

export interface KYCStatusResponse {
  status: KYCStatus;
  tier: KYCTier;
  message: string;
  rejectionReason?: string;
}

export interface DocumentUploadResponse {
  success: boolean;
  documentId: string;
  message: string;
}

export interface TierInfo {
  tier: KYCTier;
  dailyLimit: string;
  features: string[];
  requirements: string[];
}

// ── KYC Endpoints ──────────────────────────────────

/**
 * GET /kyc/requirements — Fetch dynamic dependency constraints by country
 */
export async function getKYCRequirements(countryCode?: string): Promise<string[]> {
  try {
    return await apiClient<string[]>(`/kyc/requirements?country=${countryCode || ''}`);
  } catch {
    // Region-aware defaults when API is unavailable
    const cc = (countryCode || '').toUpperCase();
    if (cc === 'NG') return ['bvn', 'nin'];
    if (cc === 'GH' || cc === 'KE' || cc === 'ZA') return ['passport', 'national_id'];
    if (cc === 'US') return ['ssn'];
    return ['passport', 'proof_of_address'];
  }
}

/**
 * POST /kyc/submit-bvn — Submit BVN for Nigerian users
 */
export async function submitBVN(userId: string, bvn: string): Promise<{ success: boolean; message: string }> {
  return await apiClient('/kyc/submit', {
    method: 'POST',
    body: JSON.stringify({ doc_type: 'bvn', value: bvn }),
  });
}

/**
 * POST /kyc/submit-nin — Submit NIN for Nigerian users
 */
export async function submitNIN(userId: string, nin: string): Promise<{ success: boolean; message: string }> {
  return await apiClient('/kyc/submit', {
    method: 'POST',
    body: JSON.stringify({ doc_type: 'nin', value: nin }),
  });
}

/**
 * POST /kyc/submit-ssn — Submit SSN for US users
 */
export async function submitSSN(userId: string, ssn: string): Promise<{ success: boolean; message: string }> {
  return await apiClient('/kyc/submit', {
    method: 'POST',
    body: JSON.stringify({ doc_type: 'ssn', value: ssn }),
  });
}

/**
 * POST /kyc/submit-passport — Submit passport number
 */
export async function submitPassport(userId: string, passportNumber: string): Promise<{ success: boolean; message: string }> {
  return await apiClient('/kyc/submit', {
    method: 'POST',
    body: JSON.stringify({ doc_type: 'passport', value: passportNumber }),
  });
}

/**
 * GET /kyc/status — Poll KYC verification status
 */
export async function checkKYCStatus(userId: string): Promise<KYCStatusResponse> {
  return await apiClient<KYCStatusResponse>(`/kyc/status`);
}

/**
 * POST /kyc/upload-document — Upload ID document (front/back)
 */
export async function uploadDocument(
  userId: string,
  documentType: 'id_front' | 'id_back' | 'selfie',
  base64Image: string,
  onProgress?: (percent: number) => void
): Promise<DocumentUploadResponse> {
  // Simulate upload progress for UX
  if (onProgress) {
    const intervals = [10, 25, 45, 65, 80, 95, 100];
    for (const pct of intervals) {
      await new Promise(r => setTimeout(r, 300));
      onProgress(pct);
    }
  }

  return await apiClient('/kyc/upload-document', {
    method: 'POST',
    body: JSON.stringify({ documentType, image: base64Image }),
  });
}

/**
 * POST /kyc/liveness-check — Verify liveness from selfie (Smile ID integration)
 */
export async function performLivenessCheck(
  userId: string,
  selfieBase64: string
): Promise<{ success: boolean; score: number; message: string }> {
  return await apiClient('/kyc/liveness-check', {
    method: 'POST',
    body: JSON.stringify({ selfie: selfieBase64 }),
  });
}

/**
 * GET /kyc/tier-info — Get tier details and limits
 */
export function getTierInfo(): TierInfo[] {
  return [
    {
      tier: 1,
      dailyLimit: '₦200,000',
      features: ['Send money', 'Receive money', 'Buy airtime'],
      requirements: ['Phone number', 'Email verification'],
    },
    {
      tier: 2,
      dailyLimit: '₦2,000,000',
      features: ['All Tier 1', 'Bill payments', 'Investments up to ₦500K'],
      requirements: ['BVN or NIN verification'],
    },
    {
      tier: 3,
      dailyLimit: '₦10,000,000',
      features: ['All Tier 2', 'Unlimited investments', 'International transfers'],
      requirements: ['Government ID upload', 'Liveness selfie'],
    },
  ];
}
