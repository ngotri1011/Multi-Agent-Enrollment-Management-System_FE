import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type { ProgramAdmissionConfig } from "../types/program.admission.config";

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