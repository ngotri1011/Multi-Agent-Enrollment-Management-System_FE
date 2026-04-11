import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Layout } from "antd";
import { DashboardHeader } from "../DashboardHeader";
import { DashboardSidebar } from "../DashboardSidebar";
import type { SidebarMenuItem } from "../DashboardSidebar";

const { Content } = Layout;

type DashboardLayoutProps = {
  menuItems: SidebarMenuItem[];
  children: ReactNode;
  showNotifications?: boolean;
};

export function DashboardLayout({
  menuItems,
  children,
  showNotifications = false,
}: DashboardLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);

  // Dùng padding trái thay vì margin: Sider fixed không chiếm chỗ trong flex — margin + width ~100% dễ gây scroll ngang.
  const contentLeftInset = useMemo(
    () => (isMobile ? "pl-0" : "pl-[240px]"),
    [isMobile],
  );

  return (
    <Layout className="h-screen bg-gray-50">
      <DashboardSidebar
        menuItems={menuItems}
        isMobile={isMobile}
        onMobileChange={setIsMobile}
      />
      <Layout
        className={`!bg-gray-50 ${contentLeftInset} flex flex-1 min-w-0 flex-col h-screen overflow-y-auto min-h-0 transition-all duration-300 ease-out`}
      >
        <DashboardHeader showNotifications={showNotifications} />
        <Content className="p-4 sm:p-5 lg:p-6">{children}</Content>
      </Layout>
    </Layout>
  );
}
