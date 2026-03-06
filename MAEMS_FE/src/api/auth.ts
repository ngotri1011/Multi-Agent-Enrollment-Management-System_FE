import { apiClient } from "../services/axios";
import type {
  AuthRole,
  AuthUser,
  ApiLoginData,
  ApiProfileData,
  ApiRegisterData,
  ApiWrapper,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserProfile,
} from "../types/auth";

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

export async function getProfile(): Promise<UserProfile | null> {
  try {
    const res = await apiClient.get<ApiWrapper<ApiProfileData>>(
      "/api/Users/profile"
    );
    const { username, email, roleName, createdAt } = res.data.data;
    return {
      username,
      email,
      role: (roleName?.toLowerCase() ?? "applicant") as AuthRole,
      createdAt,
    };
  } catch {
    return null;
  }
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
