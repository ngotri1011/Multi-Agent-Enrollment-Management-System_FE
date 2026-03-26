import axios, { type InternalAxiosRequestConfig } from "axios";

const baseURL =
  import.meta.env.VITE_MAEMS_API_URL;

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
      setStoredToken(null);
      window.dispatchEvent(new CustomEvent("auth:logout"));
    }
    return Promise.reject(error);
  }
);
