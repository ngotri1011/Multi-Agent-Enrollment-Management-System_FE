export function formatDate(value: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value)
  return date.toISOString()
}

export function formatDateTimeVi(
  value?: string | number | Date,
  options?: { withSeconds?: boolean }
): string {
  if (value === null || value === undefined || value === "") return "--"
  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleString("vi-VN", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    ...(options?.withSeconds ? { second: "2-digit" } : {}),
  })
}

