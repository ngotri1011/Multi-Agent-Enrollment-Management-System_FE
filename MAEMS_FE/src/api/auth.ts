import { apiClient } from "../services/axios";
import type {
  AuthRole,
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from "../types/auth";

type ApiAuthResponse = {
  token?: string;
  accessToken?: string;
  user?: AuthUser;
  id?: string;
  userId?: string;
  username?: string;
  email?: string;
  role?: string;
};

function toAuthUser(raw: ApiAuthResponse): AuthUser {
  if (raw.user) return raw.user;
  const role = (raw.role ?? "applicant").toLowerCase() as AuthRole;
  return {
    id: raw.id ?? raw.userId ?? "",
    username: raw.username ?? "",
    email: raw.email ?? "",
    role,
  };
}

function toLoginResponse(raw: ApiAuthResponse): LoginResponse {
  const token = raw.token ?? raw.accessToken ?? "";
  return { token, user: toAuthUser(raw) };
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await apiClient.post<ApiAuthResponse>("/api/Users/login", data);
  return toLoginResponse(res.data);
}

export async function register(data: RegisterRequest): Promise<LoginResponse> {
  const res = await apiClient.post<ApiAuthResponse>(
    "/api/Users/register",
    data
  );
  return toLoginResponse(res.data);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await apiClient.get<ApiAuthResponse | AuthUser>(
      "/api/Users/profile"
    );
    const data = res.data;
    if (!data) return null;
    if (
      typeof data === "object" &&
      "username" in data &&
      "role" in data &&
      ("id" in data || "userId" in data)
    )
      return data as AuthUser;
    return toAuthUser(data as ApiAuthResponse);
  } catch {
    return null;
  }
}
