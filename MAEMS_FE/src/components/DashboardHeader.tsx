import { Avatar, Button, Space, Typography } from "antd";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const { Text } = Typography;

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  const initial = user?.username?.charAt(0).toUpperCase() ?? "U";

  return (
    <div className="flex items-center justify-end px-6 py-3 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
      <Space size="middle" className="items-center">
        <Avatar
          size={36}
          src={user?.photoURL}
          className="!bg-orange-500 !text-white font-bold select-none flex-shrink-0"
        >
          {initial}
        </Avatar>
        <div className="flex flex-col leading-tight min-w-0">
          <Text strong className="text-sm text-gray-800 truncate">
            {user?.username}
          </Text>
          <Text className="text-xs text-gray-400 truncate">
            {user?.email || "—"}
          </Text>
        </div>
        <Button
          type="text"
          icon={<LogOut size={15} />}
          onClick={handleLogout}
          className="!text-gray-500 hover:!text-red-500 hover:!bg-red-50 flex items-center gap-1 !rounded-lg"
        >
          Đăng xuất
        </Button>
      </Space>
    </div>
  );
}
