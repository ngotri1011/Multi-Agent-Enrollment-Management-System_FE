import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Input,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import type { Dayjs } from "dayjs";
import { Filter, RotateCcw } from "lucide-react";
import { getMyPayments } from "../../api/payments";
import { ApplicantLayout } from "../../components/layouts/ApplicantLayout";
import { ApplicantMenu } from "./ApplicantMenu";
import type { Payment } from "../../types/payment";

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

type PaymentFilters = {
  status?: string;
  transactionId?: string;
  paidFrom?: string;
  paidTo?: string;
};

const statusColorMap: Record<string, string> = {
  paid: "success",
  pending: "processing",
  failed: "error",
  refunded: "warning",
};

function toIsoBoundary(value: Dayjs | null, endOfDay = false): string | undefined {
  if (!value) return undefined;
  return endOfDay ? value.endOf("day").toISOString() : value.startOf("day").toISOString();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDateTime(value: string | null): string {
  if (!value) return "--";
  return new Date(value).toLocaleString("vi-VN");
}

export function ApplicantPaymentHistoryPage() {
  const [messageApi, contextHolder] = message.useMessage();
  const [rows, setRows] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState<string | undefined>(undefined);
  const [transactionId, setTransactionId] = useState("");
  const [paidRange, setPaidRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const [filters, setFilters] = useState<PaymentFilters>({});
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDesc, setSortDesc] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyPayments({
        sortDesc,
        pageNumber,
        pageSize,
        sortBy,
        ...filters,
      });
      setRows(data.items ?? []);
      setTotalCount(data.totalCount ?? 0);
    } catch {
      messageApi.error("Không thể tải lịch sử thanh toán. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [filters, messageApi, pageNumber, pageSize, sortBy, sortDesc]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const statusOptions = useMemo(() => {
    const uniq = new Set(rows.map((item) => item.paymentStatus).filter(Boolean));
    return Array.from(uniq).map((value) => ({ label: value, value }));
  }, [rows]);

  const currentPageTotal = useMemo(
    () => rows.reduce((sum, item) => sum + (item.amount || 0), 0),
    [rows],
  );

  const paidCount = useMemo(
    () => rows.filter((item) => item.paymentStatus?.toLowerCase() === "paid").length,
    [rows],
  );

  const onApplyFilters = () => {
    const nextFilters: PaymentFilters = {
      status,
      transactionId: transactionId.trim() || undefined,
      paidFrom: toIsoBoundary(paidRange?.[0] ?? null),
      paidTo: toIsoBoundary(paidRange?.[1] ?? null, true),
    };
    setPageNumber(1);
    setFilters(nextFilters);
  };

  const onResetFilters = () => {
    setStatus(undefined);
    setTransactionId("");
    setPaidRange(null);
    setFilters({});
    setSortBy(undefined);
    setSortDesc(true);
    setPageNumber(1);
    setPageSize(20);
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPageNumber(pagination.current ?? 1);
    setPageSize(pagination.pageSize ?? 20);
  };

  const columns: ColumnsType<Payment> = [
    {
      title: "Mã giao dịch",
      dataIndex: "transactionId",
      key: "transactionId",
      render: (value: string) => <Text className="!font-medium">{value}</Text>,
    },
    {
      title: "Mã hồ sơ",
      dataIndex: "applicationId",
      key: "applicationId",
      width: 110,
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 130,
      render: (value: string) => value || "--",
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      width: 150,
      render: (value: number) => <Text strong>{formatCurrency(value)}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      width: 120,
      render: (value: string) => (
        <Tag color={statusColorMap[value?.toLowerCase()] ?? "default"}>{value || "--"}</Tag>
      ),
    },
    {
      title: "Thời gian thanh toán",
      dataIndex: "paidAt",
      key: "paidAt",
      width: 190,
      render: (value: string | null) => formatDateTime(value),
    },
  ];

  return (
    <ApplicantLayout menuItems={ApplicantMenu}>
      {contextHolder}
      <div className="space-y-4">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 shadow-sm">
          <Title level={4} className="!mb-1 !text-white">
            Lịch sử thanh toán
          </Title>
          <Text className="!text-blue-100">
            Theo dõi toàn bộ giao dịch, lọc linh hoạt và phân trang theo nhu cầu.
          </Text>
        </div>

        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <Select
              allowClear
              placeholder="Trạng thái"
              value={status}
              onChange={setStatus}
              options={statusOptions}
              size="large"
            />
            <Input
              size="large"
              placeholder="Tìm theo mã giao dịch"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
            <RangePicker
              size="large"
              className="w-full"
              value={paidRange}
              onChange={(value) => setPaidRange((value as [Dayjs | null, Dayjs | null]) ?? null)}
            />
            <Space.Compact block>
              <Select
                size="large"
                value={sortBy}
                onChange={setSortBy}
                placeholder="Sắp xếp theo"
                allowClear
                options={[
                  { label: "Thời gian thanh toán", value: "paidAt" },
                  { label: "Số tiền", value: "amount" },
                  { label: "Trạng thái", value: "paymentStatus" },
                ]}
              />
              <Select
                size="large"
                value={sortDesc ? "desc" : "asc"}
                onChange={(value) => setSortDesc(value === "desc")}
                options={[
                  { label: "Mới đến cũ / Cao đến thấp", value: "desc" },
                  { label: "Cũ đến mới / Thấp đến cao", value: "asc" },
                ]}
              />
            </Space.Compact>
          </div>

          <div className="flex gap-2 mt-4">
            <Button type="primary" icon={<Filter size={14} />} onClick={onApplyFilters}>
              Áp dụng
            </Button>
            <Button icon={<RotateCcw size={14} />} onClick={onResetFilters}>
              Đặt lại
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="rounded-xl">
            <Statistic title="Tổng giao dịch (all pages)" value={totalCount} />
          </Card>
          <Card className="rounded-xl">
            <Statistic title="Đã thanh toán (trang hiện tại)" value={paidCount} />
          </Card>
          <Card className="rounded-xl">
            <Statistic title="Tổng tiền (trang hiện tại)" value={currentPageTotal} formatter={(v) => formatCurrency(Number(v || 0))} />
          </Card>
        </div>

        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <Table<Payment>
            rowKey="paymentId"
            loading={loading}
            columns={columns}
            dataSource={rows}
            pagination={{
              current: pageNumber,
              pageSize,
              total: totalCount,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50, 100],
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} giao dịch`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 920 }}
          />
        </Card>
      </div>
    </ApplicantLayout>
  );
}

