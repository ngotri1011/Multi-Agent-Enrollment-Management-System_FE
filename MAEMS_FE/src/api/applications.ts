// Application feature API placeholders.

import { apiClient } from "../services/axios";
import type { Application, CreateApplicationRequest, CreateApplicationResponse } from "../types/application";
import type { ApiWrapper } from "../types/api.wrapper";

//Lấy danh sách đơn ĐK ngành đào tạo của tôi
export async function fetchMyApplications(): Promise<Application[]> {
  const res = await apiClient.get<ApiWrapper<Application[]>>(
    "/api/Applications/me",
  );
  return res.data.data;
}

//Lấy danh sách đơn ĐK ngành đào tạo của tất cả người dùng (role officer)
export async function fetchAllApplications(): Promise<Application[]> {
  const res = await apiClient.get<ApiWrapper<Application[]>>(
    "/api/Applications/all",
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
  const res = await apiClient.post<ApiWrapper<CreateApplicationResponse>>(`/api/Applications/${id}/submit`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data.data;
}


// Phê duyệt hồ sơ (role officer)
export async function approveApplication(id: number): Promise<void> {
  await apiClient.post(`/api/Applications/${id}/approve`);
}

// Từ chối hồ sơ (role officer)
export async function rejectApplication(id: number, reason: string): Promise<void> {
  await apiClient.post(`/api/Applications/${id}/reject`, { reason });
}

// Yêu cầu bổ sung tài liệu (role officer)
export async function requestAdditionalDocuments(id: number, note: string): Promise<void> {
  await apiClient.post(`/api/Applications/${id}/request-documents`, { note });
}