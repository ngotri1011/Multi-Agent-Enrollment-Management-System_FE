import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Card,
  Spin,
  Tag,
  Typography,
  Divider,
  Tooltip,
  Badge,
} from "antd";
import {
  ArrowLeft,
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Download,
  ExternalLink,
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
import { DashboardLayout } from "../../components/DashboardLayout";
import { applicantMenu } from "../applicant/applicantMenu";
import { fetchMyApplicationDetail } from "../../api/application";
import type { Application, ApplicationStatus, Document } from "../../types/application";

const { Title, Text } = Typography;

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  draft:        { label: "Bản nháp",       color: "default"    },
  submitted:    { label: "Đã nộp",         color: "blue"       },
  under_review: { label: "Đang xét duyệt", color: "processing" },
  approved:     { label: "Đã chấp nhận",   color: "success"    },
  rejected:     { label: "Từ chối",        color: "error"      },
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
  return { draft: 0, submitted: 33, under_review: 33, approved: 100, rejected: 66 }[status] ?? 0;
}

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

// ─── Document row ─────────────────────────────────────────────────────────────

function VerificationBadge({ result }: { result: string }) {
  if (!result) return <Tag color="default">Chưa xác minh</Tag>;
  const r = result.toLowerCase();
  if (r === "pass" || r === "passed" || r === "verified")
    return (
      <Tag
        color="success"
        icon={<ShieldCheck size={11} className="inline mr-1" />}
      >
        Đã xác minh
      </Tag>
    );
  if (r === "fail" || r === "failed" || r === "rejected")
    return (
      <Tag
        color="error"
        icon={<ShieldX size={11} className="inline mr-1" />}
      >
        Không hợp lệ
      </Tag>
    );
  return <Tag color="processing">{result}</Tag>;
}

function DocumentRow({ doc, index }: { doc: Document; index: number }) {
  const ext = doc.fileFormat?.toUpperCase() || doc.fileName?.split(".").pop()?.toUpperCase() || "—";

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
        <Paperclip size={16} className="text-blue-500" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Text className="text-sm font-medium text-gray-700 truncate">
            {doc.fileName || `Tài liệu ${index + 1}`}
          </Text>
          <Tag className="text-[10px] shrink-0">{ext}</Tag>
          <VerificationBadge result={doc.verificationResult} />
        </div>
        <Text className="text-xs text-gray-400 block mt-0.5">
          {doc.documentType || "—"}
          {doc.uploadedAt && (
            <> &nbsp;·&nbsp; Tải lên: {formatDateShort(doc.uploadedAt)}</>
          )}
        </Text>
        {doc.verificationDetails && (
          <Text className="text-xs text-gray-500 block mt-1 italic">
            {doc.verificationDetails}
          </Text>
        )}
      </div>

      {/* Actions */}
      {doc.filePath && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Tooltip title="Xem tài liệu">
            <Button
              size="small"
              type="text"
              icon={<ExternalLink size={14} />}
              href={doc.filePath}
              target="_blank"
            />
          </Tooltip>
          <Tooltip title="Tải về">
            <Button
              size="small"
              type="text"
              icon={<Download size={14} />}
              href={doc.filePath}
              download
            />
          </Tooltip>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchMyApplicationDetail(Number(id))
      .then(setApp)
      .catch(() => setError("Không thể tải chi tiết đơn đăng ký."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <DashboardLayout menuItems={applicantMenu}>
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
              <PipelineCard status={app.status} />

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
                  <div className="flex flex-col">
                    {app.documents.map((doc, i) => (
                      <DocumentRow key={doc.documentId} doc={doc} index={i} />
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
