import { useAuthStore } from "../stores/authStore";

export function useAuth() {
  const { user, token, refreshToken, setAuth, logout, initAuth, isInitialized } =
    useAuthStore();

  return {
    user,
    token,
    refreshToken,
    isAuthenticated: !!token && !!user,
    setAuth,
    logout,
    initAuth,
    isInitialized,
  };
}
