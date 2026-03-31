import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type { Campus, CampusBasic } from "../types/campus";

export async function getCampuses() {
    const res = await apiClient.get<ApiWrapper<Campus[]>>(
        "/api/Campuses"
    );
    return res.data.data;
}

export async function getActiveBasicCampuses() {
    const res = await apiClient.get<ApiWrapper<CampusBasic[]>>(
        "/api/Campuses/active/basic"
    );
    return res.data.data;
}

// CREATE
export async function createCampus(data: {
    name: string;
    address: string;
    email: string;
    phoneNumber: string;
    description: string;
    isActive: boolean;
}) {
    const res = await apiClient.post("/api/Campuses", data);
    return res.data;
}

// UPDATE
export async function updateCampus(id: number, data: any) {
    const res = await apiClient.patch(`/api/Campuses/${id}`, data);
    return res.data;
}