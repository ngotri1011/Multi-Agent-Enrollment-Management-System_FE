import type { ApiWrapper } from "../types/api.wrapper";

type ApiErrorPayload = {
  message?: string;
  errors?: string[];
};

// Chuẩn hóa dữ liệu lỗi từ axios để UI hiển thị đồng nhất.
// Tiêu đề Alert dùng res.message từ API (kèm fallback tiếng Việt nếu API không trả về).
// Chi tiết lỗi lấy từ res.errors[] của API.
export function extractApiError(
  err: unknown,
  fallbackMessage: string,
): { message: string; errors: string[] } {
  const errData = (err as { response?: { data?: ApiErrorPayload } })?.response?.data;
  return {
    message: errData?.message || fallbackMessage,
    errors: Array.isArray(errData?.errors) ? errData.errors.filter(Boolean) : [],
  };
}

// Kiểm tra nhanh chuỗi có đúng định dạng email để hỗ trợ prefill cho form reset.
export function isEmailLike(value?: string): boolean {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// Định dạng số giây còn lại thành mm:ss để người dùng dễ theo dõi hạn OTP.
export function formatCountdown(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainSeconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainSeconds).padStart(2, "0")}`;
}

export type ResetPasswordApiResponse = ApiWrapper<string>;
