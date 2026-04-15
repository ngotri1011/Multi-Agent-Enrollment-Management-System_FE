import { useCallback, useEffect, useRef } from "react";
import { useAuthStore } from "../stores/authStore";
import * as authApi from "../api/auth";

// Chu kỳ refresh định kỳ sau lần refresh đầu tiên (55 phút/lần).
const TOKEN_REFRESH_INTERVAL_MS = 55 * 60 * 1000;
// Giới hạn tối đa 7 ngày cho toàn bộ phiên kể từ lúc đăng nhập thành công lần đầu.
const AUTO_REFRESH_MAX_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
// Refresh sớm hơn thời điểm access token hết hạn 5 phút để tránh rơi vào trạng thái vừa hết hạn.
const TOKEN_REFRESH_LEAD_TIME_MS = 5 * 60 * 1000;
// Cờ bật/tắt log debug timer refresh khi cần kiểm tra thủ công.
const ENABLE_REFRESH_TIMER_DEBUG_LOG = false;
// Tần suất in log debug khi cờ phía trên bật (mỗi 10 giây).
const REFRESH_TIMER_LOG_INTERVAL_MS = 10 * 1000;
const formatFullDateTime = (timestampMs: number) =>
  new Date(timestampMs).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
const formatRemainingDuration = (remainingMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  return `${days}d ${hours}h ${minutes}m`;
};

