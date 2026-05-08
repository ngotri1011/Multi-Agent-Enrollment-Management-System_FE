import * as signalR from "@microsoft/signalr";

import type { performanceData } from "../types/system-monitor";

const API_BASE_URL = import.meta.env.VITE_MAEMS_API_URL;

interface SignalRResponse {
  success: boolean;
  message: string;
  data: performanceData;
  errors: string[];
}

class SystemMonitorSignalRService {
  private connection: signalR.HubConnection | null = null;

  async start(
    onReceive: (data: performanceData) => void
  ): Promise<void> {
    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/systemMonitorHub`)
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.connection.on(
        "ReceiveSystemPerformance",
        (response: SignalRResponse) => {
          console.log("Received SignalR data:", response);

          if (response?.data) {
            onReceive(response.data);
          }
        }
      );

      await this.connection.start();

      console.log("SystemMonitor SignalR connected");
    } catch (error) {
      console.error("SignalR connection error:", error);
    }
  }

  async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }
}

export const systemMonitorSignalRService =
  new SystemMonitorSignalRService();