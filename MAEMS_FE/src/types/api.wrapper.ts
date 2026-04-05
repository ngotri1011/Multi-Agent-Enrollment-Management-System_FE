// API response wrapper
export type ApiWrapper<T> = {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
};

export type PagedResult<T> = {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
};

export type ReportWrapper<T> = {
  totalCount: number;
  approvedCount: number;
  rejectedCount: number;
  applications: T[];
};
