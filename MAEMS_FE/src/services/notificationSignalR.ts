import * as signalR from "@microsoft/signalr";
import { getStoredToken } from "./axios";

const rawBaseUrl = import.meta.env.VITE_MAEMS_API_URL ?? "";
const baseUrl = rawBaseUrl.replace(/\/+$/, "");
const hubUrl = baseUrl ? `${baseUrl}/api/hubs/notifications` : "/api/hubs/notifications";

export type RealtimeNotification = {
  notificationId: number;
  notificationType?: string;
  message: string;
  sentAt: string;
  isRead?: boolean;
};

export function normalizeRealtimeNotification(payload: unknown): RealtimeNotification | null {
  if (!payload || typeof payload !== "object") return null;

  const raw = payload as Record<string, unknown>;
  const notificationId = Number(raw.notificationId ?? raw.id ?? 0);
  const message = String(raw.message ?? raw.content ?? "");
  const sentAt = String(raw.sentAt ?? raw.createdAt ?? new Date().toISOString());

  if (!notificationId || !message) return null;

  return {
    notificationId,
    notificationType:
      typeof raw.notificationType === "string" ? raw.notificationType : undefined,
    message,
    sentAt,
    isRead: Boolean(raw.isRead ?? false),
  };
}

export function createNotificationConnection() {
  const token = getStoredToken();

  if (!token) {
    return null;
  }

  return new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => getStoredToken() ?? token,
      transport:
        signalR.HttpTransportType.WebSockets |
        signalR.HttpTransportType.LongPolling,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .configureLogging(signalR.LogLevel.Information)
    .build();
}