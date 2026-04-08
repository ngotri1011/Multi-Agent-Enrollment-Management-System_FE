import { useEffect, useState } from "react";
import { Card, Table, Typography, message } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { getChatboxHistory } from "../../api/chatbox";
import { ApplicantLayout } from "../../components/layouts/ApplicantLayout";
import { ApplicantMenu } from "./ApplicantMenu";
import type { ChatboxResponse } from "../../types/chatbox";
import { formatChatText } from "../../utils/chatTextFormatter";
import { formatDateTimeVi } from "../../utils/date";

const { Title, Text } = Typography;

export function ApplicantChatboxHistoryPage() {
  // API message của Ant Design để hiển thị toast lỗi/thành công.
  const [messageApi, contextHolder] = message.useMessage();
  // Trạng thái loading khi đang tải danh sách lịch sử chat.
  const [loading, setLoading] = useState(false);
  // Dữ liệu các dòng lịch sử chat trả về từ API.
  const [rows, setRows] = useState<ChatboxResponse[]>([]);
  // Trạng thái phân trang phía client để gọi API đúng trang.
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    // Tải dữ liệu lịch sử chat theo trang hiện tại và số phần tử mỗi trang.
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await getChatboxHistory(pageNumber, pageSize);
        // Chuẩn hóa dữ liệu fallback để tránh lỗi khi API trả về null/undefined.
        setRows(data.messages ?? []);
        setTotalCount(data.totalCount ?? 0);
      } catch {
        // Thông báo lỗi thân thiện để người dùng biết cần thử lại.
        messageApi.error("Không thể tải lịch sử chat. Vui lòng thử lại.");
      } finally {
        // Luôn tắt loading sau khi hoàn tất call API.
        setLoading(false);
      }
    };
    void fetchHistory();
  }, [messageApi, pageNumber, pageSize]);

  // Cấu hình các cột hiển thị của bảng lịch sử chat.
  const columns: ColumnsType<ChatboxResponse> = [
    {
      title: "Chat ID",
      dataIndex: "chatId",
      key: "chatId",
      width: 100,
      // Hiển thị id của phiên chat.
      render: (value: number) => <Text>{value}</Text>,
    },
    {
      title: "Câu hỏi",
      dataIndex: "question",
      key: "question",
      // Render văn bản có hỗ trợ xuống dòng và định dạng nội dung.
      render: (value: string) => <Text className="break-words">{formatChatText(value)}</Text>,
    },
    {
      title: "Trả lời",
      dataIndex: "answer",
      key: "answer",
      // Nếu nội dung dài sẽ rút gọn 3 dòng và cho phép mở rộng/thu gọn ngay trong ô.
      render: (value: string) => (
        <Typography.Paragraph
          className="!mb-0 break-words"
          ellipsis={{
            rows: 3,
            expandable: "collapsible",
            // Đổi nhãn theo trạng thái: đang thu gọn -> "Xem thêm", đang mở rộng -> "Thu gọn".
            symbol: (isExpanded) => (isExpanded ? "Thu gọn" : "Xem thêm"),
          }}
        >
          {formatChatText(value)}
        </Typography.Paragraph>
      ),
    },
    {
      title: "Thời gian",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 190,
      // Chỉ gọi helper để hiển thị ngày giờ theo định dạng vi-VN (không có giây).
      render: (value: string) => (
        <Text className="inline-flex rounded-md bg-slate-100/80 px-2 py-0.5 text-xs font-medium text-slate-500 shadow-sm ring-1 ring-slate-200/70">
          {formatDateTimeVi(value)}
        </Text>
      ),
    },
  ];

  // Đồng bộ thay đổi phân trang từ Table về state để trigger gọi API.
  const handleTableChange = (pagination: TablePaginationConfig) => {
    setPageNumber(pagination.current ?? 1);
    setPageSize(pagination.pageSize ?? 10);
  };

  return (
    // Layout dùng chung cho khu vực Applicant, nhận menu điều hướng bên trái.
    <ApplicantLayout menuItems={ApplicantMenu}>
      {/* contextHolder là nơi mount hệ thống message của Ant Design. */}
      {contextHolder}
      <div className="space-y-4">
        {/* Banner tiêu đề trang lịch sử chat. */}
        <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-6 shadow-sm">
          <Title level={4} className="!mb-1 !text-white">
            Lịch sử chat với trợ lý AI
          </Title>
          <Text className="!text-orange-50">
            Xem lại toàn bộ hỏi đáp từ trợ lý AI theo từng thời điểm.
          </Text>
        </div>

        {/* Khối nội dung chính chứa bảng dữ liệu lịch sử chat. */}
        <Card className="rounded-2xl border border-gray-100 shadow-sm">
          <Table<ChatboxResponse>
            rowKey="chatId"
            loading={loading}
            columns={columns}
            dataSource={rows}
            // Cấu hình phân trang đồng bộ với API phân trang phía server.
            pagination={{
              current: pageNumber,
              pageSize,
              total: totalCount,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50],
              showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} tin nhắn`,
            }}
            onChange={handleTableChange}
            // Cho phép cuộn ngang khi màn hình nhỏ để tránh vỡ layout.
            scroll={{ x: 900 }}
          />
        </Card>
      </div>
    </ApplicantLayout>
  );
}
