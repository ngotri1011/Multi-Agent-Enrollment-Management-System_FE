// ─── Application (mã trạng thái API) ────────────────────────────────────────

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "document_required";

// ─── Document ─────────────────────────────────────────────────────────────────

export type DocumentStatus = "pending" | "verified" | "rejected";

// ─── Auth / Role ──────────────────────────────────────────────────────────────

export type AuthRole = "admin" | "officer" | "qa" | "applicant";

// ─── Article ──────────────────────────────────────────────────────────────────

export type ArticleStatus = "draft" | "publish" | "deleted";

// ─── Payment ──────────────────────────────────────────────────────────────────
export type PaymentStatus =
  | "pending"
  | "outdated"
  | "processing"
  | "paid"
  | "need_checking";
