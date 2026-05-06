import type { performanceData } from "../types/system-monitor";
import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";


export async function getPerformanceData() {
  const res = await apiClient.get<ApiWrapper<performanceData>>("/api/SystemMonitor/performance");
  return res.data.data;
}