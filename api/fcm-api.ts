import { api } from './api-client';

/**
 * Store the FCM token for the authenticated user.
 * @param token 
 */
export const storeFcmToken = async (token: string): Promise<void> => {
  await api.post('/user/fcm/token', { fcm_token: token });
};