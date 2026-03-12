import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Divider,
  Empty,
  Spin,
  Tag,
  Tooltip,
  Typography,
  message,
  Popconfirm,
} from "antd";
import {
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Eye,
  FileCheck,
  FileText,
  Hash,
  Loader2,
  MapPin,
  PlusCircle,
  SendHorizonal,
  XCircle,
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { applicantMenu } from "../applicant/applicantMenu";
import { fetchMyApplications, submitApplicationFinal } from "../../api/applications";
import type { Application, ApplicationStatus } from "../../types/application";

const { Title, Text } = Typography;

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  draft:        { label: "Bản nháp",        color: "default"    },
  submitted:    { label: "Đã nộp",          color: "blue"       },
  under_review: { label: "Đang xét duyệt",  color: "processing" },
  approved:     { label: "Đã chấp nhận",    color: "success"    },
  rejected:     { label: "Từ chối",         color: "error"      },
};

// ─── Pipeline helpers ─────────────────────────────────────────────────────────

type AgentStage = "completed" | "processing" | "pending" | "waiting";

interface PipelineStep {
  label: string;
  subLabel: string;
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

  const subLabels: Record<AgentStage, string> = {
    completed:  "Hoàn thành",
    processing: "Đang xử lý AI…",
    pending:    "Chờ xử lý",
    waiting:    "Chờ",
  };

  const defs = [
    { label: "Agent Tiếp nhận", Icon: Bot },
    { label: "Agent Xác minh",  Icon: FileCheck },
    { label: "Agent Đánh giá",  Icon: ClipboardCheck },
  ];

  return defs.map((d, i) => ({
    ...d,
    stage: stages[i],
    subLabel: subLabels[stages[i]],
  }));
}

function pipelineProgress(status: ApplicationStatus): number {
  return { draft: 0, submitted: 33, under_review: 33, approved: 100, rejected: 66 }[status] ?? 0;
}

// ─── Stage cell ───────────────────────────────────────────────────────────────

function StageCell({ step }: { step: PipelineStep }) {
  type Cfg = { bg: string; border: string; ring: string; text: string };
  const cfgMap: Record<AgentStage, Cfg> = {
    completed:  { bg: "bg-green-50",  border: "border-green-200",  ring: "text-green-500",  text: "text-green-700"  },
    processing: { bg: "bg-purple-50", border: "border-purple-200", ring: "text-purple-500", text: "text-purple-700" },
    pending:    { bg: "bg-gray-50",   border: "border-gray-200",   ring: "text-gray-400",   text: "text-gray-500"   },
    waiting:    { bg: "bg-gray-50",   border: "border-gray-100",   ring: "text-gray-300",   text: "text-gray-400"   },
  };
  const c = cfgMap[step.stage];

  const StatusIcon =
    step.stage === "completed"  ? CheckCircle2 :
    step.stage === "processing" ? Loader2 :
    Clock;

  return (
    <div className={`flex-1 min-w-0 rounded-xl border p-3 flex flex-col gap-1 ${c.bg} ${c.border}`}>
      <div className={`flex items-center gap-1.5 ${c.ring}`}>
        <StatusIcon
          size={16}
          className={step.stage === "processing" ? "animate-spin" : ""}
        />
        <step.Icon size={16} className="opacity-70" />
      </div>
      <Text className={`text-xs font-semibold leading-tight ${c.text}`}>
        {step.label}
      </Text>
      <Text className={`text-[11px] leading-tight ${c.text} opacity-75`}>
        {step.subLabel}
      </Text>
    </div>
  );
}

// ─── Meta item ────────────────────────────────────────────────────────────────

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Tooltip title={label}>
      <div className="flex items-center gap-1.5 text-gray-500">
        <Icon size={13} className="shrink-0 text-gray-400" />
        <Text className="text-xs text-gray-600 truncate">{value || "—"}</Text>
      </div>
    </Tooltip>
  );
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function relativeTime(iso: string) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  const d = Math.floor(diff / 86_400_000);
  if (h < 1)  return "vừa xong";
  if (h < 24) return `${h} giờ trước`;
  if (d < 30) return `${d} ngày trước`;
  return formatDate(iso);
}

// ─── Application card ─────────────────────────────────────────────────────────

