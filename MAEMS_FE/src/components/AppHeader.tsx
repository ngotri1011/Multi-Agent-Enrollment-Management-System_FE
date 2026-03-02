import { Button, Dropdown, Layout, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import { LayoutDashboard, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { AuthRole } from "../types/auth";

const { Header } = Layout;
const { Text } = Typography;

const roleDashboard: Record<AuthRole, string> = {
  applicant: "/applicant/dashboard",
  admin: "/admin/dashboard",
  staff: "/staff/dashboard",
  qa: "/qa/dashboard",
  guest: "/",
};

export function AppHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  const dashboardPath = user ? (roleDashboard[user.role] ?? "/") : "/";

  const userMenuItems: MenuProps["items"] = [
    {
      key: "dashboard",
      icon: <LayoutDashboard size={14} />,
      label: <Link to={dashboardPath}>Dashboard</Link>,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogOut size={14} />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="pt-4 px-4 md:pt-6 md:px-6 pb-4">
      <div className="h-16" aria-hidden />
      <Header
        className="!h-auto !leading-none !px-0 !bg-white/75 backdrop-blur-sm rounded-full border border-orange-200/30 shadow-sm fixed top-4 left-4 right-4 md:left-6 md:right-6 z-50"
        style={{ borderBottom: "none" }}
      >
        <div className="flex items-center justify-between gap-6 w-full mx-0 py-3 px-4 md:px-6">
          <Link
            to="/"
            className="font-extrabold text-xl tracking-[0.12em] uppercase !text-orange-500 hover:!text-orange-600"
          >
            FPTU
          </Link>
          <Space size="large" className="flex-1 justify-center text-gray-700 max-md:hidden">
            <Text strong>Về FPTU</Text>
            <Text strong>Đào tạo</Text>
            <Text strong>Tuyển sinh</Text>
            <Text strong>Tin tức & Sự kiện</Text>
            <Text strong>Liên hệ</Text>
          </Space>
          {isAuthenticated && user ? (
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
              <Button type="text" className="!text-gray-700 hover:!text-orange-500">
                {user.username}
              </Button>
            </Dropdown>
          ) : (
            <Link to="/auth">
              <Button
                type="primary"
                className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600"
              >
                Đăng nhập
              </Button>
            </Link>
          )}
        </div>
      </Header>
    </div>
  );
}
