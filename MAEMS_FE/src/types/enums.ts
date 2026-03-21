// ─── Application ─────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'approved'
  | 'rejected'
  | 'under_review'
  | 'document_required';

// ─── Document ─────────────────────────────────────────────────────────────────

export type DocumentStatus =
  | 'pending'
  | 'verified'
  | 'rejected';

// ─── Auth / Role ──────────────────────────────────────────────────────────────

export type AuthRole =
  | 'admin'
  | 'officer'
  | 'qa'
  | 'applicant';
