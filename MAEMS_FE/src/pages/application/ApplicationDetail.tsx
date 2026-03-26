import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Spin,
  Tag,
  Typography,
  Divider,
  Badge,
  Modal,
} from "antd";
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Hash,
  Loader2,
  MapPin,
  Paperclip,
  ShieldCheck,
  ShieldX,
  User,
  XCircle,
} from "lucide-react";
import { ApplicantLayout } from "../../components/layouts/ApplicantLayout";
import { ApplicantMenu } from "../applicant/ApplicantMenu";
import { fetchApplicationDetail } from "../../api/applications";
import type { Application, ApplicationStatus, Document } from "../../types/application";
import type { DocumentStatus } from "../../types/enums";

const { Title, Text } = Typography;

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  draft:        { label: "Bản nháp",       color: "default"    },
  submitted:    { label: "Đã nộp",         color: "blue"       },
  under_review: { label: "Chờ NV xét duyệt", color: "processing" },
  approved:     { label: "Đã chấp nhận",   color: "success"    },
  rejected:     { label: "Từ chối",        color: "error"      },
  document_required: { label: "Cần bổ sung tài liệu", color: "warning" },
};

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Pipeline ─────────────────────────────────────────────────────────────────

type AgentStage = "completed" | "processing" | "pending" | "waiting";

interface PipelineStep {
  label: string;
  description: string;
  Icon: React.ElementType;
  stage: AgentStage;
}

function getPipeline(status: ApplicationStatus): PipelineStep[] {
  const stageMap: Record<ApplicationStatus, AgentStage[]> = {
    draft:        ["waiting",   "waiting",    "waiting"],
    submitted:    ["completed", "pending",    "waiting"],
    under_review: ["completed", "processing", "waiting"],
    approved:     ["completed", "completed",  "completed"],
    rejected:     ["completed", "completed",  "waiting"],
    document_required: ["completed", "completed", "pending"],
  };
  const stages = stageMap[status] ?? ["waiting", "waiting", "waiting"];

  const defs: { label: string; description: string; Icon: React.ElementType }[] = [
    { label: "Agent Tiếp nhận",  description: "Kiểm tra tính đầy đủ của hồ sơ", Icon: Bot          },
    { label: "Agent Xác minh",   description: "Xác minh tài liệu & điều kiện",  Icon: FileCheck     },
    { label: "Agent Đánh giá",   description: "Đánh giá và ra quyết định",       Icon: ClipboardCheck },
  ];

  const subLabels: Record<AgentStage, string> = {
    completed:  "Hoàn thành",
    processing: "Đang xử lý AI…",
    pending:    "Chờ xử lý",
    waiting:    "Chờ",
  };

  return defs.map((d, i) => ({
    ...d,
    stage: stages[i],
    subLabel: subLabels[stages[i]],
  })) as PipelineStep[];
}

function pipelineProgress(status: ApplicationStatus): number {
  return {
    draft: 0,
    submitted: 33,
    under_review: 33,
    approved: 100,
    rejected: 66,
    document_required: 66,
  }[status] ?? 0;
}

// Temporarily hide pipeline/progress UI but keep code for later enabling.
const SHOW_PIPELINE_PROGRESS_UI = false;

