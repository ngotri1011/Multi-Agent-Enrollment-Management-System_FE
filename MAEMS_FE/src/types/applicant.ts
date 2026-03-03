export type CreateApplicantRequest = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  highSchoolName: string;
  highSchoolDistrict: string;
  highSchoolProvince: string;
  graduationYear: number;
  idIssueNumber: string;
  idIssueDate: string;
  idIssuePlace: string;
  contactName: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  allowShare: boolean;
};

export type CreateApplicantResponse = {
  applicantId: number;
  userId: number;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  highSchoolName: string;
  highSchoolDistrict: string;
  highSchoolProvince: string;
  graduationYear: number;
  idIssueNumber: string;
  idIssueDate: string;
  idIssuePlace: string;
  contactName: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  allowShare: boolean;
  createdAt: string;
};
