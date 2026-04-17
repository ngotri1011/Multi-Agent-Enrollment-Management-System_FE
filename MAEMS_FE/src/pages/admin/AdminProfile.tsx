import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Card,
  Skeleton,
  Typography,
} from "antd";
import {
  CalendarDays,
  Mail,
  ShieldCheck,
  User,
  BarChart2,
  LayoutDashboard,
} from "lucide-react";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { getProfile } from "../../api/users";
import type { UserProfile } from "../../types/auth";
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
    key: "profile",
    label: "Hồ sơ cá nhân",
    icon: <User size={16} />,
    path: "/admin/profile",
  },
];

const roleLabel: Record<string, string> = {
  applicant: "Thí sinh",
  admin: "Quản trị viên",
  officer: "Nhân viên",
  qa: "Kiểm duyệt viên",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="flex-shrink-0">{icon}</span>
      <Text className="text-xs text-gray-400 w-32 flex-shrink-0">{label}</Text>
      <Text className="text-sm text-gray-700 font-medium">{value}</Text>
    </div>
  );
}

export function AdminProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .catch(() => null)
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  const initial = profile?.username?.charAt(0).toUpperCase() ?? "U";

  return (
    <DashboardLayout menuItems={menuItems}>
      <Title level={4} className="!mb-6 !text-gray-700 !font-semibold">
        Hồ sơ cá nhân
      </Title>

      <Card
        className="rounded-2xl border border-gray-100 shadow-sm max-w-3xl"
        styles={{ body: { padding: "32px" } }}
      >
        {loading ? (
          <div className="flex items-center gap-6">
            <Skeleton.Avatar active size={80} />
            <div className="flex-1">
              <Skeleton active paragraph={{ rows: 3 }} title={false} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar
              size={80}
              className="!bg-orange-500 !text-white text-3xl font-bold select-none flex-shrink-0"
            >
              {initial}
            </Avatar>

            <div className="flex-1 w-full">
              <div className="text-center sm:text-left mb-5">
                <Title level={4} className="!mb-0 !text-gray-800">
                  {profile?.username ?? "—"}
                </Title>
                <Badge
                  color="orange"
                  text={
                    <Text className="text-orange-600 text-xs font-medium">
                      {roleLabel[profile?.role ?? ""] ?? profile?.role}
                    </Text>
                  }
                />
              </div>

              <div className="space-y-3">
                <InfoRow
                  icon={<User size={15} className="text-gray-400" />}
                  label="Tên đăng nhập"
                  value={profile?.username ?? "—"}
                />
                <InfoRow
                  icon={<Mail size={15} className="text-gray-400" />}
                  label="Email"
                  value={profile?.email || "Chưa cập nhật"}
                />
                <InfoRow
                  icon={<ShieldCheck size={15} className="text-gray-400" />}
                  label="Vai trò"
                  value={roleLabel[profile?.role ?? ""] ?? profile?.role ?? "—"}
                />
                <InfoRow
                  icon={<CalendarDays size={15} className="text-gray-400" />}
                  label="Ngày tham gia"
                  value={
                    profile?.createdAt ? formatDate(profile.createdAt) : "—"
                  }
                />
              </div>
            </div>
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}
