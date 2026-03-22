import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type {
  CreateApplicantRequest,
  CreateApplicantResponse,
} from "../types/applicant";
import type { Document } from "../types/document";

// Lấy hồ sơ cá nhân
export async function getMyApplicant(): Promise<CreateApplicantResponse> {
  // api/Applicants/me   
  const res = await apiClient.get<ApiWrapper<CreateApplicantResponse>>(
      "/api/Applicants/me"
  );
  return res.data.data;
}

// Tạo hồ sơ cá nhân
export async function createApplicant(
  payload: CreateApplicantRequest
): Promise<CreateApplicantResponse> {
  const res = await apiClient.post<ApiWrapper<CreateApplicantResponse>>(
    "/api/Applicants",
    payload
  );
  return res.data.data;
}

// Cập nhật hồ sơ cá nhân
export async function patchApplicant(
    payload: CreateApplicantRequest
): Promise<CreateApplicantResponse> {
    const res = await apiClient.patch<ApiWrapper<CreateApplicantResponse>>(
        "/api/Applicants/me",
        payload
    );
    return res.data.data;
}

//Upload tài liệu đính kèm
export async function uploadApplicantDocuments(payload: FormData): Promise<Document[]> {
    const res = await apiClient.post<ApiWrapper<Document[]>>(
      "/api/Applicants/me/documents",
       payload, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return res.data.data;
}
//Xem tài liệu đã upload
export async function getApplicantDocuments(): Promise<Document[]> {
    const res = await apiClient.get<ApiWrapper<Document[]>>(`/api/Applicants/me/documents`);
    return res.data.data;
}

//Lấy hồ sơ cá nhân Applicant theo id
export async function getApplicantById (id: number): Promise<CreateApplicantResponse> {
    const res = await apiClient.get<ApiWrapper<CreateApplicantResponse>>(`/api/Applicants/${id}`);
    return res.data.data;
}