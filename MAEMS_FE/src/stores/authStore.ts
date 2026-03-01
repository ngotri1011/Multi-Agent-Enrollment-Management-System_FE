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
  isInitialized: boolean;
  setAuth: (user: AuthUser | null, token: string | null) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: getStoredToken(),
      isInitialized: false,

      setAuth: (user, token) => {
        setStoredToken(token);
        set({ user, token });
      },

      logout: () => {
        setStoredToken(null);
        set({ user: null, token: null });
      },

      initAuth: async () => {
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
      partialize: (s) => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setStoredToken(state.token);
      },
    }
  )
);
