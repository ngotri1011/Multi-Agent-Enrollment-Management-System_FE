import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileQuestion,
  FilePlus2,
  LayoutDashboard,
  RefreshCw,
  Search,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  approveApplication,
  fetchAllApplications,
  rejectApplication,
  requestAdditionalDocuments,
} from "../../api/application";
import { DashboardLayout } from "../../components/DashboardLayout";
import type { SidebarMenuItem } from "../../components/DashboardSidebar";
import type { Application, ApplicationStatus } from "../../types/application";

const { Title, Text } = Typography;
const { Option } = Select;


// ─── Menu ─────────────────────────────────────────────────────────────────────

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

// ─── Status config ─────────────────────────────────────────────────────────────

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  draft:        { label: "Bản nháp",       color: "default"    },
  submitted:    { label: "Đã nộp",         color: "blue"       },
  under_review: { label: "Đang xét duyệt", color: "processing" },
  approved:     { label: "Đã chấp nhận",   color: "success"    },
  rejected:     { label: "Từ chối",        color: "error"      },
};

function getSystemEval(app: Application): { label: string; color: string } {
  if (app.status === "approved") return { label: "Đủ điều kiện", color: "success" };
  if (app.status === "rejected") return { label: "Không đủ ĐK", color: "error" };
  if (app.status === "under_review") return { label: "Cần xét thủ công", color: "orange" };
  if (!app.documents?.length) return { label: "Chưa có tài liệu", color: "warning" };
  return { label: "Chờ xử lý", color: "default" };
}

function isEscalated(app: Application) {
  return app.status === "under_review" || app.requiresReview;
}

