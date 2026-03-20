import { Card, Col, Row, Typography, Tag, Space } from "antd";
import {
  CheckCircle2,
  DollarSign,
  FileText,
  LayoutDashboard,
  TrendingUp,
  User,
} from "lucide-react";
import { AdminLayout } from "../../components/layouts/AdminLayout";

const { Title, Text } = Typography;

const stats = [
  { label: "Tổng sinh viên", value: "—", color: "text-orange-500", icon: <User size={20} /> },
  { label: "Hồ sơ mới", value: "—", color: "text-yellow-500", icon: <FileText size={20} /> },
  { label: "Thanh toán chờ xử lý", value: "—", color: "text-blue-500", icon: <DollarSign size={20} /> },
  { label: "Chương trình đào tạo", value: "—", color: "text-green-500", icon: <LayoutDashboard size={20} /> },
];

const activities = [
  {
    title: "New application received from John Smith",
    time: "10 minutes ago",
    icon: <FileText size={16} />,
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    title: "Payment overdue for student ID: STU2024089",
    time: "1 hour ago",
    icon: <DollarSign size={16} />,
    iconBg: "bg-yellow-100 text-yellow-600",
    priority: "high",
  },
  {
    title: "Sarah Wilson enrolled in Computer Science program",
    time: "2 hours ago",
    icon: <User size={16} />,
    iconBg: "bg-green-100 text-green-600",
  },
  {
    title: "Document verification completed for 5 applications",
    time: "3 hours ago",
    icon: <CheckCircle2 size={16} />,
    iconBg: "bg-blue-100 text-blue-600",
  },
];

export function AdminDashboard() {
  return (
    <AdminLayout>
      <Title level={4} className="!mb-6 !text-gray-700 !font-semibold">
        Tổng quan hệ thống
      </Title>

      {/* ===== Stats Section ===== */}
      <Row gutter={[16, 16]} className="mb-6">
        {stats.map((item) => (
          <Col xs={12} md={6} key={item.label}>
            <Card
              className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              styles={{ body: { padding: "20px 24px" } }}
            >
              <Space align="center" className="w-full justify-between">
                <div>
                  <Text className="text-xs text-gray-400 uppercase tracking-wide">
                    {item.label}
                  </Text>
                  <div className="text-3xl font-bold mt-1 text-gray-800">
                    {item.value}
                  </div>
                </div>
                <div className="text-gray-400">{item.icon}</div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ===== Middle Section ===== */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card
            className="rounded-2xl border border-gray-100 shadow-sm"
            styles={{ body: { padding: "24px" } }}
          >
            <Title level={5} className="!mb-2">
              Xu hướng tuyển sinh
            </Title>
            <Text className="text-gray-400 text-sm">
              (Khu vực biểu đồ – sẽ tích hợp sau)
            </Text>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card
            className="rounded-2xl border border-gray-100 shadow-sm"
            styles={{ body: { padding: "24px" } }}
          >
            <Title level={5} className="!mb-2">
              Phân bố sinh viên theo ngành
            </Title>
            <Text className="text-gray-400 text-sm">
              (Khu vực biểu đồ tròn – sẽ tích hợp sau)
            </Text>
          </Card>
        </Col>
      </Row>

      {/* ===== Recent Activity ===== */}
      <Card
        className="rounded-2xl border border-gray-100 shadow-sm"
        styles={{ body: { padding: "24px" } }}
      >
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={16} className="text-gray-500" />
          <Title level={5} className="!mb-0 !text-gray-700">
            Recent Activity
          </Title>
        </div>

        <Text className="text-gray-400 text-sm block mb-4">
          Latest system activities and notifications
        </Text>

        <div className="space-y-3">
          {activities.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                {/* Icon Circle */}
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-full ${item.iconBg}`}
                >
                  {item.icon}
                </div>

                {/* Text Content */}
                <div>
                  <div className="font-medium text-gray-800">
                    {item.title}
                  </div>
                  <Text className="text-xs text-gray-400">
                    {item.time}
                  </Text>
                </div>
              </div>

              {/* High Priority Tag */}
              {item.priority === "high" && (
                <Tag
                  color="red"
                  className="rounded-full px-3 py-[2px] text-xs"
                >
                  High Priority
                </Tag>
              )}
            </div>
          ))}
        </div>
      </Card>
    </AdminLayout>
  );
}