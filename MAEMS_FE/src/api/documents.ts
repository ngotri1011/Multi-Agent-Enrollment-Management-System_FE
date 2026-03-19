import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type { Document } from "../types/document";

export async function deleteDocument(id: number) {
    const res = await apiClient.delete<ApiWrapper<Document>>(`/api/Documents/${id}`);
    return res.data;
}