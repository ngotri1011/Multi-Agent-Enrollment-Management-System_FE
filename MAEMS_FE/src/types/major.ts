export interface Major {
    majorId: number;
    majorCode: string;
    majorName: string;
    description: string;
    isActive: boolean;
}

export interface MajorBasic {
    majorId: number;
    majorCode: string;
    majorName: string;
}

export interface MajorQueryParams {
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface MajorListResponse {
  items: Major[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateMajorRequest {
  majorCode: string;
  majorName: string;
  description: string;
  isActive: boolean;
}

export interface UpdateMajorRequest {
  majorId: number;
  majorCode: string;
  majorName: string;
  description: string;
  isActive: boolean;
}