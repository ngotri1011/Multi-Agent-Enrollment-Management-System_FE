import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography,
  message as antMessage,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  BookOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  MessageOutlined,
  ReloadOutlined,
  RobotOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { QALayout } from "../../layouts/QALayout";
import {
  getLlmChatLogById,
  getLlmChatLogs,
} from "../../api/llm-chat-logs";
import type {
  LlmChatLogItem,
  LlmChatLogQueryParams,
} from "../../types/llm-chat-log";

const { Title, Text, Paragraph } = Typography;

const defaultPageSize = 10;

const sortOptions = [
  { label: "Thời gian tạo", value: "createdAt" },
  { label: "ID Người dùng", value: "userId" },
  { label: "ID Cuộc trò chuyện", value: "chatId" },
];

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

// function getCompactText(text?: string, maxLength = 180) {
//   if (!text) return "-";
//   const singleLine = text.replace(/\s+/g, " ").trim();
//   if (singleLine.length <= maxLength) return singleLine;
//   return `${singleLine.slice(0, maxLength)}...`;
// }

function MessageBlock({
  label,
  content,
  accent = "blue",
}: {
  label: string;
  content?: string;
  accent?: "blue" | "green" | "purple" | "orange" | "gray";
}) {
  const palette: Record<typeof accent, { border: string; bg: string; dot: string }> = {
    blue: {
      border: "border-blue-200",
      bg: "bg-blue-50",
      dot: "bg-blue-500",
    },
    green: {
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      dot: "bg-emerald-500",
    },
    purple: {
      border: "border-violet-200",
      bg: "bg-violet-50",
      dot: "bg-violet-500",
    },
    orange: {
      border: "border-amber-200",
      bg: "bg-amber-50",
      dot: "bg-amber-500",
    },
    gray: {
      border: "border-slate-200",
      bg: "bg-slate-50",
      dot: "bg-slate-500",
    },
  };

  const p = palette[accent];

  return (
    <div className={`rounded-2xl border ${p.border} ${p.bg} p-4 shadow-sm`}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${p.dot}`} />
        <Text strong className="text-slate-700">
          {label}
        </Text>
      </div>
      <Paragraph
        style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}
        className="!text-slate-700"
      >
        {content || "-"}
      </Paragraph>
    </div>
  );
}

export function LlmChatLogManagement() {
  const [form] = Form.useForm<LlmChatLogQueryParams>();
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rows, setRows] = useState<LlmChatLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [selected, setSelected] = useState<LlmChatLogItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const uniqueUsers = useMemo(() => {
    const ids = new Set(rows.map((item) => item.userId));
    return ids.size;
  }, [rows]);

  const latestActivity = useMemo(() => {
    if (!rows.length) return null;
    const sorted = [...rows].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return sorted[0];
  }, [rows]);

  const currentPageCount = rows.length;

  const fetchLogs = async (overrides?: Partial<LlmChatLogQueryParams>) => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const params: LlmChatLogQueryParams = {
        userId: values.userId,
        userQuery: values.userQuery?.trim() || undefined,
        search: values.search?.trim() || undefined,
        sortBy: values.sortBy || "createdAt",
        sortDesc: values.sortDesc ?? true,
        pageNumber,
        pageSize,
        ...overrides,
      };

      const res = await getLlmChatLogs(params);
      setRows(res.items || []);
      setTotal(res.totalCount || 0);
    } catch (error) {
      console.error(error);
      antMessage.error("Lỗi khi tải nhật ký trò chuyện. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      sortBy: "createdAt",
      sortDesc: true,
      pageSize: defaultPageSize,
    });
    fetchLogs({
      sortBy: "createdAt",
      sortDesc: true,
      pageNumber: 1,
      pageSize: defaultPageSize,
    });
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [pageNumber, pageSize]);

  const openDetail = async (record: LlmChatLogItem) => {
    setSelected(record);
    setDrawerOpen(true);

    if (record.message && record.llmResponse) return;

    setDetailLoading(true);
    try {
      const full = await getLlmChatLogById(record.chatId);
      setSelected(full);
    } catch (error) {
      console.error(error);
      antMessage.error("Lỗi khi tải chi tiết nhật ký trò chuyện. Vui lòng thử lại.");
    } finally {
      setDetailLoading(false);
    }
  };

  const onSearch = async () => {
    setPageNumber(1);
    await fetchLogs({ pageNumber: 1 });
  };

  const onReset = async () => {
    form.resetFields();
    form.setFieldsValue({
      sortBy: "createdAt",
      sortDesc: true,
      pageSize: defaultPageSize,
    });

    setPageNumber(1);
    setPageSize(defaultPageSize);

    await fetchLogs({
      userId: undefined,
      userQuery: undefined,
      search: undefined,
      sortBy: "createdAt",
      sortDesc: true,
      pageNumber: 1,
      pageSize: defaultPageSize,
    });
  };

  const columns: ColumnsType<LlmChatLogItem> = useMemo(
    () => [
      {
        title: "Chat ID",
        dataIndex: "chatId",
        width: 110,
        sorter: true,
        render: (value: number) => (
          <Tag color="blue" className="!rounded-full !px-3 !py-1 !text-sm">
            #{value}
          </Tag>
        ),
      },
      {
        title: "Người dùng",
        dataIndex: "userId",
        width: 180,
        render: (_: unknown, record) => (
          <Space size={12} align="start">
            <Avatar
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              }}
              icon={<UserOutlined />}
            />
            <div>
              <div className="font-semibold text-slate-800">
                User #{record.userId}
              </div>
              <div className="text-xs text-slate-500">
                {record.userName ? record.userName : "Applicant account"}
              </div>
            </div>
          </Space>
        ),
      },
      {
        title: "Câu hỏi",
        dataIndex: "userQuery",
        ellipsis: true,
        render: (value: string) => (
          <Paragraph
            ellipsis={{ rows: 2, tooltip: value }}
            style={{ marginBottom: 0 }}
            className="!text-slate-700"
          >
            {value}
          </Paragraph>
        ),
      },
      // {
      //   title: "Message",
      //   dataIndex: "message",
      //   ellipsis: true,
      //   render: (value: string) => (
      //     <Paragraph
      //       ellipsis={{ rows: 2, tooltip: value }}
      //       style={{ marginBottom: 0 }}
      //       className="!text-slate-700"
      //     >
      //       {value}
      //     </Paragraph>
      //   ),
      // },
      {
        title: "LLM Phản hồi",
        dataIndex: "llmResponse",
        ellipsis: true,
        render: (value: string) => (
          <Paragraph
            ellipsis={{ rows: 2 }}
            style={{ marginBottom: 0 }}
            className="!text-slate-700"
          >
            {value}
          </Paragraph>
        ),
      },
      {
        title: "Thời gian tạo",
        dataIndex: "createdAt",
        width: 190,
        sorter: true,
        render: (value: string) => (
          <Space size={8}>
            <ClockCircleOutlined className="text-slate-400" />
            <Text type="secondary">{formatDateTime(value)}</Text>
          </Space>
        ),
      },
      {
        title: "Hành động",
        key: "actions",
        width: 120,
        fixed: "right",
        render: (_, record) => (
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            onClick={() => openDetail(record)}
            className="!rounded-full"
          >
            View
          </Button>
        ),
      },
    ],
    []
  );

  return (
    <QALayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <Card
          className="overflow-hidden rounded-3xl border border-slate-200 shadow-[0_12px_40px_rgba(15,23,42,0.08)]"
          styles={{
            body: {
              padding: 0,
            },
          }}
        >
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 px-6 py-6 md:px-8 md:py-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                  <RobotOutlined />
                  LLM Inquiry Review
                </div>
                <Title level={2} className="!mb-2 !text-white">
                  LLM Chat Logs
                </Title>
                <Text className="max-w-2xl !text-slate-200">
                  Xem và quản lý lịch sử trò chuyện giữa người dùng và mô hình ngôn ngữ. Sử dụng các bộ lọc để tìm kiếm chính xác và nhấp vào "View" để xem chi tiết cuộc trò chuyện.
                </Text>
              </div>

              <Space size={12} wrap>
                <Tag
                  color="geekblue"
                  className="!rounded-full !px-4 !py-1.5 !text-sm !font-medium"
                >
                  Total Logs: {total}
                </Tag>
                <Tag
                  color="cyan"
                  className="!rounded-full !px-4 !py-1.5 !text-sm !font-medium"
                >
                  Current Page: {pageNumber}
                </Tag>
              </Space>
            </div>
          </div>

          <div className="p-5 md:p-8">
            <Row gutter={[16, 16]} className="mb-6">
              <Col xs={24} md={8}>
                <Card
                  className="h-full rounded-2xl border border-slate-200 shadow-sm"
                  styles={{ body: { padding: 20 } }}
                >
                  <Statistic
                    title={<span className="text-slate-500">All Logs</span>}
                    value={total}
                    prefix={<MessageOutlined />}
                    valueStyle={{ color: "#0f172a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card
                  className="h-full rounded-2xl border border-slate-200 shadow-sm"
                  styles={{ body: { padding: 20 } }}
                >
                  <Statistic
                    title={<span className="text-slate-500">Logs đang hiện</span>}
                    value={currentPageCount}
                    prefix={<BookOutlined />}
                    valueStyle={{ color: "#0f172a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={8}>
                <Card
                  className="h-full rounded-2xl border border-slate-200 shadow-sm"
                  styles={{ body: { padding: 20 } }}
                >
                  <Statistic
                    title={<span className="text-slate-500">Người dùng duy nhất trên trang</span>}
                    value={uniqueUsers}
                    prefix={<UserOutlined />}
                    valueStyle={{ color: "#0f172a" }}
                  />
                </Card>
              </Col>
            </Row>

            <Card
              className="mb-6 rounded-3xl border border-slate-200 shadow-sm"
              styles={{ body: { padding: 20 } }}
            >
              <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <Title level={4} className="!mb-1 !text-slate-900">
                    Filters
                  </Title>
                  <Text type="secondary">
                   Tìm kiếm và sắp xếp nhật ký trò chuyện một cách chính xác.
                  </Text>
                </div>
                {latestActivity ? (
                  <Tag color="purple" className="!rounded-full !px-3 !py-1">
                    Gần nhất: {formatDateTime(latestActivity.createdAt)}
                  </Tag>
                ) : null}
              </div>

              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  sortBy: "createdAt",
                  sortDesc: true,
                  pageSize: defaultPageSize,
                }}
              >
                <Row gutter={16}>
                  <Col xs={24} md={6}>
                    <Form.Item name="userId" label="User ID">
                      <InputNumber
                        style={{ width: "100%" }}
                        placeholder="Lọc theo ID người dùng"
                        min={1}
                        className="!rounded-xl"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={6}>
                    <Form.Item name="userQuery" label="User Query">
                      <Input
                        placeholder="Tìm kiếm nội dung truy vấn"
                        allowClear
                        className="!rounded-xl"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={6}>
                    <Form.Item name="search" label="Search">
                      <Input
                        placeholder="Tìm kiếm trong nhật ký"
                        allowClear
                        className="!rounded-xl"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={6}>
                    <Form.Item name="sortBy" label="Sort By">
                      <Select
                        options={sortOptions}
                        className="!rounded-xl"
                        dropdownStyle={{ borderRadius: 16 }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={6}>
                    <Form.Item name="sortDesc" label="Xếp theo">
                      <Select
                        options={[
                          { label: "Mới nhất", value: true },
                          { label: "Cũ nhất", value: false },
                        ]}
                        className="!rounded-xl"
                        dropdownStyle={{ borderRadius: 16 }}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={6}>
                    <Form.Item name="pageSize" label="Kích thước trang">
                      <Select
                        options={[10, 20, 50, 100].map((v) => ({
                          label: `${v}`,
                          value: v,
                        }))}
                        className="!rounded-xl"
                        dropdownStyle={{ borderRadius: 16 }}
                        onChange={(value) => {
                          setPageSize(value);
                          setPageNumber(1);
                          form.setFieldValue("pageSize", value);
                        }}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <div className="mt-1 flex flex-wrap gap-3">
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={onSearch}
                    className="!h-11 !rounded-full !px-5 !shadow-md"
                  >
                    Tìm kiếm
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={onReset}
                    className="!h-11 !rounded-full !px-5"
                  >
                    Reset
                  </Button>
                </div>
              </Form>
            </Card>

            <Card
              className="rounded-3xl border border-slate-200 shadow-sm"
              styles={{ body: { padding: 0 } }}
            >
              <div className="border-b border-slate-200 px-5 py-4 md:px-6">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <Title level={4} className="!mb-1 !text-slate-900">
                      Bản ghi nhật ký trò chuyện
                    </Title>
                    <Text type="secondary">
                      Nhấn để xem chi tiết cuộc trò chuyện.
                    </Text>
                  </div>
                  <Badge count={total} showZero color="#6366f1" />
                </div>
              </div>

              <div className="p-0">
                <Spin spinning={loading}>
                  <Table<LlmChatLogItem>
                    columns={columns}
                    dataSource={rows}
                    rowKey="chatId"
                    scroll={{ x: 1250 }}
                    pagination={{
                      current: pageNumber,
                      pageSize,
                      total,
                      showSizeChanger: false,
                      onChange: (page) => setPageNumber(page),
                      className: "px-6 py-4",
                    }}
                    locale={{
                      emptyText: (
                        <div className="py-14 text-center">
                          <MessageOutlined className="mb-3 text-4xl text-slate-300" />
                          <div className="text-lg font-semibold text-slate-700">
                            Không tìm thấy nhật ký trò chuyện
                          </div>
                          <div className="mt-1 text-slate-500">
                            Thử điều chỉnh bộ lọc để tìm thấy nhiều kết quả hơn.
                          </div>
                        </div>
                      ),
                    }}
                    className="rounded-b-3xl"
                  />
                </Spin>
              </div>
            </Card>
          </div>
        </Card>

        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          width={760}
          destroyOnClose={false}
          styles={{
            header: {
              borderBottom: "1px solid #e2e8f0",
              paddingBottom: 16,
            },
            body: {
              padding: 20,
              background: "#f8fafc",
            },
          }}
          title={
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md">
                <MessageOutlined />
              </div>
              <div>
                <div className="text-base font-semibold text-slate-900">
                  Chi tiết Nhật ký Trò chuyện
                </div>
                <div className="text-xs text-slate-500">
                  Lịch sử tin nhắn đầy đủ và phản hồi của trợ lý
                </div>
              </div>
            </div>
          }
        >
          {detailLoading || !selected ? (
            <div className="flex min-h-[240px] items-center justify-center">
              <Spin size="large" />
            </div>
          ) : (
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Card
                className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm"
                styles={{ body: { padding: 0 } }}
              >
                <div className="bg-gradient-to-r from-slate-900 to-indigo-900 px-5 py-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-1 text-xs uppercase tracking-[0.2em] text-white/60">
                        Tổng quan cuộc trò chuyện
                      </div>
                      <div className="text-2xl font-semibold">#{selected.chatId}</div>
                      <div className="mt-2 text-sm text-white/75">
                        Tạo vào {formatDateTime(selected.createdAt)}
                      </div>
                    </div>

                    <Tag
                      color="geekblue"
                      className="!rounded-full !px-3 !py-1.5 !text-sm !font-medium"
                    >
                      Người dùng #{selected.userId}
                    </Tag>
                  </div>
                </div>

                <div className="grid gap-4 p-5 md:grid-cols-3">
                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="mb-1 text-xs text-slate-500">ID Người dùng</div>
                    <div className="text-lg font-semibold text-slate-900">
                      {selected.userId}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="mb-1 text-xs text-slate-500">Tạo vào</div>
                    <div className="text-lg font-semibold text-slate-900">
                      {formatDateTime(selected.createdAt)}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="mb-1 text-xs text-slate-500">Trạng thái</div>
                    <div className="text-lg font-semibold text-slate-900">
                      Đã xem xét
                    </div>
                  </div>
                </div>
              </Card>

              <Card
                title={
                  <Space>
                    <UserOutlined />
                    <span>Câu hỏi của người dùng</span>
                  </Space>
                }
                className="rounded-3xl border border-slate-200 shadow-sm"
                styles={{ body: { padding: 16 } }}
              >
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <Paragraph
                    style={{ marginBottom: 0, whiteSpace: "pre-wrap" }}
                    className="!text-slate-700"
                  >
                    {selected.userQuery || "-"}
                  </Paragraph>
                </div>
              </Card>

              <MessageBlock
                label="Tin nhắn gốc"
                content={selected.message}
                accent="blue"
              />

              <MessageBlock
                label="Phản hồi của LLM"
                content={selected.llmResponse}
                accent="green"
              />

              <Card
                className="rounded-3xl border border-slate-200 shadow-sm"
                styles={{ body: { padding: 16 } }}
              >
                <div className="mb-3 flex items-center gap-2">
                  <CalendarOutlined className="text-slate-500" />
                  <Text strong className="text-slate-700">
                    Metadata
                  </Text>
                </div>
                <Divider className="!my-3" />
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs text-slate-500">ID Cuộc trò chuyện</div>
                    <div className="mt-1 font-semibold text-slate-900">
                      #{selected.chatId}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs text-slate-500">Tạo vào</div>
                    <div className="mt-1 font-semibold text-slate-900">
                      {formatDateTime(selected.createdAt)}
                    </div>
                  </div>
                </div>
              </Card>
            </Space>
          )}
        </Drawer>
      </div>
    </QALayout>
  );
}
