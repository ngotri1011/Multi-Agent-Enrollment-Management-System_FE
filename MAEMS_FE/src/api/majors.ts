import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type { CreateMajorRequest, Major, MajorBasic, MajorListResponse, MajorQueryParams, UpdateMajorRequest } from "../types/major";

export async function getMajors(params: MajorQueryParams) {
  const res = await apiClient.get<ApiWrapper<MajorListResponse>>(
    "/api/Majors",
    { params }
  );
  return res.data.data;
}

export async function getMajorById(id: string) {
    const res = await apiClient.get<ApiWrapper<Major>>(
        `/api/Majors/${id}`
    );
    return res.data.data;
}

export async function getActiveMajors() {
    const res = await apiClient.get<ApiWrapper<Major[]>>(
        "/api/Majors/active"
    );
    return res.data.data;
}

export async function getActiveMajorsBasic() {
    const res = await apiClient.get<ApiWrapper<MajorBasic[]>>(
        "/api/Majors/active/basic"
    );
    return res.data.data;
}

// ================= CREATE =================
export async function createMajor(data: CreateMajorRequest) {
  const res = await apiClient.post<ApiWrapper<Major>>(
    "/api/Majors",
    data
  );
  return res.data.data;
}

// ================= UPDATE =================
export async function updateMajor(
  id: number,
  data: UpdateMajorRequest
) {
  const res = await apiClient.patch<ApiWrapper<Major>>(
    `/api/Majors/${id}`,
    data
  );
  return res.data.data;
}