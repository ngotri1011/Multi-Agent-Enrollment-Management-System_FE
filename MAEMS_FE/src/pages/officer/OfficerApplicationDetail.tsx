import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Eye,
  ExternalLink,
  FilePlus2,
  FileText,
  RefreshCw,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getApplicantById } from "../../api/applicants";
import {
  fetchApplicationDetail,
  patchApplication,
} from "../../api/applications";
import type { CreateApplicantResponse } from "../../types/applicant";
import { OfficerLayout } from "../../components/layouts/OfficerLayout";
import type {
  Application,
  ApplicationStatus,
  Document,
} from "../../types/application";

const { Title, Text } = Typography;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ApplicationStatus, { label: string; color: string }> =
  {
    draft:             { label: "Bản nháp",             color: "default"    },
    submitted:         { label: "Đã nộp",               color: "blue"       },
    under_review:      { label: "Chờ NV xét duyệt",     color: "processing" },
    approved:          { label: "Đã chấp nhận",          color: "success"    },
    rejected:          { label: "Từ chối",               color: "error"      },
    document_required: { label: "Cần bổ sung tài liệu", color: "warning"    },
  };


function verificationBadge(result: string) {
  const r = result?.toLowerCase();
  if (r === "passed" || r === "verified")
    return <Badge status="success" text="Đã xác minh" />;
  if (r === "pending")
    return <Badge status="warning" text="Chờ xác minh" />;
  if (r === "failed" || r === "rejected")
    return <Badge status="error" text="Không hợp lệ" />;
  return <Badge status="default" text={result || "Chưa xác minh"} />;
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

function formatGender(g: string) {
  const x = (g || "").toLowerCase();
  if (x === "male" || x === "nam" || x === "m") return "Nam";
  if (x === "female" || x === "nữ" || x === "nu" || x === "f") return "Nữ";
  if (x === "other" || x === "khác") return "Khác";
  return g?.trim() || "—";
}

function initialsFromName(name: string) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}


// ─── Component ───────────────────────────────────────────────────────────────

