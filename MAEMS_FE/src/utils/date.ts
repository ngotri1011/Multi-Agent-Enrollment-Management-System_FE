/**
 * Chuẩn hóa chuỗi ISO datetime từ backend:
 * - Cắt phần thập phân giây xuống còn 3 chữ số (ms) để tránh parse lỗi trên một số engine
 *   vì backend có lúc trả 4 chữ số (ví dụ .1234) hoặc 6 chữ số microseconds (ví dụ .123456).
 * - Nếu chuỗi chưa có chỉ định múi giờ (không có 'Z' và không có '+'/'-' offset),
 *   tự động thêm 'Z' để trình duyệt hiểu đây là UTC và chuyển đổi sang giờ địa phương đúng.
 */
export function ensureUtc(iso: string): string {
  if (!iso) return iso;

  // Cắt phần thập phân giây về đúng 3 chữ số milliseconds.
  // Regex khớp với phần ".NNNN..." (4 chữ số trở lên) rồi giữ lại 3 chữ số đầu.
  const normalized = iso.replace(/(\.\d{3})\d+/, "$1");

  // Kiểm tra xem chuỗi đã có thông tin múi giờ chưa (kết thúc bằng Z, hoặc có +HH:MM / -HH:MM).
  const hasTimezone = /Z$/i.test(normalized) || /[+-]\d{2}:\d{2}$/.test(normalized);

  return hasTimezone ? normalized : normalized + "Z";
}

export function formatDate(value: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value)
  return date.toISOString()
}

export function formatDateTimeVi(
  value?: string | number | Date | null,
  options?: { withSeconds?: boolean; utcOffsetHours?: number; timeFirst?: boolean }
): string {
  if (value === null || value === undefined || value === "") return "--"
  // Nếu value là chuỗi ISO từ backend, chuẩn hóa trước (thêm 'Z', cắt microseconds)
  // để new Date() parse đúng UTC thay vì hiểu nhầm thành giờ địa phương.
  const normalized = typeof value === "string" ? ensureUtc(value) : value
  const rawDate = normalized instanceof Date ? normalized : new Date(normalized)
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

