import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type { Program } from "../types/program";

export async function getPrograms() {
    const res = await apiClient.get<ApiWrapper<Program[]>>(
        "/api/Programs"
    );
    return res.data.data;
}

export async function getProgramById(id: string) {  
    const res = await apiClient.get<ApiWrapper<Program>>(
        `/api/Programs/${id}`
    );
    return res.data.data;
}

export async function getActivePrograms() {
    const res = await apiClient.get<ApiWrapper<Program[]>>(
        "/api/Programs/active"
    );
    return res.data.data;
}

export async function getActiveProgramsBasic() {
    const res = await apiClient.get<ApiWrapper<Program[]>>(
        "/api/Programs/active/basic"
    );
    return res.data.data;
}

export async function filterPrograms(majorId?: number, searchName?: string) {
    const res = await apiClient.get<ApiWrapper<Program[]>>(
        "/api/Programs/basic/filter",
        { params: { majorId, searchName } }
    );
    return res.data.data;
}