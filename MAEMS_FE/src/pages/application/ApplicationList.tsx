import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Divider,
  Empty,
  Form,
  Modal,
  Select,
  Spin,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
  Popconfirm,
} from "antd";
import type { UploadFile } from "antd";
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
  Paperclip,
  PlusCircle,
  SendHorizonal,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { applicantMenu } from "../applicant/applicantMenu";
import { fetchMyApplications, fetchMyApplicationDetail, submitApplicationDocuments, submitApplicationFinal } from "../../api/application";
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

// ─── Document type options ────────────────────────────────────────────────────

const DOC_TYPE_OPTIONS = [
  { value: "CCCD_FRONT",    label: "CCCD/CMND mặt trước" },
  { value: "CCCD_BACK",     label: "CCCD/CMND mặt sau" },
  { value: "HOC_BA",        label: "Học bạ / Bảng điểm" },
  { value: "DGNL",          label: "Giấy chứng nhận ĐGNL" },
  { value: "THPT",          label: "Giấy chứng nhận tốt nghiệp THPT" },
  { value: "SCHOOL_RANK",   label: "Xác nhận xếp hạng SchoolRank" },
  { value: "UU_TIEN",       label: "Đơn ưu tiên xét tuyển" },
  { value: "BIEN_LAI",      label: "Biên lai nộp phí" },
  { value: "VAN_BANG",      label: "Văn bằng / Chứng chỉ" },
  { value: "KHAC",          label: "Tài liệu khác" },
];

// ─── Upload document modal ────────────────────────────────────────────────────

interface UploadDocModalProps {
  app: Application;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function UploadDocModal({ app, open, onClose, onSuccess }: UploadDocModalProps) {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  function handleClose() {
    form.resetFields();
    setFileList([]);
    onClose();
  }

  async function handleUpload() {
    let values: { documentType: string };
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    if (fileList.length === 0) {
      messageApi.warning("Vui lòng chọn file cần tải lên.");
      return;
    }

    const formData = new FormData();
    formData.append("documentType", values.documentType);
    const rawFile = fileList[0].originFileObj as File;
    formData.append("file", rawFile);

    setUploading(true);
    try {
      await submitApplicationDocuments(Number(app.applicationId), formData);
      messageApi.success("Tải lên tài liệu thành công!");
      if (isMounted.current) {
        handleClose();
        onSuccess();
      }
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { message?: string } } }).response?.data;
      messageApi.error(errData?.message ?? "Tải lên thất bại. Vui lòng thử lại.");
    } finally {
      if (isMounted.current) setUploading(false);
    }
  }

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-bold text-gray-800">Nộp tài liệu</span>
          <span className="text-xs text-gray-400 font-normal">
            {app.programName} &nbsp;·&nbsp; #{app.applicationId}
          </span>
        </div>
      }
      footer={null}
      destroyOnClose
      width={480}
    >
      {contextHolder}
      <Form form={form} layout="vertical" requiredMark={false} className="mt-4">
        <Form.Item
          name="documentType"
          label={<Text strong>Loại tài liệu</Text>}
          rules={[{ required: true, message: "Vui lòng chọn loại tài liệu" }]}
        >
          <Select
            placeholder="Chọn loại tài liệu"
            size="large"
            options={DOC_TYPE_OPTIONS}
          />
        </Form.Item>

        <Form.Item label={<Text strong>File tài liệu</Text>}>
          <Upload.Dragger
            accept="image/*,.pdf"
            maxCount={1}
            beforeUpload={() => false}
            fileList={fileList}
            onChange={({ fileList: fl }) => setFileList(fl)}
            className="!rounded-xl"
          >
            <div className="flex flex-col items-center gap-1.5 py-4">
              <UploadCloud size={28} className="text-gray-300" />
              <Text className="text-sm text-gray-500">
                Kéo thả file vào đây hoặc{" "}
                <span className="text-orange-500 font-medium">nhấn để chọn</span>
              </Text>
              <Text className="text-xs text-gray-400">JPG, PNG, PDF — tối đa 10 MB</Text>
            </div>
          </Upload.Dragger>
        </Form.Item>

        <div className="flex gap-2 justify-end mt-2">
          <Button onClick={handleClose} className="!rounded-xl">
            Hủy
          </Button>
          <Button
            type="primary"
            loading={uploading}
            onClick={handleUpload}
            icon={<UploadCloud size={14} />}
            className="!rounded-xl !bg-orange-500 !border-orange-500 hover:!bg-orange-600"
          >
            Tải lên
          </Button>
        </div>
      </Form>
    </Modal>
  );
}

