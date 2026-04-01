import type { Dayjs } from "dayjs";

export function toIsoBoundary(value: Dayjs | null, endOfDay = false): string | undefined {
  if (!value) return undefined;
  return endOfDay ? value.endOf("day").toISOString() : value.startOf("day").toISOString();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}
