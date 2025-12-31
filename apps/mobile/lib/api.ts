import Constants from 'expo-constants';
import { useAuthStore } from '../store';
import { Platform } from 'react-native';

// API 基础URL
const DEFAULT_API_URL =
  Platform.OS === 'android' ? 'http://10.201.214.15:3000/api' : 'http://localhost:3000/api';

const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || DEFAULT_API_URL;

// 请求配置类型
interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

// API 响应类型
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// 创建请求
async function request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  const { params, ...init } = config;
  const token = useAuthStore.getState().token;

  // 构建URL
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  console.log('[API] Requesting:', url);

  try {
    // 发起请求
    const response = await fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...init.headers,
      },
    });

    // 解析响应
    const json = (await response.json()) as ApiResponse<T>;

    if (!response.ok || !json.success) {
      throw new Error(json.error?.message || '请求失败');
    }

    return json.data as T;
  } catch (error) {
    console.error('[API] Request failed:', url, error);
    throw error;
  }
}

// API 客户端
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string>) =>
    request<T>(endpoint, { method: 'GET', params }),

  post: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: any) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