function PipelineCard({ status }: { status: ApplicationStatus }) {
  const pipeline = getPipeline(status);
  const progress = pipelineProgress(status);

  type Cfg = { bg: string; border: string; ring: string; text: string; sub: string };
  const cfgMap: Record<AgentStage, Cfg> = {
    completed:  { bg: "bg-green-50",  border: "border-green-200",  ring: "text-green-500",  text: "text-green-700",  sub: "text-green-600"  },
    processing: { bg: "bg-purple-50", border: "border-purple-200", ring: "text-purple-500", text: "text-purple-700", sub: "text-purple-500" },
    pending:    { bg: "bg-gray-50",   border: "border-gray-200",   ring: "text-gray-400",   text: "text-gray-600",   sub: "text-gray-400"   },
    waiting:    { bg: "bg-gray-50",   border: "border-gray-100",   ring: "text-gray-300",   text: "text-gray-400",   sub: "text-gray-300"   },
  };

  return (
    <Card
      className="rounded-2xl border border-gray-100 shadow-sm"
      styles={{ body: { padding: "20px 24px" } }}
    >
      <div className="flex items-center justify-between mb-4">
        <Text className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
          Quy trình xử lý đa tác nhân
        </Text>
        <Text className="text-sm font-medium text-gray-500">{progress}% hoàn thành</Text>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full mb-5 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="flex gap-3">
        {pipeline.map((step, idx) => {
          const c = cfgMap[step.stage];
          const StatusIcon =
            step.stage === "completed"  ? CheckCircle2 :
            step.stage === "processing" ? Loader2 :
            Clock;
          return (
            <div
              key={step.label}
              className={`flex-1 min-w-0 rounded-xl border p-4 flex flex-col gap-2 ${c.bg} ${c.border}`}
            >
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 ${c.ring}`}>
                  <StatusIcon
                    size={16}
                    className={step.stage === "processing" ? "animate-spin" : ""}
                  />
                  <step.Icon size={16} className="opacity-70" />
                </div>
                <Text className="text-xs text-gray-400">{idx + 1}</Text>
              </div>
              <Text className={`text-sm font-semibold leading-tight ${c.text}`}>
                {step.label}
              </Text>
              <Text className={`text-xs leading-tight ${c.sub}`}>
                {step.description}
              </Text>
              <div className={`mt-1 inline-flex items-center gap-1 ${c.ring}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  step.stage === "completed"  ? "bg-green-500"  :
                  step.stage === "processing" ? "bg-purple-500" :
                  "bg-gray-300"
                }`} />
                <Text className={`text-[11px] font-medium ${c.sub}`}>
                  {step.stage === "completed"  ? "Hoàn thành"       :
                   step.stage === "processing" ? "Đang xử lý AI…"   :
                   step.stage === "pending"    ? "Chờ xử lý"         :
                   "Chờ"}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-indigo-500" />
      </div>
      <div className="flex-1 min-w-0">
        <Text className="text-xs text-gray-400 block">{label}</Text>
        <Text className="text-sm text-gray-700 font-medium">{value || "—"}</Text>
      </div>
    </div>
  );
}

// ─── Document verification (DocumentStatus từ enums) ───────────────────────────

const DOCUMENT_VERIFICATION: Record<
  DocumentStatus,
  { label: string; color: "default" | "success" | "error" | "warning" | "processing" }
> = {
  pending:   { label: "Chờ xác minh",  color: "warning" },
  verified:  { label: "Đã xác minh",  color: "success" },
  rejected:  { label: "Không hợp lệ", color: "error" },
};

function normalizeDocumentStatus(
  raw: DocumentStatus | string | null | undefined,
): DocumentStatus | null {
  if (raw == null || raw === "") return null;
  const r = String(raw).toLowerCase().trim();
  if (r === "pending") return "pending";
  if (r === "verified") return "verified";
  if (r === "rejected") return "rejected";
  return null;
}

function VerificationBadge({ result }: { result: DocumentStatus | string | null | undefined }) {
  const status = normalizeDocumentStatus(result);
  if (!status) {
    if (result == null || result === "")
      return <Tag color="default">Chưa xác minh</Tag>;
    return <Tag color="default">{String(result)}</Tag>;
  }
  const cfg = DOCUMENT_VERIFICATION[status];
  const icon =
    status === "verified" ? (
      <ShieldCheck size={11} className="inline mr-1" />
    ) : status === "rejected" ? (
      <ShieldX size={11} className="inline mr-1" />
    ) : undefined;

  return (
    <Tag color={cfg.color} icon={icon}>
      {cfg.label}
    </Tag>
  );
}

function isImageFile(fileFormat?: string) {
  const normalized = (fileFormat || "").toLowerCase().trim();
  return ["png", "jpg", "jpeg", "webp", "gif", "bmp", "svg"].some((ext) =>
    normalized === ext
    || normalized === `.${ext}`
    || normalized.includes(`image/${ext}`)
    || normalized.includes(ext),
  );
}

function isImageDocument(doc: Document) {
  if (isImageFile(doc.fileFormat)) return true;
  const path = (doc.filePath || "").toLowerCase();
  return [".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".svg"].some((ext) =>
    path.includes(ext),
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [previewDetailExpanded, setPreviewDetailExpanded] = useState(false);

  useEffect(() => {
      if (!id) return;
      fetchApplicationDetail(Number(id))
      .then(setApp)
      .catch(() => setError("Không thể tải chi tiết đơn đăng ký."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <ApplicantLayout menuItems={ApplicantMenu}>
      {/* Back */}
      <Button
        type="text"
        icon={<ArrowLeft size={16} />}
        className="!text-gray-500 hover:!text-gray-800 !px-0 mb-4"
        onClick={() => navigate("/applicant/applications")}
      >
        Quay lại danh sách
      </Button>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Spin size="large" />
        </div>
      ) : error || !app ? (
        <Card className="rounded-2xl border border-red-100 shadow-sm">
          <div className="flex flex-col items-center gap-3 py-12">
            <XCircle size={40} className="text-red-400" />
            <Text className="text-gray-500">{error ?? "Không tìm thấy đơn đăng ký."}</Text>
            <Button onClick={() => navigate("/applicant/applications")}>
              Quay lại danh sách
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {/* ── Header card ── */}
          <Card
            className="rounded-2xl border border-gray-100 shadow-sm"
            styles={{ body: { padding: "20px 24px" } }}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Title level={4} className="!mb-0 !text-gray-800 !font-bold">
                    {app.programName}
                  </Title>
                  <Tag color={statusConfig[app.status].color} className="text-xs">
                    {statusConfig[app.status].label}
                  </Tag>
                  {(app.status === "under_review" || app.status === "submitted") && (
                    <Tag color="purple" className="text-xs flex items-center gap-1">
                      <Bot size={11} className="inline" /> AI đang xử lý
                    </Tag>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Hash size={13} />
                  <Text className="text-xs font-mono text-gray-500">
                    {app.applicationId}
                  </Text>
                </div>
              </div>

              {/* Timestamps */}
              <div className="text-right flex flex-col gap-1">
                {app.submittedAt && (
                  <Text className="text-xs text-gray-400">
                    Nộp ngày: <span className="text-gray-600">{formatDate(app.submittedAt)}</span>
                  </Text>
                )}
                {app.lastUpdated && (
                  <Text className="text-xs text-gray-400">
                    Cập nhật: <span className="text-gray-600">{formatDate(app.lastUpdated)}</span>
                  </Text>
                )}
              </div>
            </div>
          </Card>

          {/* ── Two column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left: Info */}
            <Card
              className="rounded-2xl border border-gray-100 shadow-sm lg:col-span-1"
              styles={{ body: { padding: "20px 24px" } }}
            >
              <Text className="text-sm font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                Thông tin đơn đăng ký
              </Text>
              <Divider className="!my-3" />
              <InfoRow icon={User}         label="Họ và tên"         value={app.applicantName}    />
              <InfoRow icon={FileText}     label="Ngành đăng ký"     value={app.programName}      />
              <InfoRow icon={FileCheck}    label="Phương thức xét tuyển" value={app.admissionTypeName} />
              <InfoRow icon={CalendarDays} label="Năm tuyển sinh"    value={app.enrollmentYear}   />
              <InfoRow icon={MapPin}       label="Cơ sở"             value={app.campusName}       />
            </Card>

            {/* Right: Pipeline + Documents */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {SHOW_PIPELINE_PROGRESS_UI && <PipelineCard status={app.status} />}

              {/* Agent Notes */}
              {app.notes && (
                <Card
                  className="rounded-2xl border border-indigo-100 shadow-sm"
                  styles={{ body: { padding: "20px 24px" } }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Bot size={15} className="text-indigo-500" />
                    <Text className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                      Agent Notes
                    </Text>
                  </div>
                  <Divider className="!my-3" />
                  <Text className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {app.notes}
                  </Text>
                </Card>
              )}

              {/* Documents */}
              <Card
                className="rounded-2xl border border-gray-100 shadow-sm"
                styles={{ body: { padding: "20px 24px" } }}
              >
                <div className="flex items-center justify-between mb-1">
                  <Text className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Tài liệu đính kèm
                  </Text>
                  <Badge
                    count={app.documents?.length ?? 0}
                    color="#6366f1"
                    showZero
                  />
                </div>
                <Divider className="!my-3" />

                {!app.documents || app.documents.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <Paperclip size={32} className="text-gray-200" />
                    <Text className="text-gray-400 text-sm">Chưa có tài liệu nào được đính kèm.</Text>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {app.documents.map((doc: Document) => {
                      const isImage = isImageDocument(doc);
                      const fileUrl = doc.filePath;
                      return (
                        <div
                          key={doc.documentId}
                          className="group rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all overflow-hidden cursor-pointer"
                          onClick={() => setPreviewDoc(doc)}
                        >
                          <div className="relative h-52 bg-gray-50 border-b border-gray-100 overflow-hidden">
                            {isImage && fileUrl && (
                              <img
                                src={fileUrl}
                                alt={doc.fileName || doc.documentType}
                                className="w-full h-full object-contain bg-white"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).style.display = "none";
                                  const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                                  if (fb) fb.style.display = "flex";
                                }}
                              />
                            )}
                            <div
                              className="absolute inset-0 items-center justify-center flex-col gap-1"
                              style={{ display: isImage && fileUrl ? "none" : "flex" }}
                            >
                              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
                                <FileText size={28} className="text-indigo-400" />
                              </div>
                              <span className="text-xs text-gray-400 uppercase mt-1">
                                {doc.fileFormat || "file"}
                              </span>
                            </div>
                            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye size={20} className="text-white" />
                            </div>
                          </div>

                          <div className="p-3">
                            <div className="flex items-start justify-between gap-2">
                              <Text className="font-medium text-gray-700 text-sm block truncate">
                                {doc.fileName || doc.documentType}
                              </Text>
                              {fileUrl && (
                                <Button
                                  size="small"
                                  type="link"
                                  icon={<ExternalLink size={13} />}
                                  href={fileUrl}
                                  target="_blank"
                                  className="!p-0 flex-shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Tag className="!text-xs !m-0 !px-1.5">
                                {doc.documentType}
                              </Tag>
                              <Text className="text-xs text-gray-400">
                                {doc.fileFormat?.toUpperCase()}
                              </Text>
                              <Text className="text-xs text-gray-300">
                                {doc.uploadedAt
                                  ? formatDateShort(doc.uploadedAt)
                                  : ""}
                              </Text>
                            </div>
                            <div className="mt-2">
                              <VerificationBadge result={doc.verificationResult} />
                            </div>
                            {doc.verificationDetails && (
                              <Text className="text-xs text-gray-500 block mt-1 italic line-clamp-2">
                                {doc.verificationDetails}
                              </Text>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={!!previewDoc}
        onCancel={() => {
          setPreviewDoc(null);
          setPreviewDetailExpanded(false);
        }}
        footer={null}
        destroyOnClose
        width={720}
        title={
          previewDoc && (
            <div className="flex items-center gap-2 pr-4">
              <FileText size={16} className="text-indigo-500 shrink-0" />
              <span className="text-sm font-semibold text-gray-800 truncate">
                {previewDoc.fileName || previewDoc.documentType || "Tài liệu"}
              </span>
            </div>
          )
        }
      >
        {previewDoc && (
          <div className="flex flex-col gap-4 pt-2">
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center h-[50vh] sm:h-[55vh] md:h-[60vh] max-h-[640px] min-h-[240px]">
              {isImageDocument(previewDoc) ? (
                <img
                  src={previewDoc.filePath}
                  alt={previewDoc.fileName}
                  className="block w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={previewDoc.filePath}
                  title={previewDoc.fileName}
                  className="w-full h-full border-0"
                />
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <Text className="!text-xs !text-gray-400 block">Loại tài liệu</Text>
                <Text className="!text-sm !text-gray-700 !font-medium">
                  {previewDoc.documentType || "—"}
                </Text>
              </div>
              <div>
                <Text className="!text-xs !text-gray-400 block">Định dạng</Text>
                <Text className="!text-sm !text-gray-700 !font-medium uppercase">
                  {previewDoc.fileFormat || "—"}
                </Text>
              </div>
              <div>
                <Text className="!text-xs !text-gray-400 block">Ngày tải lên</Text>
                <Text className="!text-sm !text-gray-700 !font-medium">
                  {previewDoc.uploadedAt
                    ? new Date(previewDoc.uploadedAt).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                    : "—"}
                </Text>
              </div>
              <div>
                <Text className="!text-xs !text-gray-400 block">Xác minh</Text>
                <div className="mt-1">
                  <VerificationBadge result={previewDoc.verificationResult} />
                </div>
              </div>
              {previewDoc.verificationDetails && (
                <div className="col-span-2">
                  <button
                    type="button"
                    className="w-full flex items-center justify-between !text-xs text-gray-400 hover:text-gray-500"
                    onClick={() => setPreviewDetailExpanded((prev) => !prev)}
                  >
                    <span>Ghi chú duyệt</span>
                    {previewDetailExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <Text className={`!text-sm !text-gray-700 block ${previewDetailExpanded ? "" : "line-clamp-2"}`}>
                    {previewDoc.verificationDetails}
                  </Text>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <a href={previewDoc.filePath} download>
                <Button
                  icon={<Download size={14} />}
                  className="!rounded-lg !border-gray-200"
                >
                  Tải về
                </Button>
              </a>
              <a href={previewDoc.filePath} target="_blank" rel="noopener noreferrer">
                <Button
                  icon={<ExternalLink size={14} />}
                  className="!rounded-lg !border-indigo-200 !text-indigo-600 hover:!bg-indigo-50"
                >
                  Mở trong tab mới
                </Button>
              </a>
            </div>
          </div>
        )}
      </Modal>
    </ApplicantLayout>
  );
}
