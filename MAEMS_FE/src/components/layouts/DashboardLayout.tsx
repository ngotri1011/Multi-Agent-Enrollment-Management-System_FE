import type { ReactNode } from "react";
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
  return (
    <Layout className="min-h-screen bg-gray-50">
      <DashboardSidebar menuItems={menuItems} />
      <Layout className="!bg-gray-50">
        <DashboardHeader showNotifications={showNotifications} />
        <Content className="p-6 overflow-auto">{children}</Content>
      </Layout>
    </Layout>
  );
}
