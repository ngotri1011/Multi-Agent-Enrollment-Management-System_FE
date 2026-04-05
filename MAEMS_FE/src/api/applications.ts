import { apiClient } from "../services/axios";
import type {
  Application,
  ApplicationMe,
  CreateApplicationRequest,
  CreateApplicationResponse,
  SubmitApplicationFinalResponse,
} from "../types/application";
import type { ApiWrapper, PagedResult } from "../types/api.wrapper";
import type { ApplicationStatus } from "../types/enums";

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

//Lấy danh sách đơn ĐK của tất cả người dùng
export async function fetchAllApplications(
  params?: FetchAllApplicationsParams,
): Promise<PagedResult<Application>> {
  const res = await apiClient.get<ApiWrapper<PagedResult<Application>>>(
    "/api/Applications/all",
    { params },
  );
  return res.data.data;
}

//Lấy danh sách đơn ĐK ngành đào tạo của tôi (DTO {@link ApplicationMe}, không đủ field như `/all`)
export async function fetchMyApplications(): Promise<ApplicationMe[]> {
  const res = await apiClient.get<ApiWrapper<ApplicationMe[]>>(
    "/api/Applications/me",
  );
  return res.data.data;
}

//Lấy thông tin chi tiết đơn ĐK theo ID
export async function fetchApplicationDetail(id: number): Promise<Application> {
  const res = await apiClient.get<ApiWrapper<Application>>(
    `/api/Applications/${id}`,
  );
  return res.data.data;
}

//Nộp đơn ĐK ngành đào tạo (bản nháp)
export async function submitApplication(
  payload: CreateApplicationRequest,
): Promise<CreateApplicationResponse> {
  const res = await apiClient.post<ApiWrapper<CreateApplicationResponse>>(
    "/api/Applications",
    payload,
  );
  return res.data.data;
}

//Nộp đơn ĐK ngành & tài liệu đính kèm (đã nộp)
export async function submitApplicationFinal(
  id: number,
): Promise<SubmitApplicationFinalResponse> {
  const res = await apiClient.post<ApiWrapper<SubmitApplicationFinalResponse>>(
    `/api/Applications/${id}/submit`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return res.data.data;
}

export type PatchApplicationPayload = {
  status?: ApplicationStatus;
  requiresReview?: boolean;
};

//Cập nhật trạng thái đơn ĐK ngành đào tạo
export async function patchApplication(
  id: number,
  payload: PatchApplicationPayload,
): Promise<Application> {
  const res = await apiClient.patch<ApiWrapper<Application>>(
    `/api/Applications/${id}`,
    payload,
  );
  return res.data.data;
}

export type RequestAdditionalDocumentsPayload = {
  docsNeed: string;
};

//Yêu cầu bổ sung tài liệu
export async function requestAdditionalDocuments(
  id: number,
  payload: RequestAdditionalDocumentsPayload,
): Promise<Application> {
  const res = await apiClient.post<ApiWrapper<Application>>(
    `/api/Applications/${id}/additional-docs`,
    payload,
  );
  return res.data.data;
}
