import { useEffect, useMemo, useState } from "react";
import { Button, Card, Input, Modal, Space, Table, Tag, message, Spin, Empty } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ReloadOutlined, SearchOutlined, ThunderboltFilled, EyeOutlined } from "@ant-design/icons";
import { getFeedback } from "../../api/feedback";
import type { Feedback, FeedbackQueryParams } from "../../types/feedback";
import { AdminLayout } from "../../layouts/AdminLayout";

const { Search } = Input;

export function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [searchText, setSearchText] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);

      const params: FeedbackQueryParams = {
        pageNumber: page,
        pageSize,
      };

      const res = await getFeedback(params);
      const data = res;

      setFeedbacks(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      message.error("Không thể tải danh sách feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const filteredFeedbacks = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return feedbacks;

    return feedbacks.filter((item) => {
      return (
        item.title?.toLowerCase().includes(keyword) ||
        item.content?.toLowerCase().includes(keyword) ||
        item.username?.toLowerCase().includes(keyword)
      );
    });
  }, [feedbacks, searchText]);

  const stats = {
    onPage: filteredFeedbacks.length,
    total: totalCount,
    currentPage: page,
    totalPages,
  };

  const columns: ColumnsType<Feedback> = [
    {
      title: "Người dùng",
      dataIndex: "username",
      key: "username",
      width: 160,
      render: (value: string, record) => (
        <Space direction="vertical" size={0}>
          <span className="font-medium text-slate-900">{value}</span>
          <span className="text-xs text-slate-500">ID: {record.userId}</span>
        </Space>
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
      render: (value: string) => (
        <span className="font-medium text-slate-800">{value}</span>
      ),
    },
    {
      title: "Nội dung",
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (value: string) => (
        <span className="text-slate-600">{value}</span>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (value: string) => {
        const date = value ? new Date(value) : null;
        return (
          <span className="text-slate-500">
            {date ? date.toLocaleString() : "-"}
          </span>
        );
      },
    },
    {
      title: "",
      key: "action",
      width: 80,
      render: (_, record) => (
        <Button
          type="text"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedFeedback(record);
            setDetailOpen(true);
          }}
        />
      ),
    },
  ];

  return (
    <AdminLayout>
    <div className="min-h-screen bg-slate-50 p-4 md:p-1">
      <div className="mx-auto max-w-8xl">
        <div className="mb-6 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-violet-950 p-6 text-white shadow-xl shadow-slate-900/10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur">
                <ThunderboltFilled />
                Admin feedback workspace
              </div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                Quản lý phản hồi người dùng
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-white/70 md:text-base">
                Xem và phân tích phản hồi từ người dùng để theo dõi vấn đề, ghi nhận nhu cầu và cải thiện hệ thống tuyển sinh.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <div className="text-xs text-white/65">On page</div>
                <div className="mt-1 text-2xl font-semibold">{stats.onPage}</div>
              </div>
              <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 px-4 py-3 backdrop-blur">
                <div className="text-xs text-blue-100">Total</div>
                <div className="mt-1 text-2xl font-semibold text-blue-50">{stats.total}</div>
              </div>
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 backdrop-blur">
                <div className="text-xs text-emerald-100">Page</div>
                <div className="mt-1 text-2xl font-semibold text-emerald-50">{stats.currentPage}</div>
              </div>
              <div className="rounded-2xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 backdrop-blur">
                <div className="text-xs text-violet-100">Pages</div>
                <div className="mt-1 text-2xl font-semibold text-violet-50">{stats.totalPages}</div>
              </div>
            </div>
          </div>
        </div>

        <Card
          className="mb-4 rounded-3xl border-0 shadow-sm"
          styles={{ body: { padding: 16 } }}
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold text-slate-900">Danh sách phản hồi</div>
              <div className="text-sm text-slate-500">
                
              </div>
            </div>

            <Space wrap>
              <Search
                allowClear
                placeholder="Tìm kiếm theo tiêu đề, nội dung hoặc người dùng"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-[320px]"
              />
              <Button icon={<ReloadOutlined />} onClick={fetchFeedbacks}>
                Tải lại
              </Button>
            </Space>
          </div>
        </Card>

        <Card className="rounded-3xl border-0 shadow-sm">
          {loading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <Spin size="large" />
            </div>
          ) : filteredFeedbacks.length > 0 ? (
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filteredFeedbacks}
              pagination={{
                current: page,
                pageSize,
                total: totalCount,
                showSizeChanger: false,
                onChange: (nextPage) => setPage(nextPage),
              }}
            />
          ) : (
            <div className="py-16">
              <Empty description="Không có phản hồi nào" />
            </div>
          )}
        </Card>

        <Modal
          open={detailOpen}
          onCancel={() => setDetailOpen(false)}
          footer={null}
          title="Chi tiết phản hồi"
          centered
        >
          {selectedFeedback && (
            <div className="space-y-4">
              <div>
                <div className="text-xs text-slate-500">Người dùng</div>
                <div className="font-medium text-slate-900">
                  {selectedFeedback.username}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Tiêu đề</div>
                <div className="font-medium text-slate-900">
                  {selectedFeedback.title}
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-500">Nội dung</div>
                <div className="whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-slate-700">
                  {selectedFeedback.content}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Tag color="blue">ID: {selectedFeedback.id}</Tag>
                <Tag color="geekblue">ID người dùng: {selectedFeedback.userId}</Tag>
                <Tag color="default">
                  {selectedFeedback.createdAt ? new Date(selectedFeedback.createdAt).toLocaleString() : "-"}
                </Tag>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
    </AdminLayout>
  );
};
