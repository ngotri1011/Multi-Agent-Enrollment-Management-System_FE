import { Card, Col, Row, Typography } from "antd";
import {
  BarChart2,
  LayoutDashboard,
  Newspaper,
  ShieldCheck,
  User,
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import type { SidebarMenuItem } from "../../components/DashboardSidebar";

const { Title, Text } = Typography;

const menuItems: SidebarMenuItem[] = [
  {
    key: "dashboard",
    label: "Tổng quan",
    icon: <LayoutDashboard size={16} />,
    path: "/admin/dashboard",
  },
  {
    key: "reports",
    label: "Báo cáo",
    icon: <BarChart2 size={16} />,
    path: "/admin/reports",
  },
  {
    key: "eligibility",
    label: "Quy tắc xét duyệt",
    icon: <ShieldCheck size={16} />,
    path: "/admin/eligibility/rules",
  },
  {
    key: "articles",
    label: "Bài viết",
    icon: <Newspaper size={16} />,
    path: "/admin/articles",
  },
  {
    key: "profile",
    label: "Hồ sơ cá nhân",
    icon: <User size={16} />,
    path: "/admin/profile",
  },
];

const stats = [
  { label: "Tổng hồ sơ", value: "—", color: "text-orange-500" },
  { label: "Hồ sơ chờ duyệt", value: "—", color: "text-yellow-500" },
  { label: "Người dùng", value: "—", color: "text-blue-500" },
  { label: "Bài viết đã đăng", value: "—", color: "text-green-500" },
];

export function AdminDashboard() {
  return (
    <DashboardLayout menuItems={menuItems}>
      <Title level={4} className="!mb-6 !text-gray-700 !font-semibold">
        Tổng quan hệ thống
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
          Hoạt động gần đây
        </Title>
        <Text className="text-gray-400 text-sm">Chưa có hoạt động nào.</Text>
      </Card>
    </DashboardLayout>
  );
}
