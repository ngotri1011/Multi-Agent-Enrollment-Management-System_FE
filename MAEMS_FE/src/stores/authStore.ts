import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getStoredToken,
  setStoredToken,
} from "../services/axios";
import * as authApi from "../api/auth";
import type { AuthUser } from "../types/auth";
import { clearApplicantChatForEmail } from "../utils/applicantChatStorage";

type AuthState = {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  authSessionStartedAt: string | null;
  isInitialized: boolean;
  setAuth: (
    user: AuthUser | null,
    token: string | null,
    refreshToken?: string | null,
    accessTokenExpiresAt?: string | null,
    refreshTokenExpiresAt?: string | null,
      authSessionStartedAt?: string | null,
  ) => void;
  logout: () => void;
  initAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: getStoredToken(),
      refreshToken: null,
      accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null,
      authSessionStartedAt: null,
      isInitialized: false,

      setAuth: (
        user,
        token,
        refreshToken = null,
        accessTokenExpiresAt = null,
        refreshTokenExpiresAt = null,
        authSessionStartedAt,
      ) => {
        const currentSessionStartedAt = get().authSessionStartedAt;
        const nextSessionStartedAt =
          authSessionStartedAt ??
          currentSessionStartedAt ??
          (token ? new Date().toISOString() : null);

        setStoredToken(token);
        set({
          user,
          token,
          refreshToken,
          accessTokenExpiresAt,
          refreshTokenExpiresAt,
          authSessionStartedAt: nextSessionStartedAt,
        });
      },

      logout: () => {
        const current = get().user;
        if (current?.email) {
          clearApplicantChatForEmail(current.email);
        }
        setStoredToken(null);
        set({
          user: null,
          token: null,
          refreshToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          authSessionStartedAt: null,
        });
      },

      initAuth: async () => {
        if (get().isInitialized) return;
        const token = getStoredToken();
        if (!token) {
          set({
            user: null,
            token: null,
            refreshToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            authSessionStartedAt: null,
            isInitialized: true,
          });
          return;
        }
        try {
          const user = await authApi.getCurrentUser();
          set({ user, token, isInitialized: true });
        } catch {
          setStoredToken(null);
          set({
            user: null,
            token: null,
            refreshToken: null,
            accessTokenExpiresAt: null,
            refreshTokenExpiresAt: null,
            authSessionStartedAt: null,
            isInitialized: true,
          });
        }
      },
    }),
    {
      name: "maems-auth",
      partialize: (s) => ({
        user: s.user,
        token: s.token,
        refreshToken: s.refreshToken,
        accessTokenExpiresAt: s.accessTokenExpiresAt,
        refreshTokenExpiresAt: s.refreshTokenExpiresAt,
        authSessionStartedAt: s.authSessionStartedAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) setStoredToken(state.token);
      },
    }
  )
);
