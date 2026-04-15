import type { ApplicationStatus, DocumentStatus } from "../types/enums";

/** Nhãn tiếng Việt theo mã trạng thái API. */
export const APPLICATION_STATUS = {
  draft: "Bản nháp",
  submitted: "Đã nộp",
  under_review: "Chờ xét duyệt",
  approved: "Đã phê duyệt",
  rejected: "Không được duyệt",
  document_required: "Yêu cầu bổ sung hồ sơ",
} as const satisfies Record<ApplicationStatus, string>;

/** Nhãn tiếng Việt cho trạng thái xác minh tài liệu, dùng chung toàn hệ thống. */
export const DOCUMENT_STATUS = {
  pending: "Chờ duyệt",
  verified: "Đã duyệt",
  rejected: "Không hợp lệ",
} as const satisfies Record<DocumentStatus, string>;

export type ApplicationStatusLabel =
  (typeof APPLICATION_STATUS)[ApplicationStatus];

/**
 * Khi API trả `requiresReview: true` — khác với trạng thái `under_review`
 * ({@link APPLICATION_STATUS.under_review}).
 */
export const APPLICATION_REQUIRES_REVIEW_LABEL = "Cần xem xét" as const;
export type ApplicationRequiresReviewLabel =
  typeof APPLICATION_REQUIRES_REVIEW_LABEL;

/** Nhãn gộp preset `pending` (nháp + đã nộp) — dashboard & danh sách officer. */
export const APPLICATION_PENDING_PRESET_COMBO_LABEL =
  `${APPLICATION_STATUS.draft} + ${APPLICATION_STATUS.submitted}` as const;

/** Nhãn gộp preset `need_action` (chờ xét duyệt + cờ cần xem xét). */
export const APPLICATION_NEED_ACTION_PRESET_COMBO_LABEL =
  `${APPLICATION_STATUS.under_review} + ${APPLICATION_REQUIRES_REVIEW_LABEL}` as const;
