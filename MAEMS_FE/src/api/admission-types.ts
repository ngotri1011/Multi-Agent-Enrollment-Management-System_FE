import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type { AdmissionType, AdmissionTypeBasic } from "../types/admission.type";

export async function getAdmissionTypes() {
    const res = await apiClient.get<ApiWrapper<AdmissionType[]>>(
        "/api/AdmissionTypes"
    );
    return res.data.data;
}

export async function getActiveAdmissionTypes() {
    const res = await apiClient.get<ApiWrapper<AdmissionType[]>>(
        "/api/AdmissionTypes/active"
    );
    return res.data.data;
}

export async function getAdmissionTypeById(id: number) {
    const res = await apiClient.get<ApiWrapper<AdmissionType>>(
        `/api/AdmissionTypes/${id}`
    );
    return res.data.data;
}

export async function getActiveAdmissionTypesBasic(enrollmentYearId?: number) {
    const res = await apiClient.get<ApiWrapper<AdmissionTypeBasic[]>>(
        "/api/AdmissionTypes/active/basic",
        { params: { enrollmentYearId } }
    );
    return res.data.data;
}