import type { ReactNode } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Layout, Menu, Typography } from "antd";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  // Desktop không còn collapse — chỉ truyền trạng thái mobile lên Layout cha
  isMobile?: boolean;
  onMobileChange?: (mobile: boolean) => void;
};

export function DashboardSidebar({
  menuItems,
  isMobile: mobileProp,
  onMobileChange,
}: DashboardSidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [internalMobile, setInternalMobile] = useState(false);
  // Trạng thái đóng/mở chỉ có ý nghĩa trên mobile; desktop luôn mở
  const [mobileCollapsed, setMobileCollapsed] = useState(true);

  const isMobile = mobileProp ?? internalMobile;

  const setMobile = (next: boolean) => {
    if (mobileProp === undefined) setInternalMobile(next);
    onMobileChange?.(next);
  };

  // Desktop luôn false; mobile theo state nội bộ riêng → tránh bug click menu tự mở rộng
  const isCollapsed = isMobile ? mobileCollapsed : false;

  // Ưu tiên giữ item đang active theo đường dẫn hiện tại để người dùng định vị nhanh.
  const selectedKey =
    menuItems.find((m) => location.pathname.startsWith(m.path))?.key ??
    menuItems[0]?.key;

  return (
    <>
      {/* Nút nổi chỉ xuất hiện trên mobile khi sidebar đang đóng */}
      {isMobile && isCollapsed ? (
        <button
          type="button"
          aria-label="Mở menu điều hướng"
          onClick={() => setMobileCollapsed(false)}
          className="fixed left-3 top-3 z-40 h-10 w-10 rounded-xl bg-white/80 backdrop-blur-md border border-white/60 shadow-md text-orange-500 transition-all duration-300 hover:scale-[1.03] active:scale-95"
        >
          <MenuUnfoldOutlined />
        </button>
      ) : null}

      {/* Khung sidebar chính: cố định bên trái, responsive mobile */}
      <Sider
        width={240}
        collapsible
        trigger={null}
        breakpoint="lg"
        collapsed={isCollapsed}
        collapsedWidth={0}
        onBreakpoint={(broken) => {
          setMobile(broken);
          // Tự thu gọn khi chuyển sang mobile; desktop không bị ảnh hưởng
          if (broken) setMobileCollapsed(true);
        }}
        className="!bg-white/90 backdrop-blur-[6px] border-r border-white/60 !fixed !left-0 !top-0 z-30 !h-screen !overflow-y-auto shadow-sm transition-all duration-300 ease-out"
      >
        {/* Header sidebar: logo + nút đóng (mobile) / logo tĩnh (desktop) */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-2">
            {/* Logo điều hướng về trang chủ */}
            <Link
              to="/"
              className="block text-xl font-extrabold tracking-[0.12em] uppercase !text-orange-500 hover:!text-orange-600 transition-colors duration-200"
            >
              MAEMS
            </Link>

            {/* Nút đóng chỉ hiển thị trên mobile để tránh nhầm lẫn với desktop */}
            {isMobile && (
              <button
                type="button"
                aria-label="Đóng thanh điều hướng"
                onClick={() => setMobileCollapsed(true)}
                className="h-9 w-9 shrink-0 rounded-xl bg-white/70 backdrop-blur-sm border border-white/60 text-gray-600 transition-all duration-200 hover:text-orange-500 hover:border-orange-200 active:scale-95"
              >
                <MenuFoldOutlined />
              </button>
            )}
          </div>

          {/* Lời chào người dùng — luôn hiển thị vì desktop không bao giờ ở dạng thu gọn */}
          <Text className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
            Xin chào,
          </Text>
          <div className="font-semibold text-gray-800 text-base truncate mt-0.5 leading-tight">
            {user?.username ?? "—"}
          </div>
        </div>

        {/* Menu điều hướng: luôn inline đầy đủ vì sidebar không thu gọn icon trên desktop */}
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          className="!border-none !mt-2 transition-all duration-300 [&_.ant-menu-item]:!rounded-xl [&_.ant-menu-item]:!mx-2 [&_.ant-menu-item]:!h-11 [&_.ant-menu-item]:!flex [&_.ant-menu-item]:!items-center [&_.ant-menu-item]:!text-[14px] [&_.ant-menu-item-selected]:!bg-orange-50 [&_.ant-menu-item-selected]:!text-orange-500 [&_.ant-menu-item-selected_.ant-menu-item-icon]:!text-orange-500 [&_.ant-menu-item:hover]:!text-orange-500 [&_.ant-menu-item:hover]:!bg-orange-50/60"
          items={menuItems.map(({ key, label, icon }) => ({
            key,
            label,
            icon,
          }))}
          onClick={({ key }) => {
            const item = menuItems.find((m) => m.key === key);
            if (item) {
              navigate(item.path);
              // Chỉ đóng sidebar sau khi chọn menu trên mobile; desktop không thay đổi
              if (isMobile) setMobileCollapsed(true);
            }
          }}
        />
      </Sider>
    </>
  );
}
