export interface AdmissionType {
  admissionTypeId: number;
  admissionTypeName: string;
  enrollmentYear: string;
  type: string;
  requiredDocumentList: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdmissionTypeBasic {
  admissionTypeId: number;
  admissionTypeName: string;
  type: string;
}

export interface CreateAdmissionTypeRequest {
  admissionTypeName: string;
  enrollmentYearId: number;
  type: string;
  requiredDocumentList: string;
  isActive: boolean;
}
export interface UpdateAdmissionTypeRequest {
  admissionTypeId: number;
  admissionTypeName: string;
  enrollmentYearId: number;
  type: string;
  requiredDocumentList: string;
  isActive: boolean;
}