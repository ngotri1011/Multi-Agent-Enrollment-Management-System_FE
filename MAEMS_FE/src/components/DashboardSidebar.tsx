import type { ReactNode } from "react";
import { Layout, Menu, Typography } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const { Sider } = Layout;
const { Text } = Typography;

export type SidebarMenuItem = {
  key: string;
  label: string;
  icon: ReactNode;
  path: string;
};

type DashboardSidebarProps = {
  menuItems: SidebarMenuItem[];
};

export function DashboardSidebar({ menuItems }: DashboardSidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedKey =
    menuItems.find((m) => location.pathname.startsWith(m.path))?.key ??
    menuItems[0]?.key;

  return (
    <Sider
      width={240}
      className="!bg-white border-r border-gray-100 !min-h-screen"
    >
      <div className="px-5 pt-6 pb-4 border-b border-gray-100">
        <Text className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
          Xin chào,
        </Text>
        <div className="font-semibold text-gray-800 text-base truncate mt-0.5 leading-tight">
          {user?.username ?? "—"}
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        className="!border-none !mt-2 [&_.ant-menu-item]:!rounded-lg [&_.ant-menu-item]:!mx-2 [&_.ant-menu-item-selected]:!bg-orange-50 [&_.ant-menu-item-selected]:!text-orange-500 [&_.ant-menu-item-selected_.ant-menu-item-icon]:!text-orange-500 [&_.ant-menu-item:hover]:!text-orange-500 [&_.ant-menu-item:hover]:!bg-orange-50/60"
        items={menuItems.map(({ key, label, icon }) => ({
          key,
          label,
          icon,
        }))}
        onClick={({ key }) => {
          const item = menuItems.find((m) => m.key === key);
          if (item) navigate(item.path);
        }}
      />
    </Sider>
  );
}
