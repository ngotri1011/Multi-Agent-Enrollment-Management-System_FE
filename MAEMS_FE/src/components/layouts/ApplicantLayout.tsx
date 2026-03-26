import type { ReactNode } from "react";
import { DashboardLayout } from "./DashboardLayout";
import type { SidebarMenuItem } from "../DashboardSidebar";

type ApplicantLayoutProps = {
  menuItems: SidebarMenuItem[];
  children: ReactNode;
};

export function ApplicantLayout({ menuItems, children }: ApplicantLayoutProps) {
  return (
    <DashboardLayout menuItems={menuItems} showNotifications>
      {children}
    </DashboardLayout>
  );
}
