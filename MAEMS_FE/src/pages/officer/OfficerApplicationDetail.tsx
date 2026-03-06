import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
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
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FilePlus2,
  FileText,
  LayoutDashboard,
  RefreshCw,
  ShieldCheck,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  approveApplication,
  fetchApplicationDetail,
  rejectApplication,
  requestAdditionalDocuments,
} from "../../api/application";
import { DashboardLayout } from "../../components/DashboardLayout";
import type { SidebarMenuItem } from "../../components/DashboardSidebar";
import type {
  Application,
  ApplicationStatus,
  Document,
} from "../../types/application";

const { Title, Text } = Typography;

// ─── Menu ────────────────────────────────────────────────────────────────────

const menuItems: SidebarMenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
    path: "/officer/dashboard",
  },
  {
    key: "review-applications",
    label: "Đánh giá đơn ĐK",
    icon: <ClipboardList size={16} />,
    path: "/officer/review-applications",
  },
  {
    key: "escalations",
    label: "Các trường hợp leo thang",
    icon: <AlertTriangle size={16} />,
    path: "/officer/escalations",
  },
  {
    key: "reports",
    label: "Báo cáo",
    icon: <BarChart2 size={16} />,
    path: "/officer/reports",
  },
  {
    key: "profile",
    label: "Hồ sơ cá nhân",
    icon: <User size={16} />,
    path: "/officer/profile",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<ApplicationStatus, { label: string; color: string }> =
  {
    draft: { label: "Bản nháp", color: "default" },
    submitted: { label: "Đã nộp", color: "blue" },
    under_review: { label: "Đang xét duyệt", color: "processing" },
    approved: { label: "Đã chấp nhận", color: "success" },
    rejected: { label: "Từ chối", color: "error" },
  };


function verificationBadge(result: string) {
  const r = result?.toLowerCase();
  if (r === "passed" || r === "verified")
    return <Badge status="success" text="Đã xác minh" />;
  if (r === "failed" || r === "rejected")
    return <Badge status="error" text="Không hợp lệ" />;
  return <Badge status="default" text={result || "Chưa xác minh"} />;
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
  const [rejectForm] = Form.useForm();
  const [supplementForm] = Form.useForm();

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
      await approveApplication(app.applicationId);
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
      const values = await rejectForm.validateFields();
      setActionLoading("reject");
      await rejectApplication(app.applicationId, values.reason);
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
      const values = await supplementForm.validateFields();
      setActionLoading("supplement");
      await requestAdditionalDocuments(app.applicationId, values.note);
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
    <DashboardLayout menuItems={menuItems}>
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
                        Leo thang
                      </Tag>
                    )}
                  </Space>
                </div>

                <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                  <Descriptions.Item label="Thí sinh">
                    <Text className="font-semibold text-gray-800">
                      {app.applicantName}
                    </Text>
                  </Descriptions.Item>
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
                </div>
                {app.notes ? (
                  <Text className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
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
                  <div className="space-y-3">
                    {app.documents.map((doc: Document) => (
                      <div
                        key={doc.documentId}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <FileText size={16} className="text-indigo-400" />
                          </div>
                          <div className="min-w-0">
                            <Text className="font-medium text-gray-700 text-sm block truncate">
                              {doc.fileName || doc.documentType}
                            </Text>
                            <div className="flex items-center gap-2 mt-0.5">
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
                            {doc.verificationDetails && (
                              <Text className="text-xs text-gray-400 block mt-0.5 italic">
                                {doc.verificationDetails}
                              </Text>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {verificationBadge(doc.verificationResult)}
                          {doc.filePath && (
                            <Button
                              size="small"
                              type="link"
                              icon={<ExternalLink size={13} />}
                              href={doc.filePath}
                              target="_blank"
                              className="!p-0"
                            />
                          )}
                        </div>
                      </div>
                    ))}
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
    </DashboardLayout>
  );
}
