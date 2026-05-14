import { ApiResponse } from "@/types/response";
import { ICredentials, ISession } from "@/types/session";
import { api } from "./api-client";

interface LoginResponse extends ApiResponse<ISession> {
  token: string;
}

export const loginUser = async (credentials: ICredentials): Promise<{ token: string, user: ISession }> => {
  const { data } = await api.post<LoginResponse>('/user/auth/login', credentials);
  if (!data.data) throw new Error(data.message);
  return { token: data.token, user: data.data };
}

export const registerUser = async (credentials: ICredentials & { name: string, phone: string }): Promise<{ user: ISession }> => {
  const { data } = await api.post<ApiResponse<ISession>>('/user/auth/register', credentials);
  if (!data.data) throw new Error(data.message);
  return { user: data.data };
}

export const verifyEmail = async (email: string): Promise<void> => {
  await api.post('/user/auth/resend-verify-email', { email });
}

export const resetPassword = async (email: string): Promise<void> => {
  await api.post('/user/auth/send-reset-password', { email });
}