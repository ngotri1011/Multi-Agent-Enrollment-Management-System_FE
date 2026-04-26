import type { createFeedbackRequest, FeedbackQueryParams, PagedFeedbackResponse } from "../types/feedback";
import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";

export async function getFeedback(params: FeedbackQueryParams): Promise<PagedFeedbackResponse> {
    const res = await apiClient.get<ApiWrapper<PagedFeedbackResponse>>(
        "/api/Feedback",
        { params }
    );
    return res.data.data;
}

export async function createFeedback(data: createFeedbackRequest) {
    const res = await apiClient.post("/api/Feedback", data);
    return res.data;
}