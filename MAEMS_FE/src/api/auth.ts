import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type {
  AuthRole,
  AuthUser,
  ApiLoginData,
  ApiRegisterData,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth";
import { getProfile } from "./users";

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<ApiWrapper<ApiLoginData>>(
    "/api/Users/login",
    data
  );
  const { accessToken, refreshToken, user } = res.data.data;
  return {
    token: accessToken,
    refreshToken,
    user: {
      username: user.username,
      email: user.email,
      role: (user.role?.toLowerCase() ?? "applicant") as AuthRole,
    },
  };
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const res = await apiClient.post<ApiWrapper<ApiRegisterData>>(
    "/api/Users/register",
    data
  );
  return {
    message: res.data.message,
    username: res.data.data.username,
    email: res.data.data.email,
  };
}

export async function googleLogin(idToken: string): Promise<LoginResponse> {
  const res = await apiClient.post<ApiWrapper<ApiLoginData>>(
    "/api/Users/google-login",
    { idToken }
  );
  const { accessToken, refreshToken, user } = res.data.data;
  return {
    token: accessToken,
    refreshToken,
    user: {
      username: user.username,
      email: user.email,
      role: (user.role?.toLowerCase() ?? "applicant") as AuthRole,
    },
  };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const profile = await getProfile();
  if (!profile) return null;
  return { username: profile.username, email: profile.email, role: profile.role };
}

export async function refreshToken(
  accessToken: string,
  refreshTokenValue: string
): Promise<LoginResponse> {
  const res = await apiClient.post<ApiWrapper<ApiLoginData>>(
    "/api/Users/refresh-token",
    { accessToken, refreshToken: refreshTokenValue }
  );
  const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = res.data.data;
  return {
    token: newAccessToken,
    refreshToken: newRefreshToken,
    user: {
      username: user.username,
      email: user.email,
      role: (user.role?.toLowerCase() ?? "applicant") as AuthRole,
    },
  };
}
