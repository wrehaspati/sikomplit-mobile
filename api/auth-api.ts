import { ApiResponse } from "@/types/response";
import { ICredentials, ISession } from "@/types/session";
import { api } from "./api-client";

interface LoginResponse extends ApiResponse<ISession> {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface UserRegister extends ICredentials {
  name: string;
  phone: string;
}

/**
 * Authenticate user with email and password.
 * @param credentials
 * @returns access_token, refresh_token and user data
 */
export const loginUser = async (
  credentials: ICredentials,
): Promise<{ token: string; refresh_token: string; user: ISession }> => {
  const { data } = await api.post<LoginResponse>(
    "/user/auth/login",
    credentials,
  );
  if (!data.data) throw new Error(data.message);
  return {
    token: data.access_token,
    refresh_token: data.refresh_token,
    user: data.data,
  };
};

/**
 * Register a new user with name, email, password, and phone.
 * @param credentials
 * @returns user data
 */
export const registerUser = async (
  credentials: UserRegister,
): Promise<{ user: ISession }> => {
  const { data } = await api.post<ApiResponse<ISession>>(
    "/mobile/auth/register",
    credentials,
  );
  if (!data.data) throw new Error(data.message);
  return { user: data.data };
};

/**
 * Request a new verification email to be sent to the user.
 * @param email
 */
export const verifyEmail = async (email: string): Promise<void> => {
  await api.post("/mobile/auth/resend-verify-email", { email });
};

/**
 * Send a password reset request for the given email.
 * @param email
 */
export const sendResetPassword = async (email: string): Promise<void> => {
  await api.post("/mobile/auth/send-reset-password", { email });
};

/**
 * Logout user, invalidating all tokens.
 */
export const logoutUser = async (): Promise<void> => {
  await api.post("/user/auth/logout");
};

/**
 * Verify email using token from deeplink.
 * @param email
 * @param token
 */
export const verifyEmailToken = async (
  email: string,
  token: string,
): Promise<void> => {
  await api.get("/mobile/auth/verify-email", { params: { email, token } });
};

/**
 * Submit new password using token from deeplink.
 * @param email
 * @param token
 * @param password
 */
export const submitNewPassword = async (
  email: string,
  token: string,
  password: string,
): Promise<void> => {
  await api.post("/mobile/auth/reset-password", { email, token, password });
};
