import { jwtDecode } from "jwt-decode";

type JwtClaims = {
  sub?: string;
  nameid?: string;
  userId?: string | number;
  UserId?: string | number;
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
