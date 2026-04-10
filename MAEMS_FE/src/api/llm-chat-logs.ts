import { apiClient } from "../services/axios";
import type { LlmChatLogItem, LlmChatLogQueryParams, PagedResponse } from "../types/llm-chat-log";

export const getLlmChatLogs = async (
  params: LlmChatLogQueryParams
): Promise<PagedResponse<LlmChatLogItem>> => {
  const response = await apiClient.get("/api/LlmChatLogs", { params });
  return response.data.data;
};

export const getLlmChatLogById = async (
  chatId: number
): Promise<LlmChatLogItem> => {
  const response = await apiClient.get(`/api/LlmChatLogs/${chatId}`);
  return response.data.data;
};