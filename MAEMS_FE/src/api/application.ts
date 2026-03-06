// Application feature API placeholders.

import { apiClient } from "../services/axios";
import type { Application, CreateApplicationRequest, CreateApplicationResponse } from "../types/application";
import type { ApiWrapper } from "../types/auth";

//Lấy danh sách đơn ĐK ngành đào tạo của tôi
export async function fetchMyApplications(): Promise<Application[]> {
  const res = await apiClient.get<ApiWrapper<Application[]>>(
    "/api/Applications/me",
  );
  return res.data.data;
}

//Lấy thông tin chi tiết đơn ĐK ngành đào tạo theo ID
export async function fetchApplicationDetail(id: number): Promise<Application> {
  const res = await apiClient.get<ApiWrapper<Application>>(
    `/api/Applications/${id}`,
  );
  return res.data.data;
}

//Lấy thông tin chi tiết đơn ĐK ngành đào tạo của tôi
export async function fetchMyApplicationDetail(id: number): Promise<Application> {
  const res = await apiClient.get<ApiWrapper<Application>>(
    `/api/Applications/me/${id}/with-documents`,
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

//Nộp tài liệu đính kèm
export async function submitApplicationDocuments(id: number, payload: FormData): Promise<Document[]> {
  const res = await apiClient.post<ApiWrapper<Document[]>>(`/api/Applications/${id}/documents`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.data;
}