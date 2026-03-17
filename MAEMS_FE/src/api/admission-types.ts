import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type { AdmissionType } from "../types/admission.type";

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

export async function getActiveAdmissionTypesBasic() {
    const res = await apiClient.get<ApiWrapper<AdmissionType[]>>(
        "/api/AdmissionTypes/active/basic"
    );
    return res.data.data;
}