function isMissingDocs(app: Application) {
  return !app.documents?.length;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OfficerApplications() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filters
  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">("all");
  const [filterProgram, setFilterProgram] = useState<string>("all");
  const [onlyEscalated, setOnlyEscalated] = useState(false);
  const [onlyMissingDocs, setOnlyMissingDocs] = useState(false);

  // Modals
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: number | string }>({
    open: false,
    id: "",
  });
  const [supplementModal, setSupplementModal] = useState<{ open: boolean; id: number | string }>({
    open: false,
    id: "",
  });
  const [rejectForm] = Form.useForm();
  const [supplementForm] = Form.useForm();

  // Load data
  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await fetchAllApplications();
      setApplications(data);
    } catch {
      messageApi.error("Không thể tải danh sách hồ sơ.");
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadApplications(); }, []);

  // Derived filter options
  const programOptions = useMemo(() => {
    const unique = Array.from(new Set(applications.map((a) => a.programName)));
    return unique.sort();
  }, [applications]);

  // Filtered list
  const filtered = useMemo(() => {
    return applications.filter((a) => {
      if (searchText) {
        const q = searchText.toLowerCase();
        if (
          !String(a.applicationId).toLowerCase().includes(q) &&
          !a.applicantName.toLowerCase().includes(q) &&
          !a.programName.toLowerCase().includes(q)
        )
          return false;
      }
      if (filterStatus !== "all" && a.status !== filterStatus) return false;
      if (filterProgram !== "all" && a.programName !== filterProgram) return false;
      if (onlyEscalated && !isEscalated(a)) return false;
      if (onlyMissingDocs && !isMissingDocs(a)) return false;
      return true;
    });
  }, [applications, searchText, filterStatus, filterProgram, onlyEscalated, onlyMissingDocs]);

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleApprove = async (id: number | string) => {
    const strId = String(id);
    setActionLoading(strId + "_approve");
    try {
      await approveApplication(Number(id));
      messageApi.success("Đã phê duyệt hồ sơ.");
      setApplications((prev) =>
        prev.map((a) =>
          String(a.applicationId) === strId
            ? { ...a, status: "approved" as ApplicationStatus }
            : a
        )
      );
    } catch {
      messageApi.error("Phê duyệt thất bại, vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    try {
      const values = await rejectForm.validateFields();
      const strId = String(rejectModal.id);
      setActionLoading(strId + "_reject");
      await rejectApplication(Number(rejectModal.id), values.reason);
      messageApi.success("Đã từ chối hồ sơ.");
      setApplications((prev) =>
        prev.map((a) =>
          String(a.applicationId) === strId
            ? { ...a, status: "rejected" as ApplicationStatus }
            : a
        )
      );
      setRejectModal({ open: false, id: "" });
      rejectForm.resetFields();
    } catch {
      messageApi.error("Từ chối thất bại, vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSupplementSubmit = async () => {
    try {
      const values = await supplementForm.validateFields();
      const strId = String(supplementModal.id);
      setActionLoading(strId + "_supplement");
      await requestAdditionalDocuments(Number(supplementModal.id), values.note);
      messageApi.success("Đã gửi yêu cầu bổ sung tài liệu.");
      setSupplementModal({ open: false, id: "" });
      supplementForm.resetFields();
    } catch {
      messageApi.error("Gửi yêu cầu thất bại, vui lòng thử lại.");
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Columns ──────────────────────────────────────────────────────────────

  const columns: ColumnsType<Application> = [
    {
      title: "Mã hồ sơ",
      dataIndex: "applicationId",
      key: "applicationId",
      width: 160,
      render: (id: string) => (
        <Text className="font-mono text-xs text-indigo-600 font-semibold">{id}</Text>
      ),
    },
    {
      title: "Thí sinh",
      dataIndex: "applicantName",
      key: "applicantName",
      render: (name: string, record) => (
        <div>
          <Text className="font-medium text-gray-800 block">{name}</Text>
          <Text className="text-xs text-gray-400">{record.campusName}</Text>
        </div>
      ),
    },
    {
      title: "Ngành",
      dataIndex: "programName",
      key: "programName",
      render: (prog: string, record) => (
        <div>
          <Text className="text-gray-700 text-sm block">{prog}</Text>
          <Text className="text-xs text-gray-400">{record.admissionTypeName}</Text>
        </div>
      ),
    },
    {
      title: "Ngày nộp",
      dataIndex: "submittedAt",
      key: "submittedAt",
      width: 120,
      render: (date: string) =>
        date ? (
          <Text className="text-gray-500 text-sm">
            {new Date(date).toLocaleDateString("vi-VN")}
          </Text>
        ) : (
          <Text className="text-gray-300 text-sm">—</Text>
        ),
      sorter: (a, b) =>
        new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status: ApplicationStatus, record) => {
        const cfg = statusConfig[status];
        return (
          <Space direction="vertical" size={2}>
            <Tag color={cfg.color} className="text-xs">
              {cfg.label}
            </Tag>
            {isEscalated(record) && (
              <Tag color="red" className="text-xs">
                Leo thang
              </Tag>
            )}
            {isMissingDocs(record) && (
              <Tag color="orange" className="text-xs">
                Thiếu tài liệu
              </Tag>
            )}
          </Space>
        );
      },
    },
    {
      title: "Đánh giá hệ thống",
      key: "systemEval",
      width: 160,
      render: (_: unknown, record: Application) => {
        const ev = getSystemEval(record);
        const dotColor =
          ev.color === "success" ? "bg-emerald-400"
          : ev.color === "error" ? "bg-red-400"
          : ev.color === "warning" || ev.color === "orange" ? "bg-amber-400"
          : "bg-gray-300";
        return (
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
            <Text className="text-sm text-gray-600">{ev.label}</Text>
          </div>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 180,
      fixed: "right" as const,
      render: (_: unknown, record: Application) => {
        const id = record.applicationId;
        const strId = String(id);
        const isApproved = record.status === "approved";
        const isRejected = record.status === "rejected";
        const isDone = isApproved || isRejected;

        return (
          <Space size={4}>
            <Tooltip title="Xem chi tiết">
              <Button
                size="small"
                icon={<Eye size={13} />}
                onClick={() => navigate(`/officer/applications/${strId}`)}
                className="!rounded-lg"
              />
            </Tooltip>

            <Tooltip title={isDone ? "Hồ sơ đã xử lý" : "Phê duyệt"}>
              <Popconfirm
                title="Phê duyệt hồ sơ này?"
                okText="Phê duyệt"
                cancelText="Huỷ"
                onConfirm={() => handleApprove(id)}
                disabled={isDone}
              >
                <Button
                  size="small"
                  icon={<CheckCircle2 size={13} />}
                  type="primary"
                  disabled={isDone}
                  loading={actionLoading === strId + "_approve"}
                  className="!rounded-lg !bg-emerald-500 !border-emerald-500 hover:!bg-emerald-600"
                />
              </Popconfirm>
            </Tooltip>

            <Tooltip title={isDone ? "Hồ sơ đã xử lý" : "Từ chối"}>
              <Button
                size="small"
                icon={<XCircle size={13} />}
                danger
                disabled={isDone}
                loading={actionLoading === strId + "_reject"}
                onClick={() => setRejectModal({ open: true, id })}
                className="!rounded-lg"
              />
            </Tooltip>

            <Tooltip title="Yêu cầu bổ sung">
              <Button
                size="small"
                icon={<FilePlus2 size={13} />}
                disabled={isRejected}
                loading={actionLoading === strId + "_supplement"}
                onClick={() => setSupplementModal({ open: true, id })}
                className="!rounded-lg !text-amber-600 !border-amber-300 hover:!border-amber-400"
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  const activeFilterCount = [
    filterStatus !== "all",
    filterProgram !== "all",
    onlyEscalated,
    onlyMissingDocs,
  ].filter(Boolean).length;

  return (
    <DashboardLayout menuItems={menuItems}>
      {contextHolder}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Title level={4} className="!mb-1 !text-gray-800 !font-bold">
            Quản Lý Hồ Sơ Tuyển Sinh
          </Title>
          <Text className="text-gray-400 text-sm">
            Danh sách toàn bộ hồ sơ đăng ký — {filtered.length} / {applications.length} hồ sơ
          </Text>
        </div>
        <Button
          icon={<RefreshCw size={14} />}
          onClick={loadApplications}
          loading={loading}
          className="!rounded-xl"
        >
          Làm mới
        </Button>
      </div>

      {/* Filter Card */}
      <Card
        className="rounded-2xl border border-gray-100 shadow-sm mb-4"
        styles={{ body: { padding: "16px 20px" } }}
      >
        <Row gutter={[12, 12]} align="middle">
          {/* Search */}
          <Col xs={24} md={6}>
            <Input
              placeholder="Tìm mã hồ sơ, thí sinh, ngành..."
              prefix={<Search size={14} className="text-gray-300" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="!rounded-xl"
            />
          </Col>

          {/* Ngành */}
          <Col xs={12} md={5}>
            <Select
              value={filterProgram}
              onChange={setFilterProgram}
              className="w-full !rounded-xl"
              placeholder="Ngành"
            >
              <Option value="all">Tất cả ngành</Option>
              {programOptions.map((p) => (
                <Option key={p} value={p}>
                  {p}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Trạng thái */}
          <Col xs={12} md={5}>
            <Select
              value={filterStatus}
              onChange={setFilterStatus}
              className="w-full !rounded-xl"
              placeholder="Trạng thái"
            >
              <Option value="all">Tất cả trạng thái</Option>
              {(Object.keys(statusConfig) as ApplicationStatus[]).map((s) => (
                <Option key={s} value={s}>
                  {statusConfig[s].label}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Checkboxes */}
          <Col xs={24} md={8}>
            <Space size={16}>
              <Checkbox
                checked={onlyEscalated}
                onChange={(e) => setOnlyEscalated(e.target.checked)}
                className="text-sm"
              >
                <span className="flex items-center gap-1 text-rose-600">
                  <AlertTriangle size={13} />
                  Hồ sơ leo thang
                </span>
              </Checkbox>
              <Checkbox
                checked={onlyMissingDocs}
                onChange={(e) => setOnlyMissingDocs(e.target.checked)}
                className="text-sm"
              >
                <span className="flex items-center gap-1 text-amber-600">
                  <FileQuestion size={13} />
                  Thiếu tài liệu
                </span>
              </Checkbox>
              {activeFilterCount > 0 && (
                <Button
                  size="small"
                  type="link"
                  className="!p-0 !text-gray-400"
                  onClick={() => {
                    setFilterStatus("all");
                    setFilterProgram("all");
                    setOnlyEscalated(false);
                    setOnlyMissingDocs(false);
                    setSearchText("");
                  }}
                >
                  Xoá bộ lọc ({activeFilterCount})
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card
        className="rounded-2xl border border-gray-100 shadow-sm"
        styles={{ body: { padding: "0" } }}
      >
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filtered}
            rowKey="applicationId"
            scroll={{ x: 960 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} hồ sơ`,
              pageSizeOptions: ["10", "20", "50"],
            }}
            rowClassName={(record) =>
              isEscalated(record)
                ? "bg-rose-50/40 hover:bg-rose-50"
                : "hover:bg-gray-50 transition-colors"
            }
            expandable={{
              expandedRowRender: (record) =>
                record.notes ? (
                  <div className="mx-4 my-2 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide block mb-2">
                      Ghi chú từ Agent
                    </span>
                    <Text className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                      {record.notes}
                    </Text>
                  </div>
                ) : (
                  <div className="px-4 py-3 text-gray-400 text-sm italic">
                    Không có ghi chú từ hệ thống.
                  </div>
                ),
              rowExpandable: (record) => !!record.notes,
            }}
            size="middle"
          />
        </Spin>
      </Card>

      {/* Reject Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-red-600">
            <XCircle size={18} />
            Từ chối hồ sơ
          </div>
        }
        open={rejectModal.open}
        onCancel={() => {
          setRejectModal({ open: false, id: "" });
          rejectForm.resetFields();
        }}
        onOk={handleRejectSubmit}
        okText="Xác nhận từ chối"
        okButtonProps={{ danger: true }}
        cancelText="Huỷ"
        confirmLoading={actionLoading === rejectModal.id + "_reject"}
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
        open={supplementModal.open}
        onCancel={() => {
          setSupplementModal({ open: false, id: "" });
          supplementForm.resetFields();
        }}
        onOk={handleSupplementSubmit}
        okText="Gửi yêu cầu"
        okButtonProps={{ className: "!bg-amber-500 !border-amber-500" }}
        cancelText="Huỷ"
        confirmLoading={actionLoading === supplementModal.id + "_supplement"}
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
