import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/auth";
import type { AdmissionType } from "../types/admission_type";

export async function getAdmissionTypes() {
    const res = await apiClient.get<ApiWrapper<AdmissionType[]>>(
        "/api/AdmissionTypes"
    );
    return res.data.data;
}