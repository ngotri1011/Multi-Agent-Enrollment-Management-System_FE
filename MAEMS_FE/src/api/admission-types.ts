import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type { AdmissionType, AdmissionTypeBasic } from "../types/admission.type";

//Lấy tất cả phương thức tuyển sinh
export async function getAdmissionTypes() {
    const res = await apiClient.get<ApiWrapper<AdmissionType[]>>(
        "/api/AdmissionTypes"
    );
    return res.data.data;
}

//Lấy phương thức tuyển sinh đang hoạt động
export async function getActiveAdmissionTypes() {
    const res = await apiClient.get<ApiWrapper<AdmissionType[]>>(
        "/api/AdmissionTypes/active"
    );
    return res.data.data;
}

//Lấy phương thức tuyển sinh theo id
export async function getAdmissionTypeById(id: number) {
    const res = await apiClient.get<ApiWrapper<AdmissionType>>(
        `/api/AdmissionTypes/${id}`
    );
    return res.data.data;
}

//Lấy phương thức tuyển sinh đang hoạt động và cơ bản
export async function getActiveAdmissionTypesBasic(enrollmentYearId?: number) {
    const res = await apiClient.get<ApiWrapper<AdmissionTypeBasic[]>>(
        "/api/AdmissionTypes/active/basic",
        { params: { enrollmentYearId } }
    );
    return res.data.data;
}