import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type { RegisterEventBody, RegisterEventData } from "../types/register-event";

/** Đăng ký tham dự sự kiện (bài viết) */
export async function registerEvent(body: RegisterEventBody) {
  const res = await apiClient.post<ApiWrapper<RegisterEventData>>(
    "/api/RegisterEvents",
    body,
  );
  return res.data;
}

/** Lấy danh sách đăng ký theo articleId */
export async function getRegisterEvents(articleId: number) {
  const res = await apiClient.get<ApiWrapper<RegisterEventData[]>>(
    `/api/RegisterEvents/article/${articleId}`,
  );
  return res.data;
}
