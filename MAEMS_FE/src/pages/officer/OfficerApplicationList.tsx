import {
  Button,
  Card,
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
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  FilePlus2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getActiveAdmissionTypesBasic,
} from "../../api/admission-types";
import {
  fetchAllApplications,
  patchApplication,
} from "../../api/applications";
import { getActiveBasicCampuses } from "../../api/campuses";
import { getActiveProgramsBasic } from "../../api/programs";
import { OfficerLayout } from "../../components/layouts/OfficerLayout";
import type { AdmissionTypeBasic } from "../../types/admission.type";
import type { Application, ApplicationStatus } from "../../types/application";
import type { CampusBasic } from "../../types/campus";
import type { ProgramBasic } from "../../types/program";

const { Title, Text } = Typography;
const { Option } = Select;

// ─── Status config ─────────────────────────────────────────────────────────────

const statusConfig: Record<ApplicationStatus, { label: string; color: string }> = {
  draft:             { label: "Bản nháp",             color: "default"    },
  submitted:         { label: "Đã nộp",               color: "blue"       },
  under_review:      { label: "Chờ NV xét duyệt",     color: "processing" },
  approved:          { label: "Đã chấp nhận",          color: "success"    },
  rejected:          { label: "Từ chối",               color: "error"      },
  document_required: { label: "Cần bổ sung tài liệu", color: "warning"    },
};

function isEscalated(app: Application) {
  return app.status === "under_review" || app.requiresReview;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OfficerApplicationList() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // ── Server-side filter / sort / page params ──────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState<string | undefined>();
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | "all">("all");
  const [filterCampusId, setFilterCampusId] = useState<number | "all">("all");
  const [filterProgramId, setFilterProgramId] = useState<number | "all">("all");
  const [filterAdmissionTypeId, setFilterAdmissionTypeId] = useState<number | "all">("all");
  const [onlyEscalated, setOnlyEscalated] = useState(false);
  const [pageNumber, setPageNumber]   = useState(1);
  const [pageSize, setPageSize]       = useState(20);
  const [sortBy, setSortBy]           = useState<string | undefined>();
  /** Mặc định true: API trả đơn mới nhất trước; false thì ngược lại (khi chưa chọn sort theo cột). */
  const [sortDesc, setSortDesc]       = useState(true);
  const [campuses, setCampuses] = useState<CampusBasic[]>([]);
  const [programs, setPrograms] = useState<ProgramBasic[]>([]);
  const [admissionTypes, setAdmissionTypes] = useState<AdmissionTypeBasic[]>([]);

  // Debounce search input (500 ms)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value || undefined);
      setPageNumber(1);
    }, 500);
  };

  // Modals
  const [rejectModal, setRejectModal] = useState<{ open: boolean; id: number | string }>({
    open: false, id: "",
  });
  const [supplementModal, setSupplementModal] = useState<{ open: boolean; id: number | string }>({
    open: false, id: "",
  });
  const [rejectForm] = Form.useForm();
  const [supplementForm] = Form.useForm();

  // ── Load data ─────────────────────────────────────────────────────────────
  const loadFilterOptions = useCallback(async () => {
    try {
      const [campusData, programData, admissionTypeData] = await Promise.all([
        getActiveBasicCampuses(),
        getActiveProgramsBasic(),
        getActiveAdmissionTypesBasic(),
      ]);
      setCampuses(campusData);
      setPrograms(programData);
      setAdmissionTypes(admissionTypeData);
    } catch {
      messageApi.error("Không thể tải dữ liệu bộ lọc.");
    }
  }, [messageApi]);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchAllApplications({
        search,
        campusId: filterCampusId !== "all" ? filterCampusId : undefined,
        programId: filterProgramId !== "all" ? filterProgramId : undefined,
        admissionTypeId: filterAdmissionTypeId !== "all" ? filterAdmissionTypeId : undefined,
        status:         filterStatus !== "all" ? filterStatus : undefined,
        requiresReview: onlyEscalated ? true : undefined,
        pageNumber,
        pageSize,
        sortBy,
        sortDesc: sortBy ? sortDesc : true,
      });
      setApplications(result.items);
      setTotalCount(result.totalCount);
    } catch {
      messageApi.error("Không thể tải danh sách hồ sơ.");
    } finally {
      setLoading(false);
    }
  }, [search, filterCampusId, filterProgramId, filterAdmissionTypeId, filterStatus, onlyEscalated, pageNumber, pageSize, sortBy, sortDesc, messageApi]);

  useEffect(() => { loadApplications(); }, [loadApplications]);
  useEffect(() => { loadFilterOptions(); }, [loadFilterOptions]);

  // ── Table change handler (sort + page) ────────────────────────────────────
  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: unknown,
    sorter: SorterResult<Application> | SorterResult<Application>[],
  ) => {
    if (pagination.current)  setPageNumber(pagination.current);
    if (pagination.pageSize) setPageSize(pagination.pageSize);

    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (s?.columnKey && s.order) {
      setSortBy(String(s.columnKey));
      setSortDesc(s.order === "descend");
    } else {
      setSortBy(undefined);
      setSortDesc(true);
    }
  };

  // ── Filter change helpers (reset to page 1) ───────────────────────────────
  const handleStatusChange = (val: ApplicationStatus | "all") => {
    setFilterStatus(val);
    setPageNumber(1);
  };

  const handleEscalatedChange = (checked: boolean) => {
    setOnlyEscalated(checked);
    setPageNumber(1);
  };

  const handleCampusChange = (val: number | "all") => {
    setFilterCampusId(val);
    setPageNumber(1);
  };

  const handleProgramChange = (val: number | "all") => {
    setFilterProgramId(val);
    setPageNumber(1);
  };

  const handleAdmissionTypeChange = (val: number | "all") => {
    setFilterAdmissionTypeId(val);
    setPageNumber(1);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch(undefined);
    setFilterStatus("all");
    setFilterCampusId("all");
    setFilterProgramId("all");
    setFilterAdmissionTypeId("all");
    setOnlyEscalated(false);
    setPageNumber(1);
    setSortBy(undefined);
    setSortDesc(true);
  };

  // ─── Actions ──────────────────────────────────────────────────────────────

  const handleApprove = async (id: number | string) => {
    const strId = String(id);
    setActionLoading(strId + "_approve");
    try {
      await patchApplication(Number(id), { status: "approved" });
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
      await rejectForm.validateFields();
      const strId = String(rejectModal.id);
      setActionLoading(strId + "_reject");
      await patchApplication(Number(rejectModal.id), { status: "rejected" });
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
      await supplementForm.validateFields();
      const strId = String(supplementModal.id);
      setActionLoading(strId + "_supplement");
      await patchApplication(Number(supplementModal.id), { status: "document_required" });
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
      width: 120,
      render: (id: string) => (
        <Text className="font-mono text-xs text-indigo-600 font-semibold">{id}</Text>
      ),
    },
    {
      title: "Thí sinh",
      dataIndex: "applicantName",
      key: "applicantName",
      sorter: true,
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
      sorter: true,
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
      sorter: true,
      render: (date: string) =>
        date ? (
          <Text className="text-gray-500 text-sm">
            {new Date(date).toLocaleDateString("vi-VN")}
          </Text>
        ) : (
          <Text className="text-gray-300 text-sm">—</Text>
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status: ApplicationStatus) => {
        const cfg = statusConfig[status];
        return (
          <Tag color={cfg.color} className="text-xs">
            {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "Hành động",
      key: "actions",
      width: 160,
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

  // ─── Active filter badge count ────────────────────────────────────────────

  const activeFilterCount = [
    !!search,
    filterStatus !== "all",
    filterCampusId !== "all",
    filterProgramId !== "all",
    filterAdmissionTypeId !== "all",
    onlyEscalated,
  ].filter(Boolean).length;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <OfficerLayout>
      {contextHolder}

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Title level={4} className="!mb-1 !text-gray-800 !font-bold">
            Quản Lý Hồ Sơ Tuyển Sinh
          </Title>
          <Text className="text-gray-400 text-sm">
            Tổng cộng {totalCount} hồ sơ
            {activeFilterCount > 0 && ` (đang lọc)`}
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
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              allowClear
              onClear={() => handleSearchChange("")}
              className="!rounded-xl"
            />
          </Col>

          {/* Trạng thái */}
          <Col xs={12} md={4}>
            <Select
              value={filterStatus}
              onChange={handleStatusChange}
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

          {/* Cơ sở */}
          <Col xs={12} md={4}>
            <Select
              value={filterCampusId}
              onChange={handleCampusChange}
              className="w-full !rounded-xl"
              placeholder="Cơ sở"
            >
              <Option value="all">Tất cả cơ sở</Option>
              {campuses.map((campus) => (
                <Option key={campus.campusId} value={campus.campusId}>
                  {campus.name}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Ngành */}
          <Col xs={12} md={4}>
            <Select
              value={filterProgramId}
              onChange={handleProgramChange}
              className="w-full !rounded-xl"
              placeholder="Ngành"
              showSearch
              optionFilterProp="children"
            >
              <Option value="all">Tất cả ngành</Option>
              {programs.map((program) => (
                <Option key={program.programId} value={program.programId}>
                  {program.programName}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Phương thức tuyển sinh */}
          <Col xs={12} md={4}>
            <Select
              value={filterAdmissionTypeId}
              onChange={handleAdmissionTypeChange}
              className="w-full !rounded-xl"
              placeholder="Phương thức"
            >
              <Option value="all">Tất cả phương thức</Option>
              {admissionTypes.map((admissionType) => (
                <Option key={admissionType.admissionTypeId} value={admissionType.admissionTypeId}>
                  {admissionType.admissionTypeName}
                </Option>
              ))}
            </Select>
          </Col>

          {/* Hồ sơ leo thang */}
          <Col xs={12} md={4}>
            <Select
              value={onlyEscalated ? "escalated" : "all"}
              onChange={(v) => handleEscalatedChange(v === "escalated")}
              className="w-full !rounded-xl"
            >
              <Option value="all">Tất cả hồ sơ</Option>
              <Option value="escalated">
                <span className="flex items-center gap-1 text-rose-600">
                  <AlertTriangle size={13} />
                  Hồ sơ cần xem xét
                </span>
              </Option>
            </Select>
          </Col>

          {/* Xoá bộ lọc */}
          {activeFilterCount > 0 && (
            <Col xs={24} md={2}>
              <Button
                size="small"
                type="link"
                className="!p-0 !text-gray-400"
                onClick={clearFilters}
              >
                Xoá bộ lọc ({activeFilterCount})
              </Button>
            </Col>
          )}
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
            dataSource={applications}
            rowKey="applicationId"
            scroll={{ x: 900 }}
            onChange={handleTableChange}
            pagination={{
              current: pageNumber,
              pageSize,
              total: totalCount,
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
    </OfficerLayout>
  );
}
