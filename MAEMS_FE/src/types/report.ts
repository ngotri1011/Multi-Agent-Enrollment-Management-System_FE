export type Report = {
  id: string
  name: string
  createdAt: string
}

// SUMMARY 
export type ReportSummary = {
  numApplicant: number;
  numApplication: number;
  numPaymentNeedCheck: number;
  numProgram: number;
};

// WEEKLY APPLICATIONS 
export type WeeklyApplications = {
  weekStart: string;
  count: number;
};

// BY CAMPUS 
export type ApplicationsByCampus = {
  campusId: number;
  campusName: string;
  count: number;
};

// PROGRAMS BY CAMPUS 
export type ApplicationsByProgram = {
  programId: number;
  programName: string;
  count: number;
};

// STATUS COUNTS
export type ApplicationStatusCounts = {
  numApproved: number;
  numRejected: number;
  numPending: number;
};

// BY OFFICER 
export type ApplicationsByOfficer = {
  assignedOfficerId: number | null;
  assignedOfficerName: string | null;
  count: number;
};

// QUARTERLY PAYMENT REVENUE
export type QuarterlyPaymentRevenueQuarter = {
  quarter: number;
  totalAmount: number;
};

export type QuarterlyPaymentRevenue = {
  year: number;
  numPaymentNeedCheck: number;
  quarters: QuarterlyPaymentRevenueQuarter[];
};