export interface AgentLog {
  logId: number;
  applicationId: number;
  applicantId: number;
  documentId: number;
  agentType: string;
  action: string;
  status: string;
  outputData: string;
  createdAt: string;
}

export interface AgentLogQuery {
  applicationId?: number;
  documentId?: number;
  agentType?: string;
  status?: string;
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface AgentLogListResponse {
  items: AgentLog[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
}