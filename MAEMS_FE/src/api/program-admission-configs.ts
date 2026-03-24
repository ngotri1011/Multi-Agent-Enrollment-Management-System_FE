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