import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type { ProgramAdmissionConfig, ProgramAdmissionConfigQuery, ProgramAdmissionConfigResponse } from "../types/program.admission.config";

export async function getProgramAdmissionConfigsFilter(
    programId?: number,
    campusId?: number,
    admissionTypeId?: number
) {
    const res = await apiClient.get<ApiWrapper<ProgramAdmissionConfig[]>>(
        "/api/ProgramAdmissionConfigs/filter",
        { params: { programId, campusId, admissionTypeId } }
    );
    return res.data.data;
}


export async function getProgramAdmissionConfigs(
  params: ProgramAdmissionConfigQuery
) {
  const res = await apiClient.get<
    ApiWrapper<ProgramAdmissionConfigResponse>
  >("/api/ProgramAdmissionConfigs", { params });

  return res.data.data;
}

// CREATE
export async function createProgramAdmissionConfig(data: {
  programId: number;
  campusId: number;
  admissionTypeId: number;
  quota: number;
  isActive: boolean;
}) {
  const res = await apiClient.post(
    "/api/ProgramAdmissionConfigs",
    data
  );
  return res.data.data;
}

// GET BY ID
export async function getProgramAdmissionConfigById(id: number) {
  const res = await apiClient.get(
    `/api/ProgramAdmissionConfigs/${id}`
  );
  return res.data.data;
}

// UPDATE
export async function updateProgramAdmissionConfig(
  id: number,
  data: Partial<{
    programId: number;
    campusId: number;
    admissionTypeId: number;
    quota: number;
    isActive: boolean;
  }>
) {
  const res = await apiClient.patch(
    `/api/ProgramAdmissionConfigs/${id}`,
    data
  );
  return res.data.data;
}