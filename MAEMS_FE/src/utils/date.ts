export function formatDate(value: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value)
  return date.toISOString()
}

export function formatDateTimeVi(
  value?: string | number | Date | null,
  options?: { withSeconds?: boolean; utcOffsetHours?: number; timeFirst?: boolean }
): string {
  if (value === null || value === undefined || value === "") return "--"
  const rawDate = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(rawDate.getTime())) return "--"

  // Hỗ trợ nghiệp vụ backend trả mốc thời gian UTC (GMT+0), cần cộng offset trước khi hiển thị.
  const adjustedDate = options?.utcOffsetHours
    ? new Date(rawDate.getTime() + options.utcOffsetHours * 60 * 60 * 1000)
    : rawDate

  const dd = String(adjustedDate.getDate()).padStart(2, "0")
  const mm = String(adjustedDate.getMonth() + 1).padStart(2, "0")
  const yyyy = adjustedDate.getFullYear()
  const hh = String(adjustedDate.getHours()).padStart(2, "0")
  const min = String(adjustedDate.getMinutes()).padStart(2, "0")
  const ss = String(adjustedDate.getSeconds()).padStart(2, "0")

  const timePart = options?.withSeconds ? `${hh}:${min}:${ss}` : `${hh}:${min}`
  const datePart = `${dd}/${mm}/${yyyy}`

  // Cho phép đảo thứ tự "giờ trước, ngày sau" để phù hợp format hiển thị theo yêu cầu từng màn hình.
  return options?.timeFirst ? `${timePart} ${datePart}` : `${datePart} ${timePart}`
}

