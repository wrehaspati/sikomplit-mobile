import axios, { create } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Development base URL configuration
const getBaseUrl = () => {
  return 'https://sikomplit.playforfun.my.id/api/v1';
};

// Create an Axios instance with the base URL
export const api = create({
  baseURL: getBaseUrl(),
});

// Attach the token to every request
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