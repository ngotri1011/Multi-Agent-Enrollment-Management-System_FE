import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type { Campus } from "../types/campus";

export async function getCampuses() {
    const res = await apiClient.get<ApiWrapper<Campus[]>>(
        "/api/Campuses"
    );
    return res.data.data;
}