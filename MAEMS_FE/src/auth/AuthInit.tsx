import { useCallback, useEffect, useRef } from "react";
import { useAuthStore } from "../stores/authStore";
import * as authApi from "../api/auth";

const TOKEN_REFRESH_INTERVAL_MS = 59 * 60 * 1000;

export function AuthInit() {
  // Lấy các action/state cần thiết từ auth store để khởi tạo và duy trì phiên đăng nhập.
  const initAuth = useAuthStore((s) => s.initAuth);
  const logout = useAuthStore((s) => s.logout);
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  // Lưu tham chiếu interval để có thể chủ động clear khi logout/unmount hoặc khi state auth thay đổi.
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Khóa chống gọi refresh token chồng chéo khi nhiều request cùng trả về 401 trong thời gian ngắn.
  const isRefreshingRef = useRef(false);

  const tryRefreshAuth = useCallback(async () => {
    // Nếu đang refresh hoặc thiếu token cần thiết thì không chạy thêm luồng mới.
    if (isRefreshingRef.current || !token || !refreshToken) {
      return;
    }

    isRefreshingRef.current = true;
    try {
      // Thử gia hạn phiên bằng refresh token 7 ngày để người dùng không phải đăng nhập lại liên tục.
      const result = await authApi.refreshTokenApi(token, refreshToken);
      setAuth(result.user, result.token, result.refreshToken);
    } catch {
      // Nếu refresh thất bại thì coi như phiên không còn hợp lệ và thực hiện logout.
      logout();
    } finally {
      isRefreshingRef.current = false;
    }
  }, [token, refreshToken, setAuth, logout]);

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
    // Nếu thiếu thông tin auth thì dừng cơ chế refresh định kỳ để tránh gọi API không hợp lệ.
    if (!user || !token || !refreshToken) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(async () => {
      // Gia hạn phiên định kỳ để hạn chế tối đa rơi vào tình huống token hết hạn khi user đang hoạt động.
      await tryRefreshAuth();
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => {
      // Dọn dẹp interval khi dependencies đổi hoặc component unmount để tránh rò rỉ tài nguyên.
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, token, refreshToken, tryRefreshAuth]);

  return null;
}
