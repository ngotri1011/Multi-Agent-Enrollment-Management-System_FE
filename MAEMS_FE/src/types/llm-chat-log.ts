export interface LlmChatLogItem {
  chatId: number;
  userId: number;
  userQuery: string;
  message: string;
  llmResponse: string;
  createdAt: string;
  userName?: string;
}

export interface LlmChatLogQueryParams {
  userId?: number;
  userQuery?: string;
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber?: number;
  pageSize?: number;
}