// ─── Application card ─────────────────────────────────────────────────────────

function ApplicationCard({
  app,
  docCount,
  docCountLoading,
  onUploadDoc,
  onSubmitFinal,
  submittingId,
}: {
  app: Application;
  docCount: number;
  docCountLoading: boolean;
  onUploadDoc: (app: Application) => void;
  onSubmitFinal: (app: Application) => void;
  submittingId: string | null;
}) {
  const navigate = useNavigate();
  const pipeline = getPipeline(app.status);
  const progress = pipelineProgress(app.status);
  const sc = statusConfig[app.status];
  const isAiProcessing = app.status === "under_review" || app.status === "submitted";
  const canSubmitFinal = app.status === "draft";
  const hasDocuments = docCount > 0;
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
            <div className="flex items-center gap-1 text-gray-400">
              <Paperclip size={12} />
              {docCountLoading ? (
                <span className="text-[11px] text-gray-300 italic">Đang kiểm tra…</span>
              ) : (
                <Text className={`text-[11px] font-medium ${hasDocuments ? "text-green-600" : "text-orange-500"}`}>
                  {docCount} tài liệu đính kèm
                </Text>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Tooltip title="Tải lên tài liệu cho đơn này">
            <Button
              icon={<UploadCloud size={14} />}
              className="!rounded-xl !border-orange-200 !text-orange-600 hover:!bg-orange-50"
              onClick={() => onUploadDoc(app)}
            >
              Nộp tài liệu
            </Button>
          </Tooltip>

          {canSubmitFinal && (
            hasDocuments ? (
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
            ) : (
              <Tooltip
                title={
                  docCountLoading
                    ? "Đang kiểm tra tài liệu…"
                    : "Bạn cần nộp ít nhất 1 tài liệu trước khi nộp đơn"
                }
              >
                <Button
                  icon={<SendHorizonal size={14} />}
                  disabled
                  className="!rounded-xl !cursor-not-allowed"
                >
                  Nộp đơn
                </Button>
              </Tooltip>
            )
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
  const [uploadTarget, setUploadTarget] = useState<Application | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  // docCountMap: applicationId → số tài liệu thực tế từ detail API
  const [docCountMap, setDocCountMap] = useState<Record<string, number>>({});
  const [docCountsLoading, setDocCountsLoading] = useState<Record<string, boolean>>({});

  async function loadDocCounts(appList: Application[]) {
    // Đánh dấu tất cả đang loading
    const initLoading = Object.fromEntries(appList.map((a) => [a.applicationId, true]));
    setDocCountsLoading(initLoading);

    // Fetch song song tất cả detail để lấy documents
    await Promise.allSettled(
      appList.map(async (a) => {
        try {
          const detail = await fetchMyApplicationDetail(Number(a.applicationId));
          setDocCountMap((prev) => ({
            ...prev,
            [a.applicationId]: detail.documents?.length ?? 0,
          }));
        } catch {
          setDocCountMap((prev) => ({ ...prev, [a.applicationId]: 0 }));
        } finally {
          setDocCountsLoading((prev) => ({ ...prev, [a.applicationId]: false }));
        }
      })
    );
  }

  function loadApps() {
    setLoading(true);
    fetchMyApplications()
      .then((appList) => {
        setApps(appList);
        loadDocCounts(appList);
      })
      .catch(() => setError("Không thể tải danh sách đơn đăng ký."))
      .finally(() => setLoading(false));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
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
                docCount={docCountMap[app.applicationId] ?? 0}
                docCountLoading={docCountsLoading[app.applicationId] ?? false}
                onUploadDoc={setUploadTarget}
                onSubmitFinal={handleSubmitFinal}
                submittingId={submittingId}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Upload document modal ── */}
      {uploadTarget && (
        <UploadDocModal
          app={uploadTarget}
          open={!!uploadTarget}
          onClose={() => setUploadTarget(null)}
          onSuccess={loadApps}
        />
      )}
    </DashboardLayout>
  );
}