export function AuthInit() {
  // Lấy các action/state cần thiết từ auth store để khởi tạo và duy trì phiên đăng nhập.
  const initAuth = useAuthStore((s) => s.initAuth);
  const logout = useAuthStore((s) => s.logout);
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const accessTokenExpiresAt = useAuthStore((s) => s.accessTokenExpiresAt);
  const authSessionStartedAt = useAuthStore((s) => s.authSessionStartedAt);
  // Lưu tham chiếu interval để có thể chủ động clear khi logout/unmount hoặc khi state auth thay đổi.
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Lưu tham chiếu timeout cho lần refresh đầu tiên để canh đúng theo mốc login/refresh thành công gần nhất.
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Lưu timer log debug 1 phút/lần để theo dõi thời điểm refresh kế tiếp khi cần test.
  const refreshDebugLogRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  // Lưu mốc refresh kế tiếp để log luôn ra được giờ cụ thể.
  const nextRefreshAtRef = useRef<number | null>(null);
  // Khóa chống gọi refresh token chồng chéo khi nhiều request cùng trả về 401 trong thời gian ngắn.
  const isRefreshingRef = useRef(false);

  const tryRefreshAuth = useCallback(async () => {
    // Hết cửa sổ 7 ngày kể từ lần login đầu tiên thì dừng tự gia hạn và buộc đăng xuất theo chính sách timeout.
    const sessionStartedMs = authSessionStartedAt
      ? new Date(authSessionStartedAt).getTime()
      : NaN;
    const isTimeoutReached =
      Number.isFinite(sessionStartedMs) &&
      Date.now() - sessionStartedMs >= AUTO_REFRESH_MAX_DURATION_MS;
    if (isTimeoutReached) {
      logout();
      return;
    }

    // Nếu đang refresh hoặc thiếu token cần thiết thì không chạy thêm luồng mới.
    if (isRefreshingRef.current || !token || !refreshToken) {
      return;
    }

    isRefreshingRef.current = true;
    try {
      // Thử gia hạn phiên bằng refresh token 7 ngày để người dùng không phải đăng nhập lại liên tục.
      const result = await authApi.refreshTokenApi(token, refreshToken);
      setAuth(
        result.user,
        result.token,
        result.refreshToken,
        result.accessTokenExpiresAt,
        result.refreshTokenExpiresAt,
      );
    } catch {
      // Chỉ log lỗi khi refresh thất bại để giữ console gọn, sau đó buộc logout để đảm bảo an toàn phiên.
      console.error("[AuthInit] Refresh token thất bại, thực hiện logout.");
      logout();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [authSessionStartedAt, token, refreshToken, setAuth, logout]);

  useEffect(() => {
    // Khởi tạo trạng thái đăng nhập ngay khi app mount (đọc token đã lưu, đồng bộ store...).
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    // Lắng nghe sự kiện logout toàn cục để đồng bộ đăng xuất giữa các luồng xử lý.
    const handleLogout = () => logout();
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [logout]);

  useEffect(() => {
    // Khi interceptor bắt được 401 từ API thường, thử refresh trước khi buộc logout.
    const handleUnauthorized = () => {
      void tryRefreshAuth();
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () =>
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, [tryRefreshAuth]);

  useEffect(() => {
    // Nếu thiếu thông tin auth thì dừng cơ chế refresh tự động để tránh gọi API không hợp lệ.
    if (!user || !token || !refreshToken || !authSessionStartedAt) {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      if (refreshDebugLogRef.current) {
        clearInterval(refreshDebugLogRef.current);
        refreshDebugLogRef.current = null;
      }
      nextRefreshAtRef.current = null;
      return;
    }

    const sessionStartedMs = new Date(authSessionStartedAt).getTime();
    if (
      Number.isFinite(sessionStartedMs) &&
      Date.now() - sessionStartedMs >= AUTO_REFRESH_MAX_DURATION_MS
    ) {
      // Nếu đã quá 7 ngày từ phiên đăng nhập đầu tiên thì logout ngay để đảm bảo timeout tuyệt đối.
      logout();
      return;
    }

    // Dọn timer cũ trước khi tạo timer mới để tránh trùng lịch refresh khi state auth thay đổi.
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (refreshDebugLogRef.current) {
      clearInterval(refreshDebugLogRef.current);
      refreshDebugLogRef.current = null;
    }

    // Ưu tiên bám theo accessTokenExpiresAt để lần refresh đầu tiên luôn tính từ lần login/refresh thành công gần nhất.
    const accessTokenExpiresMs = accessTokenExpiresAt
      ? new Date(accessTokenExpiresAt).getTime()
      : NaN;
    const plannedInitialDelayMs = Number.isFinite(accessTokenExpiresMs)
      ? accessTokenExpiresMs - Date.now() - TOKEN_REFRESH_LEAD_TIME_MS
      : TOKEN_REFRESH_INTERVAL_MS;
    const initialDelayMs = Math.max(
      0,
      Math.min(plannedInitialDelayMs, TOKEN_REFRESH_INTERVAL_MS),
    );
    nextRefreshAtRef.current = Date.now() + initialDelayMs;

    // Chạy lần đầu theo delay đã tính (kể cả khi user mở lại web), sau đó duy trì chu kỳ 55 phút.
    refreshTimeoutRef.current = setTimeout(() => {
      void tryRefreshAuth();
      nextRefreshAtRef.current = Date.now() + TOKEN_REFRESH_INTERVAL_MS;
      refreshTimerRef.current = setInterval(() => {
        void tryRefreshAuth();
        nextRefreshAtRef.current = Date.now() + TOKEN_REFRESH_INTERVAL_MS;
      }, TOKEN_REFRESH_INTERVAL_MS);
    }, initialDelayMs);

    if (ENABLE_REFRESH_TIMER_DEBUG_LOG) {
      // Bật debug theo cờ để tránh spam console ở môi trường dùng thật.
      refreshDebugLogRef.current = setInterval(() => {
        const nextRefreshAt = nextRefreshAtRef.current;
        if (!nextRefreshAt) return;
        const sessionStartedMs = new Date(authSessionStartedAt).getTime();
        const sessionTimeoutAt =
          sessionStartedMs + AUTO_REFRESH_MAX_DURATION_MS;
        const remainingUntilSessionTimeoutMs = sessionTimeoutAt - Date.now();
        console.info(
          `[AuthInit] Refresh tiếp theo: ${formatFullDateTime(nextRefreshAt)} | Hết phiên 7 ngày: ${formatFullDateTime(sessionTimeoutAt)} | Còn lại: ${formatRemainingDuration(remainingUntilSessionTimeoutMs)}.`,
        );
      }, REFRESH_TIMER_LOG_INTERVAL_MS);
    }

    return () => {
      // Dọn dẹp timer khi dependencies đổi hoặc component unmount để tránh rò rỉ tài nguyên.
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      if (refreshDebugLogRef.current) {
        clearInterval(refreshDebugLogRef.current);
        refreshDebugLogRef.current = null;
      }
      nextRefreshAtRef.current = null;
    };
  }, [
    accessTokenExpiresAt,
    authSessionStartedAt,
    logout,
    user,
    token,
    refreshToken,
    tryRefreshAuth,
  ]);

  return null;
}
