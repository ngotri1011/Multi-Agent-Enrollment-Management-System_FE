export interface EnrollmentYear {
  enrollmentYearId: number;
  year: string;
  registrationStartDate: string;
  registrationEndDate: string;
  status: string;
}

export interface CreateEnrollmentYearRequest {
  year: string;
  registrationStartDate: string;
  registrationEndDate: string;
  status: string;
}