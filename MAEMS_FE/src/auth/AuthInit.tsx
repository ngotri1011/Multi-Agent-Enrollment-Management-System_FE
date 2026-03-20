import { useEffect, useRef } from "react";
import { useAuthStore } from "../stores/authStore";
import * as authApi from "../api/auth";

const TOKEN_REFRESH_INTERVAL_MS = 59 * 60 * 1000;

export function AuthInit() {
  const initAuth = useAuthStore((s) => s.initAuth);
  const logout = useAuthStore((s) => s.logout);
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [logout]);

  useEffect(() => {
    if (!user || !token || !refreshToken) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(async () => {
      try {
        const result = await authApi.refreshToken(token, refreshToken);
        setAuth(result.user, result.token, result.refreshToken);
      } catch {
        logout();
      }
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, token, refreshToken, setAuth, logout]);

  return null;
}