export function OfficerApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [rejectModal, setRejectModal] = useState(false);
  const [supplementModal, setSupplementModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [previewDetailExpanded, setPreviewDetailExpanded] = useState(false);
  const [applicantModalOpen, setApplicantModalOpen] = useState(false);
  const [applicantDetail, setApplicantDetail] = useState<CreateApplicantResponse | null>(null);
  const [applicantLoading, setApplicantLoading] = useState(false);
  const [rejectForm] = Form.useForm();
  const [supplementForm] = Form.useForm();

  const openApplicantProfile = async () => {
    if (!app) return;
    setApplicantModalOpen(true);
    setApplicantDetail(null);
    setApplicantLoading(true);
    try {
      const data = await getApplicantById(app.applicantId);
      setApplicantDetail(data);
    } catch {
      messageApi.error("Không tải được hồ sơ thí sinh.");
      setApplicantModalOpen(false);
    } finally {
      setApplicantLoading(false);
    }
  };

  const closeApplicantProfile = () => {
    setApplicantModalOpen(false);
    setApplicantDetail(null);
  };

  const loadApp = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await fetchApplicationDetail(Number(id));
      setApp(data);
    } catch {
      messageApi.error("Không thể tải thông tin hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadApp(); }, [id]);

  const handleApprove = async () => {
    if (!app) return;
    setActionLoading("approve");
    try {
      await patchApplication(app.applicationId, { status: "approved" });
      messageApi.success("Đã phê duyệt hồ sơ.");
      setApp({ ...app, status: "approved" });
    } catch {
      messageApi.error("Phê duyệt thất bại, vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!app) return;
    try {
      await rejectForm.validateFields();
      setActionLoading("reject");
      await patchApplication(app.applicationId, { status: "rejected" });
      messageApi.success("Đã từ chối hồ sơ.");
      setApp({ ...app, status: "rejected" });
      setRejectModal(false);
      rejectForm.resetFields();
    } catch {
      messageApi.error("Từ chối thất bại, vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSupplementSubmit = async () => {
    if (!app) return;
    try {
      await supplementForm.validateFields();
      setActionLoading("supplement");
      await patchApplication(app.applicationId, { status: "document_required" });
      messageApi.success("Đã gửi yêu cầu bổ sung tài liệu.");
      setSupplementModal(false);
      supplementForm.resetFields();
    } catch {
      messageApi.error("Gửi yêu cầu thất bại, vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const isDone = app?.status === "approved" || app?.status === "rejected";

  return (
    <OfficerLayout>
      {contextHolder}

      {/* Back + header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            icon={<ArrowLeft size={15} />}
            onClick={() => navigate(-1)}
            className="!rounded-xl"
          >
            Quay lại
          </Button>
          <div>
            <Title level={4} className="!mb-0.5 !text-gray-800 !font-bold">
              Chi tiết hồ sơ
              {app && (
                <span className="ml-2 font-mono text-indigo-500 text-lg">
                  #{app.applicationId}
                </span>
              )}
            </Title>
            <Text className="text-gray-400 text-sm">
              Thông tin đầy đủ về hồ sơ đăng ký
            </Text>
          </div>
        </div>
        <Button
          icon={<RefreshCw size={14} />}
          onClick={loadApp}
          loading={loading}
          className="!rounded-xl"
        >
          Làm mới
        </Button>
      </div>

      <Spin spinning={loading}>
        {app && (
          <Row gutter={[16, 16]}>
            {/* Left column */}
            <Col xs={24} lg={16}>
              {/* Applicant info */}
              <Card
                className="rounded-2xl border border-gray-100 shadow-sm mb-4"
                styles={{ body: { padding: "20px 24px" } }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Title level={5} className="!mb-0 !text-gray-700">
                    Thông tin hồ sơ
                  </Title>
                  <Space>
                    <Tag color={STATUS_CFG[app.status].color} className="text-sm px-3 py-0.5">
                      {STATUS_CFG[app.status].label}
                    </Tag>
                    {(app.status === "under_review" || app.requiresReview) && (
                      <Tag color="red" className="text-xs">
                        Cần xem xét
                      </Tag>
                    )}
                  </Space>
                </div>

                <button
                  type="button"
                  onClick={openApplicantProfile}
                  className="mb-5 w-full text-left rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 to-white px-4 py-3.5 transition-all hover:border-indigo-200 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 font-bold text-sm">
                      {initialsFromName(app.applicantName)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Text className="!mb-0 font-semibold text-gray-900 text-base">
                          {app.applicantName}
                        </Text>
                        <Tag color="geekblue" className="!m-0 !text-xs">
                          Hồ sơ thí sinh
                        </Tag>
                      </div>
                      <Text className="text-xs text-gray-500 block mt-0.5">
                        Mã thí sinh{" "}
                        <span className="font-mono text-indigo-600">#{app.applicantId}</span>
                        {" · "}
                        Nhấn để xem chi tiết cá nhân
                      </Text>
                    </div>
                    <ChevronRight size={20} className="text-indigo-400 shrink-0" aria-hidden />
                  </div>
                </button>

                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                  <Descriptions.Item label="Mã hồ sơ">
                    <Text className="font-mono text-indigo-600 font-semibold">
                      {app.applicationId}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngành đăng ký">
                    {app.programName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phương thức XT">
                    {app.admissionTypeName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cơ sở">
                    {app.campusName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Năm tuyển sinh">
                    {app.enrollmentYear}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày nộp">
                    {app.submittedAt
                      ? new Date(app.submittedAt).toLocaleString("vi-VN")
                      : "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cập nhật lần cuối">
                    {app.lastUpdated
                      ? new Date(app.lastUpdated).toLocaleString("vi-VN")
                      : "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cán bộ phụ trách">
                    {app.assignedOfficerName ?? (
                      <Text className="text-gray-300">Chưa phân công</Text>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cần xét thủ công">
                    {app.requiresReview ? (
                      <Tag color="orange">Có</Tag>
                    ) : (
                      <Tag color="green">Không</Tag>
                    )}
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              {/* Agent note */}
              <Card
                className={`rounded-2xl shadow-sm mb-4 ${app.notes ? "border border-indigo-100 bg-indigo-50" : "border border-gray-100"}`}
                styles={{ body: { padding: "20px 24px" } }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck size={18} className={app.notes ? "text-indigo-500" : "text-gray-300"} />
                  <Title level={5} className={`!mb-0 ${app.notes ? "!text-indigo-700" : "!text-gray-400"}`}>
                    Ghi chú từ Agent hệ thống
                  </Title>
                  {app.notes && (
                    <Button
                      type="text"
                      size="small"
                      icon={notesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      className="!text-indigo-500"
                      onClick={() => setNotesExpanded((prev) => !prev)}
                    />
                  )}
                </div>
                {app.notes ? (
                  <Text className={`text-sm text-gray-700 font-mono whitespace-pre-wrap ${notesExpanded ? "" : "line-clamp-3"}`}>
                    {app.notes}
                  </Text>
                ) : (
                  <Text className="text-sm text-gray-400 italic">
                    Chưa có ghi chú từ agent hệ thống.
                  </Text>
                )}
              </Card>

              {/* Documents */}
              <Card
                className="rounded-2xl border border-gray-100 shadow-sm"
                styles={{ body: { padding: "20px 24px" } }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Title level={5} className="!mb-0 !text-gray-700">
                    Tài liệu đính kèm
                  </Title>
                  <Tag color={(app.documents?.length ?? 0) > 0 ? "blue" : "orange"}>
                    {app.documents?.length ?? 0} tài liệu
                  </Tag>
                </div>

                {!app.documents?.length ? (
                  <div className="text-center py-8 text-gray-300">
                    <FileText size={36} className="mx-auto mb-2" />
                    <Text className="text-gray-400 text-sm">
                      Chưa có tài liệu nào được đính kèm
                    </Text>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {app.documents.map((doc: Document) => {
                      const isImage = isImageDocument(doc);
                      const fileUrl = doc.filePath;
                      return (
                        <div
                          key={doc.documentId}
                          className="group rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-sm transition-all overflow-hidden cursor-pointer"
                          onClick={() => setPreviewDoc(doc)}
                        >
                          {/* Thumbnail */}
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

                          {/* Info */}
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
                                  ? new Date(doc.uploadedAt).toLocaleDateString("vi-VN")
                                  : ""}
                              </Text>
                            </div>
                            <div className="mt-2">{verificationBadge(doc.verificationResult)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </Col>

            {/* Right column — Actions */}
            <Col xs={24} lg={8}>
              <Card
                className="rounded-2xl border border-gray-100 shadow-sm sticky top-4"
                styles={{ body: { padding: "20px 24px" } }}
              >
                <Title level={5} className="!mb-4 !text-gray-700">
                  Hành động
                </Title>

                {isDone ? (
                  <div className="text-center py-4">
                    <Tag
                      color={app.status === "approved" ? "success" : "error"}
                      className="text-sm px-4 py-1"
                    >
                      {STATUS_CFG[app.status].label}
                    </Tag>
                    <Text className="block text-gray-400 text-xs mt-2">
                      Hồ sơ đã được xử lý xong.
                    </Text>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Popconfirm
                      title="Phê duyệt hồ sơ này?"
                      description="Hành động này không thể hoàn tác."
                      okText="Phê duyệt"
                      cancelText="Huỷ"
                      onConfirm={handleApprove}
                    >
                      <Button
                        block
                        type="primary"
                        icon={<CheckCircle2 size={15} />}
                        loading={actionLoading === "approve"}
                        className="!rounded-xl !h-10 !bg-emerald-500 !border-emerald-500 hover:!bg-emerald-600"
                      >
                        Phê duyệt hồ sơ
                      </Button>
                    </Popconfirm>

                    <Button
                      block
                      danger
                      icon={<XCircle size={15} />}
                      loading={actionLoading === "reject"}
                      onClick={() => setRejectModal(true)}
                      className="!rounded-xl !h-10"
                    >
                      Từ chối hồ sơ
                    </Button>

                    <Button
                      block
                      icon={<FilePlus2 size={15} />}
                      loading={actionLoading === "supplement"}
                      onClick={() => setSupplementModal(true)}
                      className="!rounded-xl !h-10 !text-amber-600 !border-amber-300 hover:!border-amber-400"
                    >
                      Yêu cầu bổ sung tài liệu
                    </Button>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Mã hồ sơ</span>
                    <span className="font-mono text-indigo-500">
                      #{app.applicationId}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Trạng thái</span>
                    <Tag color={STATUS_CFG[app.status].color} className="!text-xs !m-0">
                      {STATUS_CFG[app.status].label}
                    </Tag>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Tài liệu</span>
                    <span>{app.documents?.length ?? 0} file</span>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Spin>

      {/* Applicant profile modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 pr-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <User size={18} aria-hidden />
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold text-gray-900 truncate">
                Hồ sơ thí sinh
              </div>
              {app && (
                <Text className="text-xs text-gray-400 font-normal">
                  Mã thí sinh{" "}
                  <span className="font-mono text-indigo-500">#{app.applicantId}</span>
                </Text>
              )}
            </div>
          </div>
        }
        open={applicantModalOpen}
        onCancel={closeApplicantProfile}
        footer={
          <Button type="primary" className="!rounded-xl" onClick={closeApplicantProfile}>
            Đóng
          </Button>
        }
        width={680}
        destroyOnClose
      >
        <Spin spinning={applicantLoading}>
          {applicantDetail && (
            <div className="pt-1 max-h-[70vh] overflow-y-auto pr-1">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-lg">
                  {initialsFromName(applicantDetail.fullName)}
                </div>
                <div className="min-w-0">
                  <Text className="!text-lg !font-semibold !text-gray-900 block truncate">
                    {applicantDetail.fullName}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    User ID{" "}
                    <span className="font-mono text-gray-600">{applicantDetail.userId}</span>
                  </Text>
                </div>
              </div>

              <Text className="!text-xs !font-semibold !text-gray-400 uppercase tracking-wide block mb-2">
                Thông tin cá nhân
              </Text>
              <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered className="!mb-4">
                <Descriptions.Item label="Ngày sinh" span={1}>
                  {applicantDetail.dateOfBirth
                    ? new Date(applicantDetail.dateOfBirth).toLocaleDateString("vi-VN")
                    : "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính" span={1}>
                  {formatGender(applicantDetail.gender)}
                </Descriptions.Item>
              </Descriptions>

              <Divider className="!my-4" />

              <Text className="!text-xs !font-semibold !text-gray-400 uppercase tracking-wide block mb-2">
                Trường THPT
              </Text>
              <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered className="!mb-4">
                <Descriptions.Item label="Trường" span={2}>
                  {applicantDetail.highSchoolName || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Huyện / quận">
                  {applicantDetail.highSchoolDistrict || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Tỉnh / TP">
                  {applicantDetail.highSchoolProvince || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Năm tốt nghiệp" span={2}>
                  {applicantDetail.graduationYear ?? "—"}
                </Descriptions.Item>
              </Descriptions>

              <Divider className="!my-4" />

              <Text className="!text-xs !font-semibold !text-gray-400 uppercase tracking-wide block mb-2">
                CCCD / CMND
              </Text>
              <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered className="!mb-4">
                <Descriptions.Item label="Số">
                  {applicantDetail.idIssueNumber || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày cấp">
                  {applicantDetail.idIssueDate
                    ? new Date(applicantDetail.idIssueDate).toLocaleDateString("vi-VN")
                    : "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Nơi cấp" span={2}>
                  {applicantDetail.idIssuePlace || "—"}
                </Descriptions.Item>
              </Descriptions>

              <Divider className="!my-4" />

              <Text className="!text-xs !font-semibold !text-gray-400 uppercase tracking-wide block mb-2">
                Liên hệ
              </Text>
              <Descriptions column={{ xs: 1, sm: 2 }} size="small" bordered className="!mb-4">
                <Descriptions.Item label="Người liên hệ" span={2}>
                  {applicantDetail.contactName || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                  {applicantDetail.contactAddress || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Điện thoại">
                  {applicantDetail.contactPhone || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {applicantDetail.contactEmail || "—"}
                </Descriptions.Item>
              </Descriptions>

              <Divider className="!my-4" />

              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Đồng ý chia sẻ thông tin">
                  {applicantDetail.allowShare ? (
                    <Tag color="green">Có</Tag>
                  ) : (
                    <Tag>Không</Tag>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Tạo hồ sơ lúc">
                  {applicantDetail.createdAt
                    ? new Date(applicantDetail.createdAt).toLocaleString("vi-VN")
                    : "—"}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Spin>
      </Modal>

      {/* Document preview modal */}
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
                <div className="mt-1">{verificationBadge(previewDoc.verificationResult)}</div>
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

            <div className="flex justify-end">
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

      {/* Reject Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-red-600">
            <XCircle size={18} />
            Từ chối hồ sơ
          </div>
        }
        open={rejectModal}
        onCancel={() => { setRejectModal(false); rejectForm.resetFields(); }}
        onOk={handleRejectSubmit}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true, loading: actionLoading === "reject" }}
        cancelText="Huỷ"
      >
        <Form form={rejectForm} layout="vertical" className="mt-4">
          <Form.Item
            name="reason"
            label="Lý do từ chối"
            rules={[{ required: true, message: "Vui lòng nhập lý do từ chối" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nhập lý do từ chối hồ sơ này..."
              className="!rounded-xl"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Supplement Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-amber-600">
            <FilePlus2 size={18} />
            Yêu cầu bổ sung tài liệu
          </div>
        }
        open={supplementModal}
        onCancel={() => { setSupplementModal(false); supplementForm.resetFields(); }}
        onOk={handleSupplementSubmit}
        okText="Gửi yêu cầu"
        okButtonProps={{
          className: "!bg-amber-500 !border-amber-500",
          loading: actionLoading === "supplement",
        }}
        cancelText="Huỷ"
      >
        <Form form={supplementForm} layout="vertical" className="mt-4">
          <Form.Item
            name="note"
            label="Nội dung yêu cầu"
            rules={[{ required: true, message: "Vui lòng nhập nội dung yêu cầu" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Mô tả các tài liệu cần bổ sung..."
              className="!rounded-xl"
            />
          </Form.Item>
        </Form>
      </Modal>
    </OfficerLayout>
  );
}
