import type { Campus } from './campus';

export interface Program {
  programId: number;
  programName: string;
  majorName: string;
  enrollmentYear: string;
  description: string;
  careerProspects: string;
  duration: string;
  isActive: boolean;
  campuses: Campus[];
}

export interface ProgramBasic {
  programId: number;
  programName: string;
  majorName: string;
}

export interface CreateProgramRequest {
  programName: string;
  majorId: number;
  enrollmentYearId: number;
  description: string;
  careerProspects: string;
  duration: string;
  isActive: boolean;
}

export interface UpdateProgramRequest {
  programId: number;
  programName: string;
  description: string;
  careerProspects: string;
  duration: string;
  isActive: boolean;
}

export interface ProgramQueryParams {
  majorId?: number;
  enrollmentYearId?: number;
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedProgramResponse {
  items: Program[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}