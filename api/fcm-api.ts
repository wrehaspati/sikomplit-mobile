import { api } from './api-client';

export const storeFcmToken = async (token: string): Promise<void> => {
  await api.post('/user/fcm/token', { fcm_token: token });
};