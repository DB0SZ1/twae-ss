/**
 * twae — Biometric Authentication Utilities
 * Wraps expo-local-authentication to handle Keychain access and cryptographic signatures.
 */
import * as LocalAuthentication from 'expo-local-authentication';
import { storage as SecureStore } from './storage';

const BIOMETRIC_SECRET_KEY = 'twae_device_biometric_secret';

/**
 * Check if the device has biometric hardware and is enrolled.
 */
export async function checkBiometricSupport(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
}

/**
 * Perform a biometric prompt (FaceID/Fingerprint) to return the secured device secret.
 * Requires user to physically authenticate.
 */
export async function getBiometricSecretWithPrompt(promptMessage: string = 'Authenticate to continue'): Promise<string | null> {
  const support = await checkBiometricSupport();
  if (!support) {
    throw new Error('Biometrics not supported or not enrolled on this device');
  }

  // To access SecureStore items without requiring biometrics, use normal SecureStore.getItemAsync
  // However, expo-secure-store's requireAuthentication flag can force biometrics automatically on iOS.
  // We'll enforce a manual prompt here for cross-platform consistency.
  const authResult = await LocalAuthentication.authenticateAsync({
    promptMessage,
    fallbackLabel: 'Use PIN',
    disableDeviceFallback: false,
  });

  if (authResult.success) {
    const rawSecret = await SecureStore.getItemAsync(BIOMETRIC_SECRET_KEY);
    return rawSecret;
  }
  
  return null;
}

/**
 * Securely stash the biometric_secret received from the backend enroll endpoint.
 * In a real app, you would pass `requireAuthentication: true` in SecureStore options on iOS.
 */
export async function storeBiometricSecret(secret: string): Promise<void> {
  await SecureStore.setItemAsync(BIOMETRIC_SECRET_KEY, secret);
}

/**
 * Signs a challenge nonce using the biometric secret using standard HMAC.
 * Returns the hex digest signature.
 * 
 * Note: React Native doesn't have a built-in Node crypto module.
 * We'll simulate the HMAC using a fast lightweight hash or passing it to a lightweight lib if available.
 * For this skeleton, we'll implement a mock deterministic signature or lightweight hash for demo purposes.
 * In production, you'd use react-native-quick-crypto.
 */
import HmacSHA256 from 'crypto-js/hmac-sha256';
import Hex from 'crypto-js/enc-hex';

export function signChallengeWithSecret(nonce: string, secret: string): string {
  const hash = HmacSHA256(nonce, secret);
  return hash.toString(Hex);
}
