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

// API đăng nhập
export async function login(data: LoginRequest): Promise<LoginResponse> {
  // Gửi thông tin đăng nhập và nhận về token + thông tin người dùng.
  const res = await apiClient.post<ApiWrapper<ApiLoginData>>(
    "/api/Users/login",
    data,
  );
  const {
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
    user,
  } = res.data.data;
  return {
    token: accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
    user: {
      username: user.username,
      email: user.email,
      // Chuẩn hóa role về chữ thường, mặc định là applicant nếu backend không trả về.
      role: (user.role?.toLowerCase() ?? "applicant") as AuthRole,
    },
  };
}

// API đăng ký
export async function register(
  data: RegisterRequest,
): Promise<RegisterResponse> {
  // Tạo tài khoản mới và ánh xạ lại dữ liệu cần thiết cho UI.
  const res = await apiClient.post<ApiWrapper<ApiRegisterData>>(
    "/api/Users/register",
    data,
  );
  return {
    message: res.data.message,
    username: res.data.data.username,
    email: res.data.data.email,
  };
}

// API đăng nhập bằng Google
export async function googleLogin(idToken: string): Promise<LoginResponse> {
  // Đăng nhập bằng Google idToken và lấy thông tin xác thực tương tự login thường.
  const res = await apiClient.post<ApiWrapper<ApiLoginData>>(
    "/api/Users/google-login",
    { idToken },
  );
  const {
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
    user,
  } = res.data.data;
  return {
    token: accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
    user: {
      username: user.username,
      email: user.email,
      // Đồng bộ định dạng role để dùng nhất quán trong toàn bộ frontend.
      role: (user.role?.toLowerCase() ?? "applicant") as AuthRole,
    },
  };
}

// API lấy thông tin người dùng hiện tại
export async function getCurrentUser(): Promise<AuthUser | null> {
  // Lấy hồ sơ người dùng hiện tại từ API profile.
  const profile = await getProfile();
  return {
    username: profile.username,
    email: profile.email,
    role: profile.role,
  };
}

// API làm mới token
export async function refreshTokenApi(
  accessToken: string,
  refreshTokenValue: string,
): Promise<LoginResponse> {
  // Làm mới access token bằng cặp access/refresh token hiện tại.
  const res = await apiClient.post<ApiWrapper<ApiLoginData>>(
    "/api/Users/refresh-token",
    { accessToken, refreshToken: refreshTokenValue },
  );
  const {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
    user,
  } = res.data.data;
  return {
    token: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
    user: {
      username: user.username,
      email: user.email,
      // Giữ cùng quy tắc chuẩn hóa role như các luồng đăng nhập khác.
      role: (user.role?.toLowerCase() ?? "applicant") as AuthRole,
    },
  };
}

// API yêu cầu reset mật khẩu và trả mã OTP về email của người dùng
export async function requestResetPassword(email: string): Promise<ApiWrapper<string>> {
  const res = await apiClient.post<ApiWrapper<string>>(
    "/api/Users/request-password-reset",
    { email },
  );
  return res.data;
}

//API xác thực reset password
export async function verifyResetPassword({
  email,
  otpCode,
  newPassword,
  confirmPassword,
}: {
  email: string;
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ApiWrapper<string>> {
  const res = await apiClient.post<ApiWrapper<string>>(
    "/api/Users/reset-password",
    { email, otpCode, newPassword, confirmPassword },
  );
  return res.data;
}
