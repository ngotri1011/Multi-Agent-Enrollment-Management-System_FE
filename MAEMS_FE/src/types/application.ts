export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export type Application = {
  id: string
  applicantName: string
  createdAt: string
  status: ApplicationStatus
}

export type CreateApplicationRequest = {
  programId: number
  enrollmentYearId: number
  campusId: number
  admissionTypeId: number
}

// Chưa có response từ API thực tế, nên tạm thời để như thế này
export type CreateApplicationResponse = {
  applicationId: number
  applicantId: number
  programId: number
  enrollmentYearId: number
  campusId: number
  admissionTypeId: number
  createdAt: string
}