import { apiClient } from "../services/axios";
import type { ApiWrapper, PagedResult } from "../types/api.wrapper";
import type { CreateProgramRequest, Program, UpdateProgramRequest } from "../types/program";
//Lấy tất cả programs
export async function getPrograms() {
    const res = await apiClient.get<ApiWrapper<Program[]>>(
        "/api/Programs"
    );
    return res.data.data;
}

//Lấy program theo id
export async function getProgramById(id: string) {  
    const res = await apiClient.get<ApiWrapper<Program>>(
        `/api/Programs/${id}`
    );
    return res.data.data;
}

//Lấy tất cả programs active
export async function getActivePrograms() {
    const res = await apiClient.get<ApiWrapper<Program[]>>(
        "/api/Programs/active"
    );
    return res.data.data;
}

//Lấy tất cả programs active basic
export async function getActiveProgramsBasic() {
    const res = await apiClient.get<ApiWrapper<Program[]>>(
        "/api/Programs/active/basic"
    );
    return res.data.data;
}

//Lấy programs basic theo major, search name, sort và phân trang
export async function getFilteredProgramsBasic(
    majorId?: number,
    searchName?: string,
    sortBy?: string,
    sortDesc?: boolean,
    pageNumber: number = 1,
    pageSize: number = 20,
) {
    const res = await apiClient.get<ApiWrapper<PagedResult<Program>>>(
        "/api/Programs/basic/filter",
        { params: { majorId, searchName, sortBy, sortDesc, pageNumber, pageSize } }
    );
    return res.data.data;
}

//Tạo program
export async function createProgram(data: CreateProgramRequest) {
    const res = await apiClient.post<ApiWrapper<Program>>(
        "/api/Programs",
        data
    );
    return res.data.data;
}

//Cập nhật program
export async function updateProgram(id: number, data: UpdateProgramRequest) {
    const res = await apiClient.patch<ApiWrapper<Program>>(
        `/api/Programs/${id}`,
        data
    );
    return res.data.data;
}