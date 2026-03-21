export type { ApplicationStatus, DocumentStatus } from './enums';
import type { ApplicationStatus, DocumentStatus } from './enums';

export type Application = {
  applicationId: number
  applicantId: number
  programId: number
  enrollmentYearId: number
  campusId: number
  admissionTypeId: number
  applicantName: string
  programName: string
  enrollmentYear: string
  campusName: string
  admissionTypeName: string
  status: ApplicationStatus
  submittedAt: string
  lastUpdated: string
  assignedOfficerId : number | null
  assignedOfficerName: string | null
  notes: string | null
  requiresReview: boolean
  documents: Document[]
}

export type Document = {
  documentId: number
  applicationId: number
  documentType: string
  filePath: string
  uploadedAt: string
  fileName: string
  fileFormat: string
  verificationResult: DocumentStatus
  verificationDetails: string
}

export type CreateApplicationRequest = {
  configId: number
}

export type CreateApplicationResponse = {
  applicationId: number
  applicantId: number
  applicantName: string
  programId: number
  programName: string
  enrollmentYearId: number
  enrollmentYear: string
  campusId: number
  campusName: string
  admissionTypeId: number
  admissionTypeName: string
  status: ApplicationStatus
  submittedAt: string
  lastUpdated: string
  assignedOfficerId:string | null
  assignedOfficerName:string | null
  requiresReview: boolean
  createdAt: string
}