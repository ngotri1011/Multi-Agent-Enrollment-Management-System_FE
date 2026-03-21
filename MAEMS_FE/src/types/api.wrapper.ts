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