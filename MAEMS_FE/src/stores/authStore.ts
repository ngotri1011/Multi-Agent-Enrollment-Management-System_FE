import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getStoredToken,
  setStoredToken,
} from "../services/axios";
import * as authApi from "../api/auth";
import type { AuthUser } from "../types/auth";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  isInitialized: boolean;
  setAuth: (user: AuthUser | null, token: string | null, refreshToken?: string | null) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: getStoredToken(),
      refreshToken: null,
      isInitialized: false,

      setAuth: (user, token, refreshToken = null) => {
        setStoredToken(token);
        set({ user, token, refreshToken });
      },

      logout: () => {
        setStoredToken(null);
        set({ user: null, token: null, refreshToken: null });
      },

      initAuth: async () => {
        if (get().isInitialized) return;
        const token = getStoredToken();
        if (!token) {
          set({ user: null, token: null, isInitialized: true });
          return;
        }
        try {
          const user = await authApi.getCurrentUser();
          set({ user, token, isInitialized: true });
        } catch {
          setStoredToken(null);
          set({ user: null, token: null, isInitialized: true });
        }
      },
    }),
    {
      name: "maems-auth",
      partialize: (s) => ({ user: s.user, token: s.token, refreshToken: s.refreshToken }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setStoredToken(state.token);
      },
    }
  )
);
