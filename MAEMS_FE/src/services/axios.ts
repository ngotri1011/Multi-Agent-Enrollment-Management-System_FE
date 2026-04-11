import axios, { type InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_MAEMS_API_URL;

export const apiClient = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

const TOKEN_KEY = "maems_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // If request body is FormData, remove default JSON Content-Type header.
  // Otherwise axios may send `Content-Type: application/json` and many backends return 415.
  if (config.data instanceof FormData) {
    const headers = config.headers as Record<string, unknown> | undefined;
    if (headers) {
      delete headers["Content-Type"];
      delete headers["content-type"];
    }
  }

  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Không logout ngay khi token hết hạn; ưu tiên phát tín hiệu để AuthInit thử refresh phiên trước.
      const requestUrl: string = String(error.config?.url ?? "");
      const isRefreshTokenRequest = requestUrl.includes(
        "/api/Users/refresh-token",
      );

      if (isRefreshTokenRequest) {
        // Nếu chính API refresh-token cũng 401 thì phiên đã hết hạn thật sự, cần logout.
        window.dispatchEvent(new CustomEvent("auth:logout"));
      } else {
        // Với các request thông thường bị 401, chuyển sang luồng refresh token tự động.
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }
    return Promise.reject(error);
  },
);
