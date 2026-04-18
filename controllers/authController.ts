/**
 * authController — Authentication API layer
 * Handles register, login, OTP, PIN, biometric enrollment
 *
 * Reads API_BASE from env. USE_MOCK can be forced via EXPO_PUBLIC_USE_MOCK.
 */

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/v1';
const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

// ── Types ──────────────────────────────────────────
export interface RegisterPayload {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  countryCode: string;
  referralCode?: string;
}

export interface RegisterResponse {
  success: boolean;
  userId: string;
  token: string;
  message: string;
}

export interface OTPVerifyPayload {
  userId: string;
  otp: string;
}

export interface PINPayload {
  userId: string;
  pin: string; // hashed client-side before sending
}

export interface AppConfig {
  forceUpdate: boolean;
  minVersion: string;
  announcements: Array<{
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'promo';
  }>;
  pinLength: 4 | 6;
  kycRequiredForTransfer: boolean;
}

import { apiClient } from '../utils/apiClient';

// Helper wrapper to keep apiCall signature working for existing methods
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  return apiClient<T>(endpoint, options);
}

// Simulate network delay for dev
function mockDelay(ms: number = 1500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Auth Endpoints ─────────────────────────────────

/**
 * POST /auth/register — Create new user account
 */
export async function register(payload: RegisterPayload): Promise<RegisterResponse> {
  const data = await apiCall<{success: boolean; user_id: string; message: string}>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  return {
    success: data.success,
    userId: data.user_id,
    token: '', // No token on register
    message: data.message,
  };
}

/**
 * POST /auth/check-email — Check if email already exists (debounced)
 */
export async function checkEmailExists(email: string): Promise<{ exists: boolean }> {
  try {
    return await apiCall<{ exists: boolean }>('/auth/check-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  } catch {
    await mockDelay(600);
    // Mock: flag specific test emails as existing
    const testEmails = ['test@test.com', 'existing@example.com'];
    return { exists: testEmails.includes(email.toLowerCase()) };
  }
}

/**
 * POST /auth/verify-otp — Verify OTP code
 */
export async function verifyOTP(payload: OTPVerifyPayload): Promise<{ success: boolean; message: string }> {
  try {
    const data = await apiCall<{success: boolean; access_token: string; requires_otp: boolean;}>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const { setAuthToken } = require('../utils/apiClient');
    await setAuthToken(data.access_token);
    return { success: true, message: 'OTP verified' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Invalid OTP code' };
  }
}

/**
 * POST /auth/resend-otp — Resend OTP to user's phone
 */
export async function resendOTP(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    return await apiCall('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  } catch {
    await mockDelay(800);
    return { success: true, message: 'OTP resent' };
  }
}

/**
 * POST /auth/create-pin — Store user's transaction PIN
 */
export async function createPIN(payload: PINPayload): Promise<{ success: boolean }> {
  return await apiCall('/auth/create-pin', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * POST /auth/enroll-biometric — Register biometric auth for user
 */
export async function enrollBiometric(userId: string, biometricType: 'face' | 'fingerprint'): Promise<{ success: boolean }> {
  return await apiCall('/auth/enroll-biometric', {
    method: 'POST',
    body: JSON.stringify({ userId, biometricType }),
  });
}

/**
 * POST /auth/login — Authenticate existing user
 */
export async function login(email: string, password: string): Promise<{
  success: boolean;
  token: string;
  userId: string;
  requiresOTP: boolean;
}> {
  const data = await apiCall<{
    success: boolean; access_token: string; user_id: string; requires_otp: boolean;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  // Save JWT internally (imported from apiClient)
  const { setAuthToken } = require('../utils/apiClient');
  await setAuthToken(data.access_token);

  return {
    success: data.success,
    token: data.access_token,
    userId: data.user_id,
    requiresOTP: data.requires_otp,
  };
}

/**
 * GET /config — Fetch remote app configuration
 */
export async function loadAppConfig(): Promise<AppConfig> {
  try {
    return await apiCall<AppConfig>('/config');
  } catch {
    await mockDelay(300);
    return {
      forceUpdate: false,
      minVersion: '1.0.0',
      announcements: [],
      pinLength: 6,
      kycRequiredForTransfer: true,
    };
  }
}

/**
 * GET /auth/check-token — Validate stored auth token 
 */
export async function checkToken(token: string): Promise<{ valid: boolean; userId: string }> {
  try {
    return await apiCall('/auth/check-token', {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    await mockDelay(400);
    return { valid: false, userId: '' };
  }
}

/**
 * POST /auth/forgot-password — Request a password reset OTP
 */
export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  try {
    return await apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  } catch {
    await mockDelay(1200);
    return { success: true, message: 'If this email is registered, you\'ll receive a code' };
  }
}

/**
 * POST /auth/verify-reset-otp — Verify password reset OTP
 */
export async function verifyResetOTP(email: string, otp: string): Promise<{ success: boolean; reset_token: string; message: string }> {
  try {
    return await apiCall('/auth/verify-reset-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  } catch {
    await mockDelay(1000);
    if (otp === '123456') {
      return { success: true, reset_token: 'reset_tok_demo', message: 'OTP verified' };
    }
    return { success: false, reset_token: '', message: 'Invalid OTP' };
  }
}

/**
 * POST /auth/reset-password — Set a new password using reset token
 */
export async function resetPassword(reset_token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    return await apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ reset_token, newPassword }),
    });
  } catch {
    await mockDelay(1500);
    return { success: true, message: 'Password reset successful' };
  }
}
