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
  Statistic,
  Table,
  Tag,
  Typography,
  message,
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

import { AdminLayout } from "../../components/layouts/AdminLayout";
import { getPayments } from "../../api/payments";
import { getApplicantById } from "../../api/applicants";
import type { GetPaymentsParams, Payment } from "../../types/payment";

const { Title, Text } = Typography;

const PAGE_SIZE_OPTIONS = ["10", "20", "50"];

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

  return new Intl.DateTimeFormat("en-US", {
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
    return { color: "green", label: "Paid", icon: <CheckCircleOutlined /> };
  }

  if (s === "pending" || s === "processing" || s === "submitted") {
    return { color: "gold", label: status ?? "Pending", icon: <ClockCircleOutlined /> };
  }

  if (s === "overdue" || s === "failed" || s === "cancelled" || s === "canceled") {
    return { color: "red", label: status ?? "Flagged", icon: <WarningOutlined /> };
  }

  return { color: "blue", label: status ?? "Unknown", icon: <ClockCircleOutlined /> };
}

function getApplicantNameFallback(applicantId: number) {
  return `Applicant #${applicantId}`;
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

        const applicantData = applicant as Record<string, unknown>;
        const rawName =
          applicantData.fullName ??
          applicantData.name ??
          applicantData.applicantName ??
          applicantData.userFullName ??
          applicantData.full_name;

        const name =
          typeof rawName === "string" && rawName.trim().length > 0
            ? rawName.trim()
            : getApplicantNameFallback(applicantId);

        return { applicantId, name };
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

  const loadPayments = async (overrideFilters?: PaymentFilters) => {
    setLoading(true);
    try {
      const activeFilters = overrideFilters ?? appliedFilters;

      const params: GetPaymentsParams = {
        sortDesc,
        pageNumber,
        pageSize,
        status: activeFilters.status,
        transactionId: activeFilters.transactionId.trim() || undefined,
        paidFrom: activeFilters.paidFrom,
        paidTo: activeFilters.paidTo,
        sortBy: activeFilters.sortBy,
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
      message.error("Failed to load payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize, sortDesc, appliedFilters]);

  const overview = useMemo(() => {
    const paid = items.filter((p) => normalizeStatus(p.paymentStatus) === "paid");
    const pending = items.filter((p) => {
      const s = normalizeStatus(p.paymentStatus);
      return s === "pending" || s === "processing" || s === "submitted";
    });
    const flagged = items.filter((p) => {
      const s = normalizeStatus(p.paymentStatus);
      return s === "overdue" || s === "failed" || s === "cancelled" || s === "canceled";
    });

    return {
      collectedAmount: paid.reduce((sum, p) => sum + (p.amount ?? 0), 0),
      pendingAmount: pending.reduce((sum, p) => sum + (p.amount ?? 0), 0),
      flaggedAmount: flagged.reduce((sum, p) => sum + (p.amount ?? 0), 0),
      paidCount: paid.length,
      pendingCount: pending.length,
      flaggedCount: flagged.length,
    };
  }, [items]);

  const getApplicantLabel = (applicantId: number) =>
    applicantNameMap[applicantId] ?? getApplicantNameFallback(applicantId);

  const columns: ColumnsType<Payment> = [
    {
      title: "Payment",
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
      title: "Applicant",
      key: "applicant",
      render: (_, record) => (
        <div>
          <div className="font-medium text-slate-900">
            {getApplicantLabel(record.applicantId)}
          </div>
          <div className="text-xs text-slate-500">
            Application #{record.applicationId}
          </div>
        </div>
      ),
    },
    {
      title: "Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (value: string) => (
        <Tag className="rounded-full border-0 bg-slate-100 px-3 py-1 text-slate-700">
          {value || "—"}
        </Tag>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (value: number) => (
        <div className="font-semibold text-slate-900">₫{formatMoney(value)}</div>
      ),
    },
    {
      title: "Status",
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
      title: "Paid at",
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
            Finance
          </Text>
        </div>
        <Title level={2} className="!mb-2 !text-slate-900">
          Payment Management
        </Title>
        <Text type="secondary">
          Track payment status, filter transactions, and review payment details.
        </Text>
      </div>

      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={6}>
          <Card
            className="rounded-2xl border border-slate-100 shadow-sm"
            styles={{ body: { padding: 20 } }}
          >
            <Statistic
              title="Collected"
              value={overview.collectedAmount}
              prefix="₫"
              formatter={(v) => formatMoney(Number(v))}
            />
            <div className="mt-2 text-sm text-emerald-600">
              {overview.paidCount} paid record(s)
            </div>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card
            className="rounded-2xl border border-slate-100 shadow-sm"
            styles={{ body: { padding: 20 } }}
          >
            <Statistic
              title="Pending"
              value={overview.pendingAmount}
              prefix="₫"
              formatter={(v) => formatMoney(Number(v))}
            />
            <div className="mt-2 text-sm text-amber-600">
              {overview.pendingCount} pending record(s)
            </div>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card
            className="rounded-2xl border border-slate-100 shadow-sm"
            styles={{ body: { padding: 20 } }}
          >
            <Statistic
              title="Flagged"
              value={overview.flaggedAmount}
              prefix="₫"
              formatter={(v) => formatMoney(Number(v))}
            />
            <div className="mt-2 text-sm text-rose-600">
              {overview.flaggedCount} overdue / failed record(s)
            </div>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card
            className="rounded-2xl border border-slate-100 shadow-sm"
            styles={{ body: { padding: 20 } }}
          >
            <Statistic title="Records" value={totalItems} />
            <div className="mt-2 text-sm text-slate-500">Current result set</div>
          </Card>
        </Col>
      </Row>

      <Card
        className="rounded-3xl border border-slate-100 shadow-sm"
        styles={{ body: { padding: 20 } }}
      >
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Title level={4} className="!mb-1">
              Payments
            </Title>
            <Text type="secondary">Filter and inspect payment records.</Text>
          </div>

          <Space wrap>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => void loadPayments()}
              loading={loading}
            >
              Refresh
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
              Reset
            </Button>
          </Space>
        </div>

        <Row gutter={[12, 12]} className="mb-5">
          <Col xs={24} md={6}>
            <Input
              allowClear
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Transaction ID"
              value={filters.transactionId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, transactionId: e.target.value }))
              }
            />
          </Col>

          <Col xs={24} md={4}>
            <Select
              className="w-full"
              placeholder="Status"
              allowClear
              value={filters.status}
              onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              options={[
                { value: "Paid", label: "Paid" },
                { value: "Pending", label: "Pending" },
                { value: "Processing", label: "Processing" },
                { value: "Overdue", label: "Overdue" },
                { value: "Failed", label: "Failed" },
              ]}
            />
          </Col>

          <Col xs={24} md={4}>
            <Select
              className="w-full"
              value={filters.sortBy}
              onChange={(value) => setFilters((prev) => ({ ...prev, sortBy: value }))}
              options={[
                { value: "paidAt", label: "Sort by date" },
                { value: "amount", label: "Sort by amount" },
                { value: "transactionId", label: "Sort by transaction" },
              ]}
            />
          </Col>

          <Col xs={24} md={4}>
            <DatePicker
              className="w-full"
              placeholder="Paid from"
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
              placeholder="Paid to"
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
                { value: true, label: "Desc" },
                { value: false, label: "Asc" },
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
              Apply filters
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
                description="No payments found"
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
          />
        </div>
      </Card>

      <Drawer
        title="Payment details"
        width={520}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {selectedPayment ? (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Payment ID">
              #{selectedPayment.paymentId}
            </Descriptions.Item>
            <Descriptions.Item label="Application ID">
              #{selectedPayment.applicationId}
            </Descriptions.Item>
            <Descriptions.Item label="Applicant">
              {getApplicantLabel(selectedPayment.applicantId)}
            </Descriptions.Item>
            <Descriptions.Item label="Applicant ID">
              #{selectedPayment.applicantId}
            </Descriptions.Item>
            <Descriptions.Item label="Amount">
              ₫{formatMoney(selectedPayment.amount)}
            </Descriptions.Item>
            <Descriptions.Item label="Method">
              {selectedPayment.paymentMethod}
            </Descriptions.Item>
            <Descriptions.Item label="Transaction ID">
              <span className="font-mono">{selectedPayment.transactionId}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Reference Code">
              {selectedPayment.referenceCode ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              <Tag color={getStatusMeta(selectedPayment.paymentStatus).color}>
                {getStatusMeta(selectedPayment.paymentStatus).label}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Paid at">
              {formatDate(selectedPayment.paidAt)}
            </Descriptions.Item>
          </Descriptions>
        ) : null}
      </Drawer>
    </AdminLayout>
  );
}