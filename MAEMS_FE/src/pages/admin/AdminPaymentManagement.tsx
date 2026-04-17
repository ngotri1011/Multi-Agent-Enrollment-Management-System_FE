import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Drawer,
  Empty,
  Input,
  Pagination,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminLayout } from "../../layouts/AdminLayout";
import { getPayments } from "../../api/payments";
import { getApplicantById } from "../../api/applicants";
import { getEnrollmentYears } from "../../api/enrollment-years";
import { getQuarterlyPaymentRevenue } from "../../api/reports";
import type { GetPaymentsParams, Payment } from "../../types/payment";
import type { EnrollmentYear } from "../../types/enrollment-years";
import type { QuarterlyPaymentRevenue } from "../../types/report";

const { Title, Text } = Typography;

const PAGE_SIZE_OPTIONS = ["10", "20", "50"];
const CURRENT_YEAR = new Date().getFullYear();

type PaymentFilters = {
  status?: string;
  transactionId: string;
  paidFrom?: string;
  paidTo?: string;
  sortBy?: string;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}


function normalizeStatus(status?: string | null) {
  return (status ?? "").trim().toLowerCase();
}

function getStatusMeta(status?: string | null) {
  const s = normalizeStatus(status);

  if (s === "paid") {
    return { color: "green", label: "Đã thanh toán", icon: <CheckCircleOutlined /> };
  }

  if (s === "pending" || s === "processing" || s === "submitted") {
    return { color: "gold", label: "Đang xử lý", icon: <ClockCircleOutlined /> };
  }

  if (s === "overdue" || s === "failed" || s === "cancelled" || s === "canceled") {
    return { color: "red", label: "Cần kiểm tra", icon: <WarningOutlined /> };
  }

  return { color: "blue", label: status ?? "Không rõ", icon: <ClockCircleOutlined /> };
}

function getApplicantNameFromResponse(applicant: unknown, applicantId: number) {
  const data = applicant as Record<string, unknown>;

  const candidates = [
    data.fullName,
    data.name,
    data.applicantName,
    data.userFullName,
    data.full_name,
  ];

  const found = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  return found?.toString().trim() || `Thí sinh #${applicantId}`;
}

function quartersToChartData(quarters: QuarterlyPaymentRevenue["quarters"]) {
  const map = new Map<number, number>();

  for (const item of quarters) {
    map.set(item.quarter, item.totalAmount);
  }

  return [1, 2, 3, 4].map((quarter) => ({
    quarter: `Quý ${quarter}`,
    totalAmount: map.get(quarter) ?? 0,
  }));
}

function getHighestQuarter(quarters: QuarterlyPaymentRevenue["quarters"]) {
  if (quarters.length === 0) {
    return { quarter: 0, totalAmount: 0 };
  }

  return quarters.reduce((max, item) =>
    item.totalAmount > max.totalAmount ? item : max,
  );
}

export function AdminPaymentManagement() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Payment[]>([]);
  const [totalItems, setTotalItems] = useState(0);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortDesc, setSortDesc] = useState(true);

  const [filters, setFilters] = useState<PaymentFilters>({
    status: undefined,
    transactionId: "",
    paidFrom: undefined,
    paidTo: undefined,
    sortBy: "paidAt",
  });
  const [appliedFilters, setAppliedFilters] = useState<PaymentFilters>({
    status: undefined,
    transactionId: "",
    paidFrom: undefined,
    paidTo: undefined,
    sortBy: "paidAt",
  });

  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [applicantNameMap, setApplicantNameMap] = useState<Record<number, string>>(
    {},
  );

  const [years, setYears] = useState<EnrollmentYear[]>([]);
  const [yearsLoading, setYearsLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);

  const [quarterlyRevenue, setQuarterlyRevenue] =
    useState<QuarterlyPaymentRevenue | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);


  const yearOptions = useMemo(() => {
    const options = years.map((item) => ({
      value: Number(item.year),
      label: `Năm ${item.year}`,
    }));

    if (!options.some((option) => option.value === selectedYear)) {
      options.unshift({
        value: selectedYear,
        label: `Năm ${selectedYear} (mặc định)`,
      });
    }

    return options;
  }, [years, selectedYear]);

  const loadApplicantNames = async (records: Payment[]) => {
    const uniqueApplicantIds = Array.from(
      new Set(records.map((record) => record.applicantId).filter(Boolean)),
    );

    const missingApplicantIds = uniqueApplicantIds.filter(
      (id) => !applicantNameMap[id],
    );

    if (missingApplicantIds.length === 0) return;

    const results = await Promise.allSettled(
      missingApplicantIds.map(async (applicantId) => {
        const applicant = await getApplicantById(applicantId);
        return {
          applicantId,
          name: getApplicantNameFromResponse(applicant, applicantId),
        };
      }),
    );

    const nextMap: Record<number, string> = {};

    for (const result of results) {
      if (result.status === "fulfilled") {
        nextMap[result.value.applicantId] = result.value.name;
      }
    }

    if (Object.keys(nextMap).length > 0) {
      setApplicantNameMap((prev) => ({
        ...prev,
        ...nextMap,
      }));
    }
  };

  const loadPayments = async () => {
    setLoading(true);
    try {
      const params: GetPaymentsParams = {
        sortDesc,
        pageNumber,
        pageSize,
        status: appliedFilters.status,
        transactionId: appliedFilters.transactionId.trim() || undefined,
        paidFrom: appliedFilters.paidFrom,
        paidTo: appliedFilters.paidTo,
        sortBy: appliedFilters.sortBy,
      };

      const res = await getPayments(params);
      const nextItems = res?.items ?? [];
      setItems(nextItems);

      const total =
        (res as unknown as { totalCount?: number; totalItems?: number; total?: number })
          ?.totalCount ??
        (res as unknown as { totalCount?: number; totalItems?: number; total?: number })
          ?.totalItems ??
        (res as unknown as { totalCount?: number; totalItems?: number; total?: number })
          ?.total ??
        nextItems.length;

      setTotalItems(total);

      await loadApplicantNames(nextItems);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  const loadYears = async () => {
    setYearsLoading(true);
    try {
      const res = await getEnrollmentYears();
      const nextYears = Array.isArray(res) ? res : [];

      const sortedYears = [...nextYears].sort(
        (a, b) => Number(b.year) - Number(a.year),
      );

      setYears(sortedYears);

      if (sortedYears.length > 0) {
        const currentYearInList = sortedYears.find(
          (item) => Number(item.year) === CURRENT_YEAR,
        );

        if (currentYearInList) {
          setSelectedYear(CURRENT_YEAR);
        } else {
          setSelectedYear(Number(sortedYears[0].year));
        }
      }
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách năm tuyển sinh.");
    } finally {
      setYearsLoading(false);
    }
  };

  const loadQuarterlyRevenue = async (year: number) => {
    setRevenueLoading(true);
    try {
      const res = await getQuarterlyPaymentRevenue(year);
      setQuarterlyRevenue(res ?? null);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải báo cáo doanh thu theo quý.");
    } finally {
      setRevenueLoading(false);
    }
  };

  useEffect(() => {
    void loadYears();
  }, []);

  useEffect(() => {
    void loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize, sortDesc, appliedFilters]);

  useEffect(() => {
    if (!selectedYear) return;
    void loadQuarterlyRevenue(selectedYear);
  }, [selectedYear]);

  const combinedRevenue = useMemo(() => {
    return (quarterlyRevenue?.quarters ?? []).reduce(
      (sum, item) => sum + item.totalAmount,
      0,
    );
  }, [quarterlyRevenue]);

  const highestQuarter = useMemo(() => {
    return getHighestQuarter(quarterlyRevenue?.quarters ?? []);
  }, [quarterlyRevenue]);

  const chartData = useMemo(() => {
    return quartersToChartData(quarterlyRevenue?.quarters ?? []);
  }, [quarterlyRevenue]);

  const getApplicantLabel = (applicantId: number) =>
    applicantNameMap[applicantId] ?? `Thí sinh #${applicantId}`;

  const columns: ColumnsType<Payment> = [
    {
      title: "Mã thanh toán",
      key: "payment",
      render: (_, record) => (
        <div>
          <div className="font-semibold text-slate-900">#{record.paymentId}</div>
          <div className="font-mono text-xs text-slate-500 truncate max-w-[240px]">
            {record.transactionId}
          </div>
        </div>
      ),
    },
    {
      title: "Người nộp",
      key: "applicant",
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">
            {getApplicantLabel(record.applicantId)}
          </div>
          <div className="text-xs text-slate-500">Hồ sơ #{record.applicationId}</div>
        </div>
      ),
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (value: string) => (
        <Tag className="rounded-full border-0 bg-slate-100 px-3 py-1 text-slate-700">
          {value || "—"}
        </Tag>
      ),
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (value: number) => (
        <div className="font-semibold text-slate-900">₫{formatMoney(value)}</div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (value: string) => {
        const meta = getStatusMeta(value);
        return (
          <Tag color={meta.color} icon={meta.icon} className="rounded-full px-3 py-1">
            {meta.label}
          </Tag>
        );
      },
    },
    {
      title: "Ngày thanh toán",
      dataIndex: "paidAt",
      key: "paidAt",
      render: (value: string | null) => (
        <span className="text-slate-600">{formatDate(value)}</span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 70,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedPayment(record);
            setDrawerOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <Badge status="processing" />
          <Text className="uppercase tracking-[0.22em] text-xs text-slate-500">
            Tài chính
          </Text>
        </div>
        <Title level={2} className="!mb-2 !text-slate-900">
          Quản lý thanh toán
        </Title>
        <Text type="secondary">
          Theo dõi thanh toán, lọc giao dịch và xem doanh thu theo năm.
        </Text>
      </div>
    <div className="mb-6">
      <Card
        className="rounded-3xl border border-slate-100 shadow-sm mb-6"
        styles={{ body: { padding: 20 } }}
      >
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Title level={4} className="!mb-1">
              Doanh thu theo quý
            </Title>
            <Text type="secondary">
              Chọn năm tuyển sinh để xem tổng doanh thu từng quý.
            </Text>
          </div>

          <div className="min-w-[240px]">
            <Text className="mb-1 block text-xs uppercase tracking-[0.18em] text-slate-500">
              Năm tuyển sinh
            </Text>
            <Select
              className="w-full"
              loading={yearsLoading}
              value={selectedYear}
              placeholder="Chọn năm"
              onChange={(value) => setSelectedYear(value)}
              options={yearOptions}
            />
          </div>
        </div>

        <Row gutter={[16, 16]} className="mb-5">
          <Col xs={24} md={8}>
            <Card
              className="rounded-2xl border border-slate-100 bg-slate-50"
              styles={{ body: { padding: 18 } }}
            >
              <div className="text-sm text-slate-500">Tổng doanh thu trong năm</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                ₫{formatMoney(combinedRevenue)}
              </div>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              className="rounded-2xl border border-slate-100 bg-slate-50"
              styles={{ body: { padding: 18 } }}
            >
              <div className="text-sm text-slate-500">Số khoản cần kiểm tra</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {quarterlyRevenue?.numPaymentNeedCheck ?? 0}
              </div>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              className="rounded-2xl border border-slate-100 bg-slate-50"
              styles={{ body: { padding: 18 } }}
            >
              <div className="text-sm text-slate-500">Quý cao nhất</div>
              <div className="mt-1 text-lg font-semibold text-slate-900">
                {highestQuarter.quarter ? `Quý ${highestQuarter.quarter}` : "—"}
              </div>
              <div className="mt-1 text-sm text-slate-500">
                ₫{formatMoney(highestQuarter.totalAmount || 0)}
              </div>
            </Card>
          </Col>
        </Row>

        <div style={{ width: "100%", height: 320 }}>
          {revenueLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spin />
            </div>
          ) : (
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => formatMoney(Number(value))} />
                <Tooltip
                  formatter={(value) => [`₫${formatMoney(Number(value))}`, "Doanh thu"]}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="totalAmount" fill="#3b82f6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
      

      <Card
        className="rounded-3xl border border-slate-100 shadow-sm"
        styles={{ body: { padding: 20 } }}
      >
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Title level={4} className="!mb-1">
              Danh sách thanh toán
            </Title>
            <Text type="secondary">
              Lọc theo mã giao dịch, trạng thái hoặc thời gian thanh toán.
            </Text>
          </div>

          <Space wrap>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => void loadPayments()}
              loading={loading}
            >
              Tải lại
            </Button>
            <Button
              icon={<FilterOutlined />}
              onClick={() => {
                const resetFilters: PaymentFilters = {
                  status: undefined,
                  transactionId: "",
                  paidFrom: undefined,
                  paidTo: undefined,
                  sortBy: "paidAt",
                };

                setFilters(resetFilters);
                setAppliedFilters(resetFilters);
                setPageNumber(1);
                setPageSize(20);
                setSortDesc(true);
              }}
            >
              Đặt lại
            </Button>
          </Space>
        </div>

        <Row gutter={[12, 12]} className="mb-5">
          <Col xs={24} md={6}>
            <Input
              allowClear
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Mã giao dịch"
              value={filters.transactionId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, transactionId: e.target.value }))
              }
            />
          </Col>

          <Col xs={24} md={4}>
            <Select
              className="w-full"
              placeholder="Trạng thái"
              allowClear
              value={filters.status}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              options={[
                { value: "Paid", label: "Đã thanh toán" },
                { value: "Pending", label: "Đang chờ" },
                { value: "Processing", label: "Đang xử lý" },
                { value: "Overdue", label: "Quá hạn" },
                { value: "Failed", label: "Thất bại" },
              ]}
            />
          </Col>

          <Col xs={24} md={4}>
            <Select
              className="w-full"
              value={filters.sortBy}
              onChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
              options={[
                { value: "paidAt", label: "Sắp xếp theo ngày" },
                { value: "amount", label: "Sắp xếp theo số tiền" },
                { value: "transactionId", label: "Sắp xếp theo mã GD" },
              ]}
            />
          </Col>

          <Col xs={24} md={4}>
            <DatePicker
              className="w-full"
              placeholder="Từ ngày"
              value={filters.paidFrom ? dayjs(filters.paidFrom) : null}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  paidFrom: value ? value.format("YYYY-MM-DD") : undefined,
                }))
              }
            />
          </Col>

          <Col xs={24} md={4}>
            <DatePicker
              className="w-full"
              placeholder="Đến ngày"
              value={filters.paidTo ? dayjs(filters.paidTo) : null}
              onChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  paidTo: value ? value.format("YYYY-MM-DD") : undefined,
                }))
              }
            />
          </Col>

          <Col xs={24} md={2}>
            <Select
              className="w-full"
              value={sortDesc}
              onChange={(value) => setSortDesc(value)}
              options={[
                { value: true, label: "Giảm dần" },
                { value: false, label: "Tăng dần" },
              ]}
            />
          </Col>

          <Col xs={24} className="flex justify-end">
            <Button
              type="primary"
              onClick={() => {
                setPageNumber(1);
                setAppliedFilters({ ...filters });
              }}
            >
              Áp dụng bộ lọc
            </Button>
          </Col>
        </Row>

        <Table<Payment>
          rowKey="paymentId"
          loading={loading}
          columns={columns}
          dataSource={items}
          pagination={false}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không tìm thấy thanh toán nào"
              />
            ),
          }}
          scroll={{ x: 1080 }}
        />

        <div className="mt-5 flex justify-end">
          <Pagination
            current={pageNumber}
            pageSize={pageSize}
            total={totalItems}
            showSizeChanger
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onChange={(nextPage, nextSize) => {
              setPageNumber(nextPage);
              setPageSize(nextSize);
            }}
            locale={{ items_per_page: "/ trang" }}
          />
        </div>
      </Card>

      <Drawer
        title="Chi tiết thanh toán"
        width={520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedPayment ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Mã thanh toán">
              #{selectedPayment.paymentId}
            </Descriptions.Item>
            <Descriptions.Item label="Hồ sơ">
              #{selectedPayment.applicationId}
            </Descriptions.Item>
            <Descriptions.Item label="Người nộp">
              {getApplicantLabel(selectedPayment.applicantId)}
            </Descriptions.Item>
            <Descriptions.Item label="Mã thí sinh">
              #{selectedPayment.applicantId}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              ₫{formatMoney(selectedPayment.amount)}
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức">
              {selectedPayment.paymentMethod}
            </Descriptions.Item>
            <Descriptions.Item label="Mã giao dịch">
              <span className="font-mono">{selectedPayment.transactionId}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Mã tham chiếu">
              {selectedPayment.referenceCode ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusMeta(selectedPayment.paymentStatus).color}>
                {getStatusMeta(selectedPayment.paymentStatus).label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày thanh toán">
              {formatDate(selectedPayment.paidAt)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Drawer>
    </AdminLayout>
  );
}