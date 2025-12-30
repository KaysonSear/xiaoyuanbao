/**
 * Secure Storage Module
 * 使用 expo-secure-store 进行加密存储
 * iOS: Keychain Services
 * Android: Encrypted SharedPreferences / Keystore
 */
import * as SecureStore from 'expo-secure-store';
import { StateStorage } from 'zustand/middleware';

// Token 存储键
const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

/**
 * Zustand 兼容的安全存储适配器
 * 实现 StateStorage 接口用于 persist middleware
 */
export const SecureStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await SecureStore.getItemAsync(name);
    } catch (error) {
      console.warn('[SecureStorage] getItem error:', error);
      return null;
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(name, value);
    } catch (error) {
      console.error('[SecureStorage] setItem error:', error);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(name);
    } catch (error) {
      console.warn('[SecureStorage] removeItem error:', error);
    }
  },
};

// ============= 便捷函数 =============

/**
 * 保存 Token 到安全存储
 */
export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * 从安全存储获取 Token
 */
export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * 从安全存储删除 Token
 */
export async function deleteToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * 保存用户信息到安全存储
 */
export async function saveUser(user: object): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

/**
 * 从安全存储获取用户信息
 */
export async function getUser<T>(): Promise<T | null> {
  const data = await SecureStore.getItemAsync(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

/**
 * 从安全存储删除用户信息
 */
export async function deleteUser(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_KEY);
}

/**
 * 清除所有认证相关的安全存储
 */
export async function clearAuthStorage(): Promise<void> {
  await Promise.all([deleteToken(), deleteUser()]);
}
