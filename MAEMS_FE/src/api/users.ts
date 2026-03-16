import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/auth";
import type { User } from "../types/user";


export async function getUsers(roleId?: number) {
  const res = await apiClient.get<ApiWrapper<User[]>>("/api/Users", {
    params: {
      roleId,
    },
  });

  return res.data.data;
}