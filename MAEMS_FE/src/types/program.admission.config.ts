export interface ProgramAdmissionConfig {
    configId: number;
    programId: number;
    programName: string;
    campusId: number;
    campusName: string;
    admissionTypeId: number;
    admissionTypeName: string;
    quota: number;
    isActive: boolean;
    createdAt: string;
}

export interface ProgramAdmissionConfigQuery {
  programId?: number;
  campusId?: number;
  admissionTypeId?: number;
  search?: string;
  sortBy?: string;
  sortDesc?: boolean;
  pageNumber?: number;
  pageSize?: number;
}

export interface ProgramAdmissionConfigResponse {
  items: ProgramAdmissionConfig[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}