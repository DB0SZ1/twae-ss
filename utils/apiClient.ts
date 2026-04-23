import { storage as SecureStore } from './storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/v1';

export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('twa_token') || await SecureStore.getItemAsync('twae_auth_token');
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync('twa_token', token);
  await SecureStore.setItemAsync('twae_auth_token', token);
}

export async function clearAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync('twa_token');
  await SecureStore.deleteItemAsync('twae_auth_token');
}

function toCamel(s: string) {
  return s.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function toSnake(s: string) {
  return s.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function convertKeys(obj: any, converter: (s: string) => string): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (Array.isArray(obj)) return obj.map((i) => convertKeys(i, converter));
  if (obj instanceof Date) return obj;
  
  const mapped: any = {};
  for (const [key, value] of Object.entries(obj)) {
    mapped[converter(key)] = convertKeys(value, converter);
  }
  return mapped;
}

export function snakeToCamel(obj: any): any {
  return convertKeys(obj, toCamel);
}

export function camelToSnake(obj: any): any {
  return convertKeys(obj, toSnake);
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Pragma': 'no-cache',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    let msg = data.detail || data.message || 'An API error occurred';
    if (Array.isArray(msg)) {
      msg = msg.map(m => m.msg || JSON.stringify(m)).join(', ');
    } else if (typeof msg === 'object' && msg !== null) {
      msg = JSON.stringify(msg);
    }
    throw new Error(msg);
  }

  return data as T;
}
