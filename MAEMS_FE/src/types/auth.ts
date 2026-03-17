export type AuthRole = "admin" | "officer" | "qa" | "applicant" | "guest";

export type AuthUser = {
  username: string;
  email: string;
  role: AuthRole;
  photoURL?: string | null;
};

export type LoginRequest = {
  usernameOrEmail: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  refreshToken: string;
  user: AuthUser;
};

export type RegisterResponse = {
  message: string;
  username: string;
  email: string;
};

export type UserProfile = {
  username: string;
  email: string;
  role: AuthRole;
  createdAt: string;
};

// API-specific raw shapes
export type ApiLoginData = {
  accessToken: string;
  refreshToken: string;
  user: { username: string; email: string; role: string };
};

export type ApiRegisterData = {
  userId: number;
  username: string;
  email: string;
  roleId: number;
  createdAt: string;
  isActive: boolean;
};

export type ApiProfileData = {
  username: string;
  email: string;
  roleName: string;
  createdAt: string;
};
