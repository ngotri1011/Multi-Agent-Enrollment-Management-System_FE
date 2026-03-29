export type Payment = {
  paymentId: number;
  applicationId: number;
  applicantId: number;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  referenceCode: string | null;
  paymentStatus: string;
  paidAt: string | null;
};

export type GetMyPaymentsParams = {
  sortDesc: boolean;
  pageNumber: number;
  pageSize: number;
  status?: string;
  transactionId?: string;
  paidFrom?: string;
  paidTo?: string;
  sortBy?: string;
};
