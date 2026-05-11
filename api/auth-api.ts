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