function ApplicationCard({
  app,
  onSubmitFinal,
  submittingId,
}: {
  app: Application;
  onSubmitFinal: (app: Application) => void;
  submittingId: number | null;
}) {
  const navigate = useNavigate();
  const pipeline = getPipeline(app.status);
  const progress = pipelineProgress(app.status);
  const sc = statusConfig[app.status];
  const isAiProcessing = app.status === "under_review" || app.status === "submitted";
  const canSubmitFinal = app.status === "draft";
  const isSubmitting = submittingId === app.applicationId;

  return (
    <Card
      className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
      styles={{ body: { padding: "20px 24px" } }}
    >
      {/* ── Top row ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-2 min-w-0">
          {/* Program name + badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Text className="text-base font-bold text-gray-800 leading-tight">
              {app.programName || "—"}
            </Text>
            <Tag color={sc.color} className="text-xs shrink-0">
              {sc.label}
            </Tag>
            {isAiProcessing && (
              <Tag
                color="purple"
                className="text-xs shrink-0 flex items-center gap-1"
              >
                <Bot size={11} className="inline" /> AI đang xử lý
              </Tag>
            )}
          </div>

          {/* Meta grid */}
          <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-0.5">
            <MetaItem icon={FileText}     label="Loại xét tuyển" value={app.admissionTypeName} />
            <MetaItem icon={CalendarDays} label="Năm tuyển sinh" value={app.enrollmentYear}    />
            <MetaItem icon={MapPin}       label="Cơ sở"          value={app.campusName}        />
          </div>

          {/* Application ID + dates */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5">
            <div className="flex items-center gap-1 text-gray-400">
              <Hash size={12} />
              <Text className="text-[11px] text-gray-400">
                Mã đơn: <span className="font-mono text-gray-500">{app.applicationId}</span>
              </Text>
            </div>
            {app.submittedAt && (
              <Text className="text-[11px] text-gray-400">
                Nộp: {formatDate(app.submittedAt)}
              </Text>
            )}
            {app.lastUpdated && (
              <Text className="text-[11px] text-gray-400">
                Cập nhật: {relativeTime(app.lastUpdated)}
              </Text>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {canSubmitFinal && (
            <Popconfirm
              title="Xác nhận nộp đơn đăng ký"
              description={
                <span className="text-xs text-gray-500">
                  Sau khi nộp, đơn sẽ được gửi đến hệ thống xét duyệt.<br />
                  Bạn sẽ không thể chỉnh sửa sau khi xác nhận.
                </span>
              }
              okText="Xác nhận nộp"
              cancelText="Hủy"
              okButtonProps={{ className: "!bg-green-600 !border-green-600" }}
              onConfirm={() => onSubmitFinal(app)}
            >
              <Button
                icon={<SendHorizonal size={14} />}
                loading={isSubmitting}
                className="!rounded-xl !border-green-400 !text-green-600 hover:!bg-green-50"
              >
                Nộp đơn
              </Button>
            </Popconfirm>
          )}

          <Button
            type="primary"
            icon={<Eye size={14} />}
            className="!rounded-xl !bg-orange-500 !border-orange-500 hover:!bg-orange-600"
            onClick={() => navigate(`/applicant/applications/${app.applicationId}`)}
          >
            Xem chi tiết
          </Button>
        </div>
      </div>

      <Divider className="!my-4" />

      {/* ── Pipeline ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Quy trình xử lý đa tác nhân
          </Text>
          <Text className="text-xs text-gray-400 font-medium">
            {progress}% hoàn thành
          </Text>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full rounded-full bg-orange-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex gap-2">
          {pipeline.map((step) => (
            <StageCell key={step.label} step={step} />
          ))}
        </div>
      </div>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ApplicationList() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  function loadApps() {
    setLoading(true);
    fetchMyApplications()
      .then((appList) => setApps(appList ?? []))
      .catch(() => setError("Không thể tải danh sách đơn đăng ký."))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadApps(); }, []);

  async function handleSubmitFinal(app: Application) {
    setSubmittingId(app.applicationId);
    try {
      await submitApplicationFinal(Number(app.applicationId));
      messageApi.success(`Nộp đơn đăng ký "${app.programName}" thành công!`);
      loadApps();
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { message?: string; errors?: string[] } } }).response?.data;
      const msg =
        errData?.message ||
        (errData?.errors?.length ? errData.errors.join("; ") : null) ||
        "Nộp đơn thất bại. Vui lòng thử lại.";
      messageApi.error(msg);
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <DashboardLayout menuItems={applicantMenu}>
      {contextHolder}
      {/* ── Page header ── */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <Title level={4} className="!mb-1 !text-gray-800 !font-bold">
            Đơn đăng ký của tôi
          </Title>
          <Text className="text-sm text-gray-500">
            Xem và quản lý tất cả các đơn đăng ký của bạn
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusCircle size={15} />}
          className="!rounded-xl !bg-orange-500 !border-orange-500 hover:!bg-orange-600"
          onClick={() => navigate("/applicant/submit-application")}
        >
          Đơn đăng ký mới
        </Button>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Card className="rounded-2xl border border-red-100 shadow-sm">
          <div className="flex flex-col items-center gap-3 py-12">
            <XCircle size={40} className="text-red-400" />
            <Text className="text-gray-500">{error}</Text>
            <Button onClick={() => window.location.reload()}>Thử lại</Button>
          </div>
        </Card>
      ) : apps.length === 0 ? (
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Text className="text-gray-400 text-sm">
                Bạn chưa có đơn đăng ký nào.
              </Text>
            }
            className="py-12"
          >
            <Button
              type="primary"
              className="!rounded-xl !bg-orange-500 !border-orange-500"
              onClick={() => navigate("/applicant/submit-application")}
            >
              Tạo đơn đăng ký đầu tiên
            </Button>
          </Empty>
        </Card>
      ) : (
        <>
          {/* Summary count */}
          <Text className="text-sm text-gray-400 mb-3 block">
            {apps.length} đơn đăng ký
          </Text>
          <div className="flex flex-col gap-4">
            {apps.map((app) => (
              <ApplicationCard
                key={app.applicationId}
                app={app}
                onSubmitFinal={handleSubmitFinal}
                submittingId={submittingId}
              />
            ))}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
