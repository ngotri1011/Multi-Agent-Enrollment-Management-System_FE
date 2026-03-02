import { Card, Col, Row, Typography } from "antd";
import { Activity, Bot, LayoutDashboard, User } from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import type { SidebarMenuItem } from "../../components/DashboardSidebar";

const { Title, Text } = Typography;

const menuItems: SidebarMenuItem[] = [
  {
    key: "dashboard",
    label: "Tổng quan",
    icon: <LayoutDashboard size={16} />,
    path: "/staff/dashboard",
  },
  {
    key: "agents-dashboard",
    label: "Bảng điều khiển Agent",
    icon: <Bot size={16} />,
    path: "/staff/agents/dashboard",
  },
  {
    key: "agents-performance",
    label: "Hiệu suất Agent",
    icon: <Activity size={16} />,
    path: "/staff/agents/performance",
  },
  {
    key: "profile",
    label: "Hồ sơ cá nhân",
    icon: <User size={16} />,
    path: "/staff/profile",
  },
];

const stats = [
  { label: "Agent đang chạy", value: "—", color: "text-green-500" },
  { label: "Task đang xử lý", value: "—", color: "text-blue-500" },
  { label: "Hoàn thành hôm nay", value: "—", color: "text-orange-500" },
  { label: "Lỗi cần xử lý", value: "—", color: "text-red-500" },
];

export function StaffDashboard() {
  return (
    <DashboardLayout menuItems={menuItems}>
      <Title level={4} className="!mb-6 !text-gray-700 !font-semibold">
        Tổng quan hệ thống Agent
      </Title>

      <Row gutter={[16, 16]} className="mb-6">
        {stats.map((s) => (
          <Col xs={12} md={6} key={s.label}>
            <Card
              className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              styles={{ body: { padding: "20px 24px" } }}
            >
              <Text className="text-xs text-gray-400 uppercase tracking-wide">
                {s.label}
              </Text>
              <div className={`text-3xl font-bold mt-1 ${s.color}`}>
                {s.value}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        className="rounded-2xl border border-gray-100 shadow-sm"
        styles={{ body: { padding: "24px" } }}
      >
        <Title level={5} className="!mb-4 !text-gray-700">
          Hoạt động Agent gần đây
        </Title>
        <Text className="text-gray-400 text-sm">Chưa có hoạt động nào.</Text>
      </Card>
    </DashboardLayout>
  );
}
