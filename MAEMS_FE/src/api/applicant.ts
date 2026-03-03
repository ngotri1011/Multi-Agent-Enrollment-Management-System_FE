import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/auth";
import type {
  CreateApplicantRequest,
  CreateApplicantResponse,
} from "../types/applicant";

export async function createApplicant(
  payload: CreateApplicantRequest
): Promise<CreateApplicantResponse> {
  const res = await apiClient.post<ApiWrapper<CreateApplicantResponse>>(
    "/api/Applicants",
    payload
  );
  return res.data.data;
}

export async function getMyApplicant(): Promise<CreateApplicantResponse> {
    // api/Applicants/me   
    const res = await apiClient.get<ApiWrapper<CreateApplicantResponse>>(
        "/api/Applicants/me"
    );
    return res.data.data;
}
