import type { ApiWrapper, ReportWrapper } from "../types/api.wrapper";
import { apiClient } from "../services/axios";
import type { Application } from "../types/application";
import type { ApplicationsByCampus, ApplicationsByOfficer, ApplicationsByProgram, ApplicationStatusCounts, ReportSummary, WeeklyApplications } from "src/types/report";

export async function getOfficerReports() {
  const res = await apiClient.get<ApiWrapper<ReportWrapper<Application>>>(
    "/api/Report/officer/me/applications",
  );
  return res.data.data;
}

// SUMMARY
export async function getReportSummary() {
  const res = await apiClient.get<ApiWrapper<ReportSummary>>(
    "/api/Report/summary"
  );
  return res.data.data;
}

// WEEKLY 
export async function getWeeklyApplications(params: {
  from?: string;
  to?: string;
}) {
  const res = await apiClient.get<ApiWrapper<WeeklyApplications[]>>(
    "/api/Report/applications/weekly",
    { params }
  );
  return res.data.data;
}

// BY CAMPUS 
export async function getApplicationsByCampus() {
  const res = await apiClient.get<ApiWrapper<ApplicationsByCampus[]>>(
    "/api/Report/applications/by-campus"
  );
  return res.data.data;
}

// PROGRAMS BY CAMPUS 
export async function getProgramsByCampus(campusId: number) {
  const res = await apiClient.get<ApiWrapper<ApplicationsByProgram[]>>(
    `/api/Report/applications/by-campus/${campusId}/programs`
  );
  return res.data.data;
}

// STATUS COUNTS
export async function getApplicationStatusCounts() {
  const res = await apiClient.get<ApiWrapper<ApplicationStatusCounts>>(
    "/api/Report/applications/status-counts"
  );
  return res.data.data;
}

// BY OFFICER 
export async function getApplicationsByOfficer() {
  const res = await apiClient.get<ApiWrapper<ApplicationsByOfficer[]>>(
    "/api/Report/applications/by-assigned-officer"
  );
  return res.data.data;
}