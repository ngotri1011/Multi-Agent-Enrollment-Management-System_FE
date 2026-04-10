import type { PaymentStatus } from "./enums";
export type { PaymentStatus } from "./enums";

export type Payment = {
  paymentId: number;
  applicationId: number;
  applicantId: number;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  referenceCode: string | null;
  paymentStatus: PaymentStatus;
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

export type GetPaymentsParams = {
  status?: string;
  transactionId?: string;
  paidFrom?: string;
  paidTo?: string;
  sortBy?: string;
  sortDesc?: boolean;
  pageNumber?: number;
  pageSize?: number;
};