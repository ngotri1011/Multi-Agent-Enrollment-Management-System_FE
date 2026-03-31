import type { ApiWrapper } from "../types/api.wrapper";
import { apiClient } from "../services/axios";
import type { CreateEnrollmentYearRequest, EnrollmentYear } from "src/types/enrollment-years";

// GET
export async function getEnrollmentYears() {
  const res = await apiClient.get<ApiWrapper<EnrollmentYear[]>>(
    "/api/EnrollmentYears"
  );
  return res.data.data;
}

// POST
export async function createEnrollmentYear(data: CreateEnrollmentYearRequest) {
  const res = await apiClient.post("/api/EnrollmentYears", data);
  return res.data;
}

// PATCH
export async function updateEnrollmentYear(
  id: number,
  data: EnrollmentYear
) {
  const res = await apiClient.patch(
    `/api/EnrollmentYears/${id}`,
    data
  );
  return res.data;
}