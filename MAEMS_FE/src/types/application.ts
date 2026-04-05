export type { ApplicationStatus, DocumentStatus } from "./enums";
export type { Document } from "./document";
export type {
  ApplicationRequiresReviewLabel,
  ApplicationStatusLabel,
} from "../constants/labels";
export {
  APPLICATION_NEED_ACTION_PRESET_COMBO_LABEL,
  APPLICATION_PENDING_PRESET_COMBO_LABEL,
  APPLICATION_REQUIRES_REVIEW_LABEL,
  APPLICATION_STATUS,
} from "../constants/labels";
export {
  APPLICATION_STATUS_CARD_TW,
  APPLICATION_STATUS_HEX,
} from "../constants/colors";
import type { ApplicationStatus } from "./enums";
import type { Document } from "./document";

/**
 * Phản hồi GET `/api/Applications/me` — DTO gọn cho thí sinh.
 * Khác {@link Application}: không có `programId` / `campusId` / `admissionTypeId`, `documents`, `requiresReview`, …
 */
export type ApplicationMe = {
  applicationId: number;
  applicantId: number;
  applicantName: string;
  configId: number;
  programName: string;
  campusName: string;
  admissionTypeName: string;
  status: ApplicationStatus;
  submittedAt: string;
  lastUpdated: string;
  notes: string | null;
};

export type Application = {
  applicationId: number;
  applicantId: number;
  configId: number;
  programId: number;
  campusId: number;
  admissionTypeId: number;
  enrollmentYearId: number;
  enrollmentYear: string;
  status: ApplicationStatus;
  submittedAt: string;
  lastUpdated: string;
  assignedOfficerId: number | null;
  assignedOfficerName: string | null;
  notes: string | null;
  /** `true`: hiển thị nhãn {@link APPLICATION_REQUIRES_REVIEW_LABEL}. */
  requiresReview: boolean;
  applicantName: string;
  programName: string;
  campusName: string;
  admissionTypeName: string;
  documents: Document[];
};

export type CreateApplicationRequest = {
  configId: number;
};

export type CreateApplicationResponse = {
  applicationId: number;
  applicantId: number;
  applicantName: string;
  programId: number;
  programName: string;
  enrollmentYearId: number;
  enrollmentYear: string;
  campusId: number;
  campusName: string;
  admissionTypeId: number;
  admissionTypeName: string;
  status: ApplicationStatus;
  submittedAt: string;
  lastUpdated: string;
  assignedOfficerId: string | null;
  assignedOfficerName: string | null;
  /** `true`: hiển thị nhãn {@link APPLICATION_REQUIRES_REVIEW_LABEL}. */
  requiresReview: boolean;
  createdAt: string;
};

export type SubmitApplicationFinalPayment = {
  url: string;
  transactionId: string;
};

// API: nếu chưa thanh toán thì trả QR info; nếu đã thanh toán thì `null`
export type SubmitApplicationFinalResponse =
  SubmitApplicationFinalPayment | null;
