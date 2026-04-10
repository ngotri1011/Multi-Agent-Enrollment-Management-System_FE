import { apiClient } from "../services/axios";
import type { ApiWrapper } from "../types/api.wrapper";
import type { AgentLogListResponse, AgentLogQuery } from "../types/agent-log";

// GET /api/AgentLogs
export async function getAgentLogs(
  params: AgentLogQuery
): Promise<AgentLogListResponse> {
  const res = await apiClient.get<ApiWrapper<AgentLogListResponse>>(
    "/api/AgentLogs",
    { params }
  );

  return res.data.data;
}