import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";

export function AuthInit() {
  const initAuth = useAuthStore((s) => s.initAuth);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [logout]);

  return null;
}

