import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const storage = {
  async setItemAsync(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (e) {
      console.warn(`[storage] Failed to set ${key}:`, e);
    }
  },
  
  async getItemAsync(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (e) {
      console.warn(`[storage] Failed to get ${key}:`, e);
      return null;
    }
  },
  
  async deleteItemAsync(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (e) {
      console.warn(`[storage] Failed to delete ${key}:`, e);
    }
  }
};
