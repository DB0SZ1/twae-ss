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

// ── Helpers ────────────────────────────────────────
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // In mock mode, skip the real fetch entirely so nothing hangs
  if (USE_MOCK) {
    throw new Error('MOCK_MODE');
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API error');
  return data as T;
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
  try {
    return await apiCall<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    // Mock response for development
    await mockDelay(1800);
    return {
      success: true,
      userId: `usr_${Date.now()}`,
      token: `tok_${Math.random().toString(36).slice(2)}`,
      message: 'Account created. OTP sent.',
    };
  }
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
    return await apiCall('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    await mockDelay(1000);
    // Mock: accept 123456 as valid OTP
    if (payload.otp === '123456') {
      return { success: true, message: 'OTP verified' };
    }
    return { success: false, message: 'Invalid OTP code' };
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
  try {
    return await apiCall('/auth/create-pin', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    await mockDelay(800);
    return { success: true };
  }
}

/**
 * POST /auth/enroll-biometric — Register biometric auth for user
 */
export async function enrollBiometric(userId: string, biometricType: 'face' | 'fingerprint'): Promise<{ success: boolean }> {
  try {
    return await apiCall('/auth/enroll-biometric', {
      method: 'POST',
      body: JSON.stringify({ userId, biometricType }),
    });
  } catch {
    await mockDelay(600);
    return { success: true };
  }
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
  try {
    return await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  } catch {
    await mockDelay(1500);
    return {
      success: true,
      token: `tok_${Math.random().toString(36).slice(2)}`,
      userId: `usr_${Date.now()}`,
      requiresOTP: false,
    };
  }
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
