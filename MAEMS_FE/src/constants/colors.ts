import type { ApplicationStatus } from "../types/enums";

/** Màu slice pie / thống kê — cùng bảng màu Tailwind với {@link APPLICATION_STATUS_CARD_TW}. */
export const APPLICATION_STATUS_HEX: Record<ApplicationStatus, string> = {
  draft: "#cbd5e1",
  submitted: "#f59e0b",
  under_review: "#7c3aed",
  approved: "#10b981",
  rejected: "#ef4444",
  document_required: "#f97316",
};

/** Lớp Tailwind thẻ dashboard (cùng tông với APPLICATION_STATUS_HEX). */
export const APPLICATION_STATUS_CARD_TW: Record<
  ApplicationStatus,
  { bg: string; iconColor: string; border: string }
> = {
  draft: {
    bg: "bg-slate-100",
    iconColor: "text-slate-500",
    border: "border-slate-200",
  },
  submitted: {
    bg: "bg-amber-50",
    iconColor: "text-amber-500",
    border: "border-amber-100",
  },
  under_review: {
    bg: "bg-violet-50",
    iconColor: "text-violet-600",
    border: "border-violet-100",
  },
  approved: {
    bg: "bg-emerald-50",
    iconColor: "text-emerald-500",
    border: "border-emerald-100",
  },
  rejected: {
    bg: "bg-red-50",
    iconColor: "text-red-500",
    border: "border-red-100",
  },
  document_required: {
    bg: "bg-orange-50",
    iconColor: "text-orange-600",
    border: "border-orange-100",
  },
};

export const PRIMARY_THEME_COLOR = "#ff6900";