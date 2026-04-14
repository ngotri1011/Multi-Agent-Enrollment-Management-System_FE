import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  Bot,
  Eye,
  PlusCircle,
  Search,
  SendHorizonal,
  XCircle,
} from "lucide-react";
import { ApplicantLayout } from "../../components/layouts/ApplicantLayout";
import { ApplicantMenu } from "../applicant/ApplicantMenu";
import { fetchMyApplications, submitApplicationFinal } from "../../api/applications";
import {
  APPLICATION_STATUS,
  type ApplicationMe,
  type ApplicationStatus,
} from "../../types/application";

const { Title, Text } = Typography;

/** Thứ tự hiển thị trạng thái trong filter (chỉ render các mục đang có trong `apps`). */
const STATUS_FILTER_ORDER: ApplicationStatus[] = [
  "draft",
  "submitted",
  "under_review",
  "approved",
  "rejected",
  "document_required",
];

function isApplicationStatus(s: string): s is ApplicationStatus {
  return (STATUS_FILTER_ORDER as readonly string[]).includes(s);
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_TAG_COLOR: Record<ApplicationStatus, string> = {
  draft: "default",
  submitted: "blue",
  under_review: "processing",
  approved: "success",
  rejected: "error",
  document_required: "warning",
};

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  draft: { label: APPLICATION_STATUS.draft, color: STATUS_TAG_COLOR.draft },
  submitted: { label: APPLICATION_STATUS.submitted, color: STATUS_TAG_COLOR.submitted },
  under_review: {
    label: APPLICATION_STATUS.under_review,
    color: STATUS_TAG_COLOR.under_review,
  },
  approved: { label: APPLICATION_STATUS.approved, color: STATUS_TAG_COLOR.approved },
  rejected: { label: APPLICATION_STATUS.rejected, color: STATUS_TAG_COLOR.rejected },
  document_required: {
    label: APPLICATION_STATUS.document_required,
    color: STATUS_TAG_COLOR.document_required,
  },
};

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

function getAmountFromPaymentUrl(url: string): number | null {
  try {
    const parsed = new URL(url);
    const raw = parsed.searchParams.get("amount");
    if (!raw) return null;
    const amount = Number(raw);
    return Number.isFinite(amount) ? amount : null;
  } catch {
    return null;
  }
}

function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function hasPaymentQr(
  payload: { url?: string; transactionId?: string } | null,
): payload is { url: string; transactionId: string } {
  // Backend có thể trả object rỗng khi đơn đã được thanh toán từ trước, nên chỉ mở modal khi QR và mã giao dịch đều có giá trị.
  if (!payload) return false;
  const qrUrl = payload.url?.trim();
  const transactionId = payload.transactionId?.trim();
  return Boolean(qrUrl && transactionId);
}

/** `/me` không có programId — lọc theo tên hiển thị; tiền tố tránh trùng key giữa các chiều. */
function meProgramFilterKey(a: ApplicationMe): string {
  const t = (a.programName || "").trim();
  return t ? `p:${t}` : `p:#${a.applicationId}`;
}
function meCampusFilterKey(a: ApplicationMe): string {
  const t = (a.campusName || "").trim();
  return t ? `c:${t}` : `c:#${a.applicationId}`;
}
function meAdmissionFilterKey(a: ApplicationMe): string {
  const t = (a.admissionTypeName || "").trim();
  return t ? `a:${t}` : `a:#${a.applicationId}`;
}
function meProgramOptionLabel(a: ApplicationMe): string {
  const t = (a.programName || "").trim();
  return t || `Chương trình — đơn #${a.applicationId}`;
}
function meCampusOptionLabel(a: ApplicationMe): string {
  const t = (a.campusName || "").trim();
  return t || `Cơ sở — đơn #${a.applicationId}`;
}
function meAdmissionOptionLabel(a: ApplicationMe): string {
  const t = (a.admissionTypeName || "").trim();
  return t || `Loại xét tuyển — đơn #${a.applicationId}`;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function ApplicationList() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [apps, setApps] = useState<ApplicationMe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "all">("all");
  const [programFilter, setProgramFilter] = useState<string>("all");
  const [campusFilter, setCampusFilter] = useState<string>("all");
  const [admissionFilter, setAdmissionFilter] = useState<string>("all");

  const statusOptions = useMemo(() => {
    const seen = new Set<ApplicationStatus>();
    for (const a of apps) {
      if (isApplicationStatus(a.status)) seen.add(a.status);
    }
    return STATUS_FILTER_ORDER.filter((s) => seen.has(s)).map((s) => ({
      value: s,
      label: statusConfig[s].label,
    }));
  }, [apps]);

  useEffect(() => {
    if (statusFilter === "all") return;
    if (!statusOptions.some((o) => o.value === statusFilter)) {
      setStatusFilter("all");
    }
  }, [statusFilter, statusOptions]);

  const programOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of apps) {
      const k = meProgramFilterKey(a);
      if (!m.has(k)) m.set(k, meProgramOptionLabel(a));
    }
    return [...m.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((x, y) => x.label.localeCompare(y.label, "vi"));
  }, [apps]);

  const campusOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of apps) {
      const k = meCampusFilterKey(a);
      if (!m.has(k)) m.set(k, meCampusOptionLabel(a));
    }
    return [...m.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((x, y) => x.label.localeCompare(y.label, "vi"));
  }, [apps]);

  const admissionOptions = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of apps) {
      const k = meAdmissionFilterKey(a);
      if (!m.has(k)) m.set(k, meAdmissionOptionLabel(a));
    }
    return [...m.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((x, y) => x.label.localeCompare(y.label, "vi"));
  }, [apps]);

  const filteredApps = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return apps.filter((app) => {
      // Ưu tiên lọc theo trạng thái nghiệp vụ trước để giảm số bản ghi cần xử lý cho các bước lọc tiếp theo.
      if (statusFilter !== "all" && app.status !== statusFilter) return false;
      if (programFilter !== "all" && meProgramFilterKey(app) !== programFilter)
        return false;
      if (campusFilter !== "all" && meCampusFilterKey(app) !== campusFilter)
        return false;
      if (
        admissionFilter !== "all" &&
        meAdmissionFilterKey(app) !== admissionFilter
      )
        return false;
      if (!q) return true;
      // Tìm kiếm full-text trên các trường mà người dùng thường nhớ (tên CT, cơ sở, loại xét tuyển, mã đơn, tên thí sinh).
      const blob = [
        app.programName,
        app.campusName,
        app.admissionTypeName,
        String(app.applicationId),
        app.applicantName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(q);
    });
  }, [apps, searchText, statusFilter, programFilter, campusFilter, admissionFilter]);

  const hasActiveFilters =
    searchText.trim() !== "" ||
    statusFilter !== "all" ||
    programFilter !== "all" ||
    campusFilter !== "all" ||
    admissionFilter !== "all";

  function clearFilters() {
    setSearchText("");
    setStatusFilter("all");
    setProgramFilter("all");
    setCampusFilter("all");
    setAdmissionFilter("all");
  }

  const loadApps = useCallback(() => {
    setLoading(true);
    fetchMyApplications()
      .then((appList) => setApps(appList ?? []))
      .catch(() => setError("Không tìm thấy đơn đăng ký cho ứng viên này."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  // Chức năng nộp đơn và thanh toán QR.
  const handleSubmitFinal = useCallback(
    async (app: ApplicationMe) => {
      setSubmittingId(app.applicationId);
      try {
        // Gọi API "nộp đơn cuối cùng": backend sẽ quyết định trả QR thanh toán mới hay thông báo đã thanh toán trước đó.
        const payment = await submitApplicationFinal(Number(app.applicationId));

        if (hasPaymentQr(payment)) {
          const paymentAmount = getAmountFromPaymentUrl(payment.url);
          messageApi.info(
            "Mã thanh toán QR đã sẵn sàng. Vui lòng quét QR để thanh toán.",
          );
          // Hiển thị modal QR ngay sau khi nộp để ép luồng thanh toán diễn ra liền mạch, tránh người dùng bỏ sót bước này.
          Modal.info({
            title: "Thanh toán bằng QR",
            width: 420,
            getContainer: () => document.body,
            zIndex: 2000,
            centered: true,
            content: (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={payment.url}
                  alt="QR thanh toán"
                  style={{ width: 220, height: 220, objectFit: "contain" }}
                />
                <div className="w-full">
                  <div className="text-xs text-gray-500 mb-1">
                    Số tiền cần thanh toán
                  </div>
                  <div className="text-base font-semibold text-orange-600">
                    {paymentAmount !== null
                      ? formatVnd(paymentAmount)
                      : "Không xác định"}
                  </div>
                </div>
                <div className="w-full">
                  <div className="text-xs text-gray-500 mb-1">Mã giao dịch</div>
                  <div className="font-mono text-sm text-gray-700 break-all">
                    {payment.transactionId}
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  Sau khi thanh toán, hệ thống sẽ cập nhật trạng thái đơn đăng ký của
                  bạn.
                </div>
              </div>
            ),
            okText: "Đã hiểu",
            // Sau khi người dùng đóng modal, tải lại danh sách để đồng bộ trạng thái đơn mới nhất từ hệ thống.
            onOk: () => loadApps(),
          });
          return;
        }

        // Trường hợp không có QR: backend xác nhận đơn đã thanh toán trước đó, chỉ cần thông báo và reload trạng thái.
        messageApi.success(
          `Bạn đã thanh toán trước đó. Đơn "${app.programName}" đang được gửi xét duyệt!`,
        );
        loadApps();
      } catch (err: unknown) {
        const errData = (
          err as {
            response?: { data?: { message?: string; errors?: string[] } };
          }
        ).response?.data;
        const msg =
          errData?.message ||
          (errData?.errors?.length ? errData.errors.join("; ") : null) ||
          "Nộp đơn thất bại. Vui lòng thử lại.";
        messageApi.error(msg);
      } finally {
        setSubmittingId(null);
      }
    },
    [loadApps, messageApi],
  );

  const applicationColumns: ColumnsType<ApplicationMe> = useMemo(
    () => [
      {
        title: "Chương trình",
        dataIndex: "programName",
        key: "program",
        ellipsis: true,
        width: 220,
        fixed: "left",
        className: "!pl-5 sm:!pl-7",
        render: (name: string) => (
          <Tooltip title={name?.trim() ? name : undefined}>
            <span className="font-semibold text-gray-800">
              {name?.trim() ? name : "—"}
            </span>
          </Tooltip>
        ),
      },
      {
        title: "Trạng thái",
        key: "status",
        width: 188,
        render: (_, app) => {
          const sc = statusConfig[app.status];
          const isAiProcessing =
            app.status === "under_review" || app.status === "submitted";
          return (
            <Space size={6} wrap className="max-w-[200px]">
              <Tag color={sc.color} className="!m-0 text-xs">
                {sc.label}
              </Tag>
              {isAiProcessing && (
                <Tag
                  color="purple"
                  className="!m-0 inline-flex items-center gap-0.5 text-xs"
                >
                  <Bot size={11} className="shrink-0" />
                  AI
                </Tag>
              )}
            </Space>
          );
        },
      },
      {
        title: "Loại xét tuyển",
        dataIndex: "admissionTypeName",
        key: "admission",
        ellipsis: true,
        responsive: ["md"],
        width: 200,
        render: (v: string) => (
          <Text className="text-sm text-gray-600">{v?.trim() ? v : "—"}</Text>
        ),
      },
      {
        title: "Cơ sở",
        dataIndex: "campusName",
        key: "campus",
        ellipsis: true,
        responsive: ["md"],
        width: 160,
        render: (v: string) => (
          <Text className="text-sm text-gray-600">{v?.trim() ? v : "—"}</Text>
        ),
      },
      {
        title: "Mã đơn",
        dataIndex: "applicationId",
        key: "id",
        width: 96,
        responsive: ["lg"],
        render: (id: number) => (
          <span className="font-mono text-sm text-gray-700 tabular-nums">
            {id}
          </span>
        ),
      },
      {
        title: "Nộp ngày",
        key: "submitted",
        width: 118,
        responsive: ["lg"],
        render: (_, app) => (
          <Text className="text-sm text-gray-600">
            {app.submittedAt ? formatDate(app.submittedAt) : "—"}
          </Text>
        ),
      },
      {
        title: "Cập nhật",
        key: "updated",
        width: 124,
        responsive: ["lg"],
        render: (_, app) => (
          <Tooltip
            title={app.lastUpdated ? formatDate(app.lastUpdated) : undefined}
          >
            <Text className="text-sm text-gray-500">
              {app.lastUpdated ? relativeTime(app.lastUpdated) : "—"}
            </Text>
          </Tooltip>
        ),
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 228,
        align: "right",
        fixed: "right",
        className: "!pr-5 sm:!pr-7",
        render: (_, app) => {
          // Chỉ cho phép nộp ở 2 trạng thái:
          // - draft: đơn mới tạo, chưa nộp lần nào.
          // - document_required: đơn bị yêu cầu bổ sung hồ sơ và được phép nộp lại.
          const canSubmitFinal =
            app.status === "draft" || app.status === "document_required";
          // Dùng cờ này để đổi copywriting (nộp mới vs nộp lại) giúp người dùng hiểu đúng ngữ cảnh xử lý.
          const isResubmit = app.status === "document_required";
          const isSubmitting = submittingId === app.applicationId;
          return (
            <Space size={8} wrap className="justify-end">
              {canSubmitFinal && (
                <Popconfirm
                  title={
                    isResubmit
                      ? "Xác nhận nộp lại đơn đăng ký"
                      : "Xác nhận nộp đơn đăng ký"
                  }
                  description={
                    <span className="text-xs text-gray-500">
                      {isResubmit
                        ? "Sau khi nộp lại, đơn sẽ được gửi lại vào hệ thống xét duyệt."
                        : "Sau khi nộp, đơn sẽ được gửi đến hệ thống xét duyệt."}
                      <br />
                      Bạn sẽ không thể chỉnh sửa sau khi xác nhận.
                    </span>
                  }
                  okText={isResubmit ? "Xác nhận nộp lại" : "Xác nhận nộp"}
                  cancelText="Hủy"
                  okButtonProps={{
                    className: "!bg-green-600 !border-green-600",
                  }}
                  onConfirm={() => handleSubmitFinal(app)}
                >
                  <Button
                    size="small"
                    icon={<SendHorizonal size={14} />}
                    loading={isSubmitting}
                    className="!rounded-lg !border-green-400 !text-green-600 hover:!bg-green-50"
                  >
                    {isResubmit ? "Nộp lại" : "Nộp đơn"}
                  </Button>
                </Popconfirm>
              )}
              <Button
                type="primary"
                size="small"
                icon={<Eye size={14} />}
                className="!rounded-lg !bg-orange-500 !border-orange-500 hover:!bg-orange-600"
                onClick={() =>
                  navigate(`/applicant/applications/${app.applicationId}`)
                }
              >
                Chi tiết
              </Button>
            </Space>
          );
        },
      },
    ],
    [handleSubmitFinal, navigate, submittingId],
  );

  return (
    <ApplicantLayout menuItems={ApplicantMenu}>
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
        <div className="mb-16 flex flex-col gap-4 pb-10 sm:mb-20 sm:pb-14">
          <Card
            className="rounded-2xl border border-gray-200/80 bg-white shadow-sm shadow-gray-200/40"
            styles={{ body: { padding: "18px 20px" } }}
          >
            <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50/90 to-white px-4 py-3.5">
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-3 items-center">
                  <Input
                    allowClear
                    prefix={<Search size={16} className="text-gray-400" />}
                    placeholder="Tìm theo chương trình, cơ sở, loại xét tuyển, mã đơn, tên thí sinh…"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="!rounded-xl !border-gray-200 flex-1 min-w-[220px] shadow-sm"
                  />
                  <Button
                    type="link"
                    className="!px-2 shrink-0 !text-orange-600"
                    disabled={!hasActiveFilters}
                    onClick={clearFilters}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                  <Select<ApplicationStatus | "all">
                    value={statusFilter}
                    onChange={setStatusFilter}
                    className="min-w-[180px] flex-1 sm:flex-none [&_.ant-select-selector]:!rounded-xl"
                    popupMatchSelectWidth={false}
                    options={[
                      { value: "all", label: "Tất cả trạng thái" },
                      ...statusOptions,
                    ]}
                  />
                  <Select<string>
                    value={programFilter}
                    onChange={setProgramFilter}
                    className="min-w-[200px] flex-1 sm:flex-none [&_.ant-select-selector]:!rounded-xl"
                    popupMatchSelectWidth={false}
                    options={[
                      { value: "all", label: "Tất cả chương trình" },
                      ...programOptions,
                    ]}
                  />
                  <Select<string>
                    value={campusFilter}
                    onChange={setCampusFilter}
                    className="min-w-[160px] flex-1 sm:flex-none [&_.ant-select-selector]:!rounded-xl"
                    popupMatchSelectWidth={false}
                    options={[
                      { value: "all", label: "Tất cả cơ sở" },
                      ...campusOptions,
                    ]}
                  />
                  <Select<string>
                    value={admissionFilter}
                    onChange={setAdmissionFilter}
                    className="min-w-[200px] flex-1 sm:flex-none [&_.ant-select-selector]:!rounded-xl"
                    popupMatchSelectWidth={false}
                    options={[
                      { value: "all", label: "Tất cả loại xét tuyển" },
                      ...admissionOptions,
                    ]}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card
            className="rounded-2xl border border-gray-200/80 shadow-md shadow-gray-200/30 overflow-hidden"
            styles={{ body: { padding: 0 } }}
          >
            <div className="flex flex-col gap-1 border-b border-gray-100 bg-gradient-to-r from-orange-50/40 via-white to-gray-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex flex-wrap items-center gap-2.5">
                <Title
                  level={5}
                  className="!mb-0 !text-gray-800 !font-semibold !text-base"
                >
                  Danh sách đơn
                </Title>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/90 bg-orange-50 px-3 py-1 text-xs font-bold tabular-nums text-orange-900 shadow-sm shadow-orange-900/5"
                  title={
                    hasActiveFilters
                      ? `${filteredApps.length} đơn khớp bộ lọc trên tổng ${apps.length} đơn`
                      : `Tổng ${apps.length} đơn đăng ký`
                  }
                >
                  {hasActiveFilters ? (
                    <>
                      <span>{filteredApps.length}</span>
                      <span className="font-medium text-orange-700/80">/</span>
                      <span className="font-semibold text-orange-950">
                        {apps.length}
                      </span>
                      <span className="pl-0.5 font-semibold">đơn</span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold">{apps.length}</span>
                      <span className="font-semibold">đơn đăng ký</span>
                    </>
                  )}
                </span>
                {hasActiveFilters && (
                  <Tag className="!m-0 border-amber-200 bg-amber-50 text-amber-900 text-xs">
                    Đang lọc
                  </Tag>
                )}
              </div>
              <Text className="!mb-0 text-xs text-gray-500 sm:text-right">
                Chọn một hàng để xem chi tiết hoặc nộp đơn khi được phép.
              </Text>
            </div>

            {filteredApps.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Text className="text-gray-500 text-sm">
                    Không có đơn nào khớp bộ lọc.
                  </Text>
                }
                className="py-16 px-4"
              >
                <Button
                  type="primary"
                  className="!rounded-xl !bg-orange-500 !border-orange-500"
                  onClick={clearFilters}
                >
                  Đặt lại bộ lọc
                </Button>
              </Empty>
            ) : (
              <Table<ApplicationMe>
                rowKey="applicationId"
                columns={applicationColumns}
                dataSource={filteredApps}
                size="middle"
                scroll={{ x: 1040 }}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: true,
                  pageSizeOptions: [5, 10, 20, 50],
                  showTotal: (total, range) =>
                    `${range[0]}–${range[1]} của ${total} đơn`,
                  hideOnSinglePage: false,
                  showQuickJumper: filteredApps.length > 10,
                  className:
                    "!m-0 border-t border-gray-100 bg-gray-50/60 !px-5 !py-4 sm:!px-7",
                }}
                className="[&_.ant-table]:!rounded-none [&_.ant-table-thead>tr>th]:!bg-gray-50/80 [&_.ant-table-thead>tr>th]:!text-xs [&_.ant-table-thead>tr>th]:!font-semibold [&_.ant-table-thead>tr>th]:!text-gray-600 [&_.ant-table-thead>tr>th]:!uppercase [&_.ant-table-thead>tr>th]:!tracking-wide [&_.ant-table-thead>tr>th]:!border-b-gray-200 [&_.ant-table-tbody>tr>td]:!align-middle [&_.ant-table-tbody>tr:hover>td]:!bg-orange-50/30"
              />
            )}
          </Card>
        </div>
      )}
    </ApplicantLayout>
  );
}
