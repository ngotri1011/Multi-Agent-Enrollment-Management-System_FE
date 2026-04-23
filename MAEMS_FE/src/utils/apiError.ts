import type { AxiosError } from "axios";
import type { ApiWrapper } from "../types/api.wrapper";

/**
 * Trích xuất thông báo lỗi có ý nghĩa từ một AxiosError trả về theo chuẩn ApiWrapper.
 *
 * Ưu tiên theo thứ tự:
 *   1. Danh sách `errors[]` từ body phản hồi (chi tiết nhất, thường là validation errors)
 *   2. Trường `message` từ body phản hồi (thông báo chung từ server)
 *   3. `fallback` do người gọi truyền vào (mặc định: "Đã xảy ra lỗi. Vui lòng thử lại.")
 */
export function extractApiError(
  error: unknown,
  fallback = "Đã xảy ra lỗi. Vui lòng thử lại.",
): string {
  const axiosErr = error as AxiosError<ApiWrapper<unknown>>;
  const data = axiosErr?.response?.data;

  if (data?.errors && data.errors.length > 0) {
    // Ghép nhiều validation error thành một chuỗi dễ đọc
    return data.errors.join(" | ");
  }

  if (data?.message) {
    return data.message;
  }

  return fallback;
}
