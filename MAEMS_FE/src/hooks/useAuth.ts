import { useAuthStore } from "../auth/stores/authStore";

export function useAuth() {
  const { user, token, setAuth, logout, initAuth, isInitialized } =
    useAuthStore();

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    setAuth,
    logout,
    initAuth,
    isInitialized,
  };
}
