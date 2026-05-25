import axios, { create } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Development base URL configuration
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://192.168.1.50:8000/api/v1';

    // return 'http://10.0.2.2:8000/api/v1';
  }
  if (Platform.OS === 'ios') {
    return 'http://192.168.1.50:8000/api/v1';
  }
  return 'http://localhost:8000/api/v1';
};

export const api = create({
  baseURL: getBaseUrl(),
});

// Attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const refreshToken = await SecureStore.getItemAsync('refresh_token');
    // If no refresh token, just continue with the initial error
    if (!refreshToken) return Promise.reject(error);
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const { data } = await axios.post(`${getBaseUrl()}/auth/refresh`, { refreshToken });
      await SecureStore.setItemAsync('access_token', data.accessToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    }
    return Promise.reject(error);
  }
);