// Application feature API placeholders.

import { apiClient } from "../services/axios";
import type { CreateApplicationRequest, CreateApplicationResponse } from "../types/application";
import type { ApiWrapper } from "../types/auth";

export async function fetchApplications() {
  // TODO: implement list API
}

export async function fetchApplicationDetail(id: string) {
  // TODO: implement detail API
  return { id };
}

export async function submitApplication(payload: CreateApplicationRequest) {
  const res = await apiClient.post<ApiWrapper<CreateApplicationResponse>>(
    "/api/Applications",
    payload
  );
  return res.data.data;
}

export async function submitApplicationDocument(id: string, payload: FormData) {
  const res = await apiClient.post(`/api/Applications/${id}/documents`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.data;
}