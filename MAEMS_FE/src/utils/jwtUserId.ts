import { jwtDecode } from "jwt-decode";

/**
 * Tiện ích đọc thông tin từ JWT ở phía FE:
 * - Trích xuất `userId` dạng số từ nhiều biến thể claim mà BE có thể trả về.
 * - Đọc thời điểm hết hạn token (`exp`) để chủ động kiểm tra phiên đăng nhập.
 *
 * Mục tiêu là gom toàn bộ logic parse claim JWT vào một nơi để các page/store
 * tái sử dụng thống nhất, tránh lặp lại xử lý decode ở nhiều chỗ.
 */
type JwtClaims = {
  sub?: string;
  nameid?: string;
  userId?: string | number;
  UserId?: string | number;
  exp?: number;
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
};

/** Lấy user id số từ JWT nếu BE đặt trong token (thường dùng cho `assignedOfficerId`). */
export function getNumericUserIdFromToken(token: string | null): number | null {
  if (!token) return null;
  try {
    const c = jwtDecode<JwtClaims>(token);
    const raw =
      c.userId ??
      c.UserId ??
      c.sub ??
      c.nameid ??
      c["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
    if (raw == null) return null;
    const n = typeof raw === "number" ? raw : parseInt(String(raw), 10);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

/** Lấy timestamp hết hạn (milliseconds) từ claim `exp` của JWT, trả null nếu token không hợp lệ. */
export function getTokenExpiryMs(token: string | null): number | null {
  if (!token) return null;
  try {
    const c = jwtDecode<JwtClaims>(token);
    if (!c.exp || !Number.isFinite(c.exp)) return null;
    return c.exp * 1000;
  } catch {
    return null;
  }
}
