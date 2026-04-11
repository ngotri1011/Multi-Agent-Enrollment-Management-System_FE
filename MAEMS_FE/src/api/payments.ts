// Gọi API thanh toán: lấy danh sách giao dịch của người dùng đang đăng nhập (có phân trang, lọc).
import { apiClient } from "../services/axios";
import type { ApiWrapper, PagedResult } from "../types/api.wrapper";
import type { GetMyPaymentsParams, GetPaymentsParams, Payment } from "../types/payment.ts";

/**
 * Chuẩn hóa object query gửi lên backend: luôn có sort/phân trang,
 * bỏ qua các trường tùy chọn rỗng (undefined, null, chuỗi chỉ khoảng trắng) để URL gọn và tránh lọc sai.
 */
function cleanPaymentParams(
  params: GetMyPaymentsParams,
): Record<string, string | number | boolean> {
  // Ba tham số cốt lõi luôn được gửi (backend cần cho thứ tự và trang).
  const cleaned: Record<string, string | number | boolean> = {
    sortDesc: params.sortDesc,
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
  };

  // Gộp thêm các bộ lọc khác nếu có giá trị thực sự; bỏ qua key đã xử lý ở trên.
  for (const [key, value] of Object.entries(params)) {
    if (key === "sortDesc" || key === "pageNumber" || key === "pageSize")
      continue;
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    cleaned[key] = value;
  }

  return cleaned;
}

function cleanParams(params: GetPaymentsParams) {
  const cleaned: Record<string, any> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "string" && value.trim() === "") return;
    cleaned[key] = value;
  });

  return cleaned;
}

/** Lấy danh sách thanh toán của tôi theo tham số phân trang/lọc; trả về dữ liệu phân trang từ lớp bọc API. */
export async function getMyPayments(
  params: GetMyPaymentsParams,
): Promise<PagedResult<Payment>> {
  const res = await apiClient.get<ApiWrapper<PagedResult<Payment>>>(
    "/api/Payments/me",
    {
      params: cleanPaymentParams(params),
    },
  );
  // ApiWrapper bọc payload trong data; chỉ trả phần PagedResult cho caller.
  return res.data.data;
}


export async function getPayments(
  params: GetPaymentsParams
): Promise<PagedResult<Payment>> {
  const res = await apiClient.get<ApiWrapper<PagedResult<Payment>>>(
    "/api/Payments",
    {
      params: cleanParams(params),
    }
  );

  return res.data.data;
}