// API response wrapper
export type ApiWrapper<T> = {
    success: boolean;
    message: string;
    data: T;
    errors: string[];
  };