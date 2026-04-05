import type { ApiWrapper, ReportWrapper } from "../types/api.wrapper";
import { apiClient } from "../services/axios";
import type { Application } from "../types/application";

export async function getOfficerReports() {
  const res = await apiClient.get<ApiWrapper<ReportWrapper<Application>>>(
    "/api/Report/officer/me/applications",
  );
  return res.data.data;
}
