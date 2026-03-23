import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type {
  AuthRole,
  ApiProfileData,
  UserProfile,
} from "../types/auth";
import type { CreateUserRequest, GetUsersParams, PagedResponse, UpdateUserRequest, User } from "../types/user";

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

export async function getUsers(
  params?: GetUsersParams
): Promise<PagedResponse<User>> {
  const res = await apiClient.get<ApiWrapper<PagedResponse<User>>>(
    "/api/Users",
    { params }
  );

  return res.data.data;
}

// Tạo user
export async function createUser(
  payload: CreateUserRequest
): Promise<User> {
  const res = await apiClient.post<ApiWrapper<User>>(
    "/api/Users",
    payload
  );
  return res.data.data;
}

// Cập nhật user (active / role)
export async function updateUser(
  id: number,
  payload: UpdateUserRequest
): Promise<User> {
  const res = await apiClient.patch<ApiWrapper<User>>(
    `/api/Users/${id}`,
    payload
  );
  return res.data.data;
}

// Lấy user theo ID
export async function fetchUserById(
  id: number
): Promise<User> {
  const res = await apiClient.get<ApiWrapper<User>>(
    `/api/Users/by-id/${id}`
  );
  return res.data.data;
}

