import { apiClient } from "../services/axios";
import type { Application, CreateApplicationRequest, CreateApplicationResponse } from "../types/application";
import type { ApiWrapper, PagedResult } from "../types/api.wrapper";
import type { ApplicationStatus } from "../types/enums";
//Lấy danh sách đơn ĐK ngành đào tạo của tôi
export async function fetchMyApplications(): Promise<Application[]> {
  const res = await apiClient.get<ApiWrapper<Application[]>>(
    "/api/Applications/me",
  );
  return res.data.data;
}

export type FetchAllApplicationsParams = {
  programId?: number;
  campusId?: number;
  admissionTypeId?: number;
  status?: ApplicationStatus;
  requiresReview?: boolean;
  assignedOfficerId?: number;
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
  pageNumber?: number;
  pageSize?: number;
};

//Lấy danh sách đơn ĐK ngành đào tạo của tất cả người dùng (role officer)
export async function fetchAllApplications(
  params?: FetchAllApplicationsParams,
): Promise<PagedResult<Application>> {
  const res = await apiClient.get<ApiWrapper<PagedResult<Application>>>(
    "/api/Applications/all",
    { params },
  );
  return res.data.data;
}

//Lấy thông tin chi tiết đơn ĐK ngành đào tạo theo ID (role officer)
export async function fetchApplicationDetail(id: number): Promise<Application> {
  const res = await apiClient.get<ApiWrapper<Application>>(
    `/api/Applications/${id}`,
  );
  return res.data.data;
}

//Nộp đơn ĐK ngành đào tạo
export async function submitApplication(payload: CreateApplicationRequest): Promise<CreateApplicationResponse> {
  const res = await apiClient.post<ApiWrapper<CreateApplicationResponse>>(
    "/api/Applications",
    payload
  );
  return res.data.data;
}

//Nộp đơn ĐK ngành & tài liệu đính kèm cuối cùng
export async function submitApplicationFinal(id: number): Promise<CreateApplicationResponse> {
  const res = await apiClient.post<ApiWrapper<CreateApplicationResponse>>(
    `/api/Applications/${id}/submit`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data.data;
}


export type PatchApplicationPayload = {
  status?: ApplicationStatus;
  requiresReview?: boolean;
};

export async function patchApplication(id: number, payload: PatchApplicationPayload): Promise<Application> {
  const res = await apiClient.patch<ApiWrapper<Application>>(
    `/api/Applications/${id}`,
    payload,
  );
  return res.data.data;
}
