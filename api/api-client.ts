import axios, { create } from "axios";
import * as SecureStore from "expo-secure-store";
import { DeviceEventEmitter } from "react-native";

// Development base URL configuration
const getBaseUrl = () => {
  return "https://mobile-api-server.sikomplit.com/api/v1";
};

// Create an Axios instance with the base URL
export const api = create({
  baseURL: getBaseUrl(),
});

// Attach the token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      original._retry = true;
      isRefreshing = true;
      const refreshToken = await SecureStore.getItemAsync("refresh_token");

      if (!refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${getBaseUrl()}/user/auth/refresh`, {
          refresh_token: refreshToken,
        });
        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token;

        await SecureStore.setItemAsync("access_token", newAccessToken);
        await SecureStore.setItemAsync("refresh_token", newRefreshToken);

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        original.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(original);
      } catch (err) {
        processQueue(err, null);
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        DeviceEventEmitter.emit('auth.logout');
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);
