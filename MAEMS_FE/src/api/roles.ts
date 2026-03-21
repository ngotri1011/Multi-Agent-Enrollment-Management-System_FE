import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type { Role } from "../types/role";

export async function getRoles() {
  const res = await apiClient.get<ApiWrapper<Role[]>>("/api/Roles");
  return res.data.data;
}