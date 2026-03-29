import { apiClient } from "../services/axios";
import type { ApiWrapper, PagedResult } from "../types/api.wrapper";
import type { GetMyPaymentsParams, Payment } from "../types/payment.ts";

function cleanPaymentParams(params: GetMyPaymentsParams): Record<string, string | number | boolean> {
  const cleaned: Record<string, string | number | boolean> = {
    sortDesc: params.sortDesc,
    pageNumber: params.pageNumber,
    pageSize: params.pageSize,
  };

  for (const [key, value] of Object.entries(params)) {
    if (key === "sortDesc" || key === "pageNumber" || key === "pageSize") continue;
    if (value === undefined || value === null) continue;
    if (typeof value === "string" && value.trim() === "") continue;
    cleaned[key] = value;
  }

  return cleaned;
}

export async function getMyPayments(
  params: GetMyPaymentsParams,
): Promise<PagedResult<Payment>> {
  const res = await apiClient.get<ApiWrapper<PagedResult<Payment>>>(
    "/api/Payments/me",
    {
      params: cleanPaymentParams(params),
    },
  );
  return res.data.data;
}