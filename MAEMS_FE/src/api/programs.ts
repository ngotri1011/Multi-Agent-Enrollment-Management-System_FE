import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/auth";
import type { Program } from "../types/program";

export async function getPrograms() {
    const res = await apiClient.get<ApiWrapper<Program[]>>(
        "/api/Programs"
    );
    return res.data.data;
}