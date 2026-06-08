import { ApiResponse } from "@/types/response";
import { ICredentials, ISession } from "@/types/session";
import { api } from "./api-client";

interface LoginResponse extends ApiResponse<ISession> {
  token: string;
}

interface UserRegister extends ICredentials {
  name: string;
  phone: string;
}

/**
 * Authenticate user with email and password.
 * @param credentials
 * @returns token and user data
 */
export const loginUser = async (
  credentials: ICredentials,
): Promise<{ token: string; user: ISession }> => {
  const { data } = await api.post<LoginResponse>(
    "/user/auth/login",
    credentials,
  );
  if (!data.data) throw new Error(data.message);
  return { token: data.token, user: data.data };
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
    "/user/auth/register",
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
  await api.post("/user/auth/resend-verify-email", { email });
};

/**
 * Send a password reset request for the given email.
 * @param email
 */
export const resetPassword = async (email: string): Promise<void> => {
  await api.post("/user/auth/send-reset-password", { email });
};
