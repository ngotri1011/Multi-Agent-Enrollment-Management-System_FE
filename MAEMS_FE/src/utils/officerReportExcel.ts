import * as XLSX from "xlsx";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import type { Application } from "../types/application";
import {
  APPLICATION_REQUIRES_REVIEW_LABEL,
  APPLICATION_STATUS,
} from "../types/application";
import type { ApplicationStatus } from "../types/enums";

dayjs.extend(isoWeek);

/** Lọc & gom nhóm theo thời gian đều dựa trên `submittedAt` (có ngay khi tạo đơn, kể cả nháp). */
function submittedAtAsDate(a: Application): Date | null {
  const raw = a.submittedAt;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function inDateRange(
  a: Application,
  start: dayjs.Dayjs | null,
  end: dayjs.Dayjs | null,
): boolean {
  if (!start && !end) return true;
  const d = submittedAtAsDate(a);
  if (!d) return false;
  const x = dayjs(d);
  if (start && x.isBefore(start.startOf("day"))) return false;
  if (end && x.isAfter(end.endOf("day"))) return false;
  return true;
}

export type OfficerReportExportFilter = {
  /** Khoảng ngày so với `submittedAt`. */
  dateFrom?: dayjs.Dayjs | null;
  dateTo?: dayjs.Dayjs | null;
};

export function filterApplicationsForReport(
  items: Application[],
  f: OfficerReportExportFilter,
): Application[] {
  return items.filter((a) =>
    inDateRange(a, f.dateFrom ?? null, f.dateTo ?? null),
  );
}

function rowFromApp(a: Application) {
  return {
    "Mã đơn": a.applicationId,
    "Thí sinh": a.applicantName,
    "Ngành": a.programName,
    "Cơ sở": a.campusName,
    "Loại TS": a.admissionTypeName,
    "Trạng thái": APPLICATION_STATUS[a.status],
    "Cần xem xét":
      a.requiresReview ? "Có" : "Không",
    "Ngày nộp": a.submittedAt
      ? dayjs(a.submittedAt).format("YYYY-MM-DD HH:mm")
      : "",
    "Cập nhật": a.lastUpdated
      ? dayjs(a.lastUpdated).format("YYYY-MM-DD HH:mm")
      : "",
    "CB phụ trách": a.assignedOfficerName ?? "",
    "Mã CB": a.assignedOfficerId ?? "",
    "Ghi chú": a.notes ?? "",
  };
}

function countBy<K extends string>(
  items: Application[],
  keyFn: (a: Application) => K,
): { key: K; count: number }[] {
  const m = new Map<K, number>();
  for (const a of items) {
    const k = keyFn(a);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()]
    .map(([key, count]) => ({ key, count }))
    .sort((x, y) => y.count - x.count || x.key.localeCompare(y.key));
}

const ALL_STATUSES: ApplicationStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "document_required",
];

/** Gom workbook: chi tiết + tổng hợp theo trạng thái, requiresReview, tháng, tuần ISO, 7 ngày gần nhất. */
export function buildOfficerApplicationsWorkbook(
  items: Application[],
  meta: { scopeLabel: string },
): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  const detail = items.map(rowFromApp);
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(detail),
    "Chi tiết",
  );

  const byStatus = ALL_STATUSES.map((st) => ({
    "Trạng thái": APPLICATION_STATUS[st],
    "Số lượng": items.filter((a) => a.status === st).length,
  }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(byStatus),
    "Theo trạng thái",
  );

  const byReview = [
    {
      Nhóm: APPLICATION_REQUIRES_REVIEW_LABEL,
      "Số lượng": items.filter((a) => a.requiresReview).length,
    },
    { Nhóm: "Không cần xem xét", "Số lượng": items.filter((a) => !a.requiresReview).length },
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(byReview),
    "Cần xem xét",
  );

  const monthBuckets = countBy(items, (a) => {
    const d = submittedAtAsDate(a);
    return d ? dayjs(d).format("YYYY-MM") : "Không xác định";
  }).map((x) => ({ Tháng: x.key, "Số lượng": x.count }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(monthBuckets),
    "Theo tháng",
  );

  const weekBuckets = countBy(items, (a) => {
    const d = submittedAtAsDate(a);
    if (!d) return "Không xác định";
    const dj = dayjs(d);
    return `${dj.isoWeekYear()}-W${String(dj.isoWeek()).padStart(2, "0")}`;
  }).map((x) => ({ "Tuần ISO": x.key, "Số lượng": x.count }));
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(weekBuckets),
    "Theo tuần ISO",
  );

  const today = dayjs().startOf("day");
  const last7 = Array.from({ length: 7 }, (_, i) =>
    today.subtract(6 - i, "day"),
  );
  const byDay = last7.map((day) => {
    const label = day.format("YYYY-MM-DD");
    const n = items.filter((a) => {
      const d = submittedAtAsDate(a);
      return d && dayjs(d).format("YYYY-MM-DD") === label;
    }).length;
    return { Ngày: label, "Số lượng": n };
  });
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(byDay),
    "7 ngày gần nhất",
  );

  const summary = [
    { "Phạm vi": meta.scopeLabel, "Số đơn": items.length },
    ...byStatus.map((r) => ({
      "Phạm vi": `  ${r["Trạng thái"]}`,
      "Số đơn": r["Số lượng"],
    })),
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(summary),
    "Tóm tắt",
  );

  return wb;
}

export function downloadOfficerApplicationsWorkbook(
  items: Application[],
  meta: { scopeLabel: string; fileStem: string },
) {
  const wb = buildOfficerApplicationsWorkbook(items, meta);
  const name = `${meta.fileStem}_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`;
  XLSX.writeFile(wb, name);
}
