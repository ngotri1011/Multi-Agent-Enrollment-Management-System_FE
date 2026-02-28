export type ApplicationStatus = 'pending' | 'approved' | 'rejected'

export type Application = {
  id: string
  applicantName: string
  createdAt: string
  status: ApplicationStatus
}

