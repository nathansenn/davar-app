/**
 * Concrete AuthService wired to expo-crypto (SHA-256, secure RNG) and
 * expo-secure-store (encrypted at rest), with an AsyncStorage fallback on web
 * where SecureStore is unavailable. Kept separate from authService.ts so the
 * core logic can be unit-tested without native modules.
 */

import { Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService, CryptoAdapter, KVStore } from './authService';

const cryptoAdapter: CryptoAdapter = {
  randomHex: async (bytes: number) => {
    const arr = await Crypto.getRandomBytesAsync(bytes);
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  },
  hash: (input: string) =>
    Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input),
};

const useSecureStore = Platform.OS !== 'web';

const kvStore: KVStore = {
  getItem: (key) => (useSecureStore ? SecureStore.getItemAsync(key) : AsyncStorage.getItem(key)),
  setItem: (key, value) =>
    useSecureStore ? SecureStore.setItemAsync(key, value) : AsyncStorage.setItem(key, value),
  removeItem: (key) =>
    useSecureStore ? SecureStore.deleteItemAsync(key) : AsyncStorage.removeItem(key),
};

export const authService = new AuthService(cryptoAdapter, kvStore);
