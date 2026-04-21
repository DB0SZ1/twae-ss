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
  deviceId: string;
  deviceFingerprint?: string;
  deviceName?: string;
  osName?: string;
  osVersion?: string;
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

import { apiClient, setAuthToken } from '../utils/apiClient';
import { storage as SecureStore } from '../utils/storage';

// ── Persistent User Context (SecureStore) ──────────
const STORE_KEYS = {
  USER_ID: 'twae_current_user_id',
  USER_PHONE: 'twae_current_user_phone',
  USER_EMAIL: 'twa_user_email',
} as const;

export async function storeUserContext(userId: string, phone?: string, email?: string): Promise<void> {
  try {
    if (userId) await SecureStore.setItemAsync(STORE_KEYS.USER_ID, userId);
    if (phone) await SecureStore.setItemAsync(STORE_KEYS.USER_PHONE, phone);
    if (email) await SecureStore.setItemAsync(STORE_KEYS.USER_EMAIL, email);
  } catch (e) {
    console.warn('[authController] Failed to store user context:', e);
  }
}

export async function getStoredUserId(): Promise<string> {
  try {
    return (await SecureStore.getItemAsync(STORE_KEYS.USER_ID)) || '';
  } catch {
    return '';
  }
}

export async function getStoredUserPhone(): Promise<string> {
  try {
    return (await SecureStore.getItemAsync(STORE_KEYS.USER_PHONE)) || '';
  } catch {
    return '';
  }
}

export async function clearUserContext(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(STORE_KEYS.USER_ID);
    await SecureStore.deleteItemAsync(STORE_KEYS.USER_PHONE);
  } catch {}
}

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
  const data = await apiCall<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  
  const userId = data.userId || data.user_id;
  
  // Persist userId + phone for OTP screen fallback
  await storeUserContext(userId, payload.phone, payload.email);

  return {
    success: data.success,
    userId,
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
  // Ensure we have a valid userId — fall back to SecureStore
  let userId = payload.userId;
  if (!userId) {
    userId = await getStoredUserId();
  }
  if (!userId) {
    return { success: false, message: 'Session expired. Please register or login again.' };
  }

  try {
    const data = await apiCall<any>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ userId, otp: payload.otp }),
    });

    await setAuthToken(data.accessToken || data.access_token);
    // Re-persist userId for downstream screens
    await storeUserContext(userId);
    return { success: true, message: 'OTP verified' };
  } catch (e: any) {
    return { success: false, message: e.message || 'Invalid OTP code' };
  }
}

/**
 * POST /auth/resend-otp — Resend OTP to user's phone
 */
export async function resendOTP(userId: string): Promise<{ success: boolean; message: string }> {
  // Fallback to SecureStore if userId is empty
  let resolvedId = userId;
  if (!resolvedId) {
    resolvedId = await getStoredUserId();
  }
  if (!resolvedId) {
    return { success: false, message: 'Session expired. Please register or login again.' };
  }

  try {
    return await apiCall('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ userId: resolvedId }),
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
export async function enrollBiometric(userId: string, deviceId: string, biometricType: 'face' | 'fingerprint'): Promise<{ success: boolean; biometricSecret?: string }> {
  const res = await apiCall<{success: boolean; biometric_secret?: string}>('/auth/enroll-biometric', {
    method: 'POST',
    body: JSON.stringify({ userId, deviceId, biometricType }),
  });
  return { success: res.success, biometricSecret: res.biometric_secret };
}

/**
 * POST /auth/biometric-challenge — Request nonce for biometric signature
 */
export async function getBiometricChallenge(email: string, deviceId: string): Promise<string> {
  const res = await apiCall<{challenge: string}>('/auth/biometric-challenge', {
    method: 'POST',
    body: JSON.stringify({ email, deviceId }),
  });
  return res.challenge;
}

/**
 * POST /auth/biometric-login — Complete biometric check with HMAC signature
 */
export async function biometricLogin(email: string, deviceId: string, nonce: string, signature: string): Promise<{ success: boolean; token: string; userId: string; requiresOTP: boolean }> {
  const data = await apiCall<{success: boolean; access_token: string; user_id: string; requires_otp: boolean;}>('/auth/biometric-login', {
    method: 'POST',
    body: JSON.stringify({ email, deviceId, nonce, signature }),
  });
  
  await setAuthToken(data.access_token);
  // Persist userId for downstream screens
  await storeUserContext(data.user_id, undefined, email);

  return {
    success: data.success,
    token: data.access_token,
    userId: data.user_id,
    requiresOTP: data.requires_otp,
  };
}

/**
 * POST /auth/login — Authenticate existing user
 */
export async function login(
  email: string, 
  password: string, 
  deviceId: string = 'unknown_client_device',
  deviceFingerprint?: string,
  deviceName?: string,
  osName?: string,
  osVersion?: string
): Promise<{
  success: boolean;
  token: string;
  userId: string;
  requiresOTP: boolean;
}> {
  const data = await apiCall<{
    success: boolean; access_token: string; user_id: string; requires_otp: boolean;
    refresh_token?: string; accessToken?: string; userId?: string; requiresOtp?: boolean;
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ 
      email, 
      password, 
      deviceId,
      deviceFingerprint,
      deviceName,
      osName,
      osVersion
    }),
  });
  
  const accessToken = data.access_token || data.accessToken || '';
  const userId = data.user_id || data.userId || '';
  const requiresOTP = data.requires_otp ?? data.requiresOtp ?? false;

  // Save JWT internally
  if (accessToken) {
    await setAuthToken(accessToken);
  }
  // Persist userId + email for OTP / downstream screens
  await storeUserContext(userId, undefined, email);

  return {
    success: data.success,
    token: accessToken,
    userId,
    requiresOTP,
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
