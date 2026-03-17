import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type { Major, MajorBasic } from "../types/major";

export async function getMajors() {
    const res = await apiClient.get<ApiWrapper<Major[]>>(
        "/api/Majors"
    );
    return res.data.data;
}

export async function getMajorById(id: string) {
    const res = await apiClient.get<ApiWrapper<Major>>(
        `/api/Majors/${id}`
    );
    return res.data.data;
}

export async function getActiveMajors() {
    const res = await apiClient.get<ApiWrapper<Major[]>>(
        "/api/Majors/active"
    );
    return res.data.data;
}

export async function getActiveMajorsBasic() {
    const res = await apiClient.get<ApiWrapper<MajorBasic[]>>(
        "/api/Majors/active/basic"
    );
    return res.data.data;
}