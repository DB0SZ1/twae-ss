import * as SecureStore from 'expo-secure-store';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/v1';

export async function getAuthToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('twae_auth_token');
  } catch {
    return null;
  }
}

export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync('twae_auth_token', token);
}

export async function clearAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync('twae_auth_token');
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
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
    // Return empty if not JSON
    data = {};
  }

  if (!res.ok) {
    // If backend returns a structured detail object
    const msg = data.detail || data.message || 'An API error occurred';
    throw new Error(msg);
  }

  return data as T;
}
