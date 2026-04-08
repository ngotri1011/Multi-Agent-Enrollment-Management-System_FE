import type { ReactNode } from "react";
import { DashboardLayout } from "./DashboardLayout";
import type { SidebarMenuItem } from "../DashboardSidebar";
import { ApplicantChatWidget } from "../../pages/applicant/ApplicantChatWidget";

type ApplicantLayoutProps = {
  menuItems: SidebarMenuItem[];
  children: ReactNode;
};

export function ApplicantLayout({ menuItems, children }: ApplicantLayoutProps) {
  return (
    <DashboardLayout menuItems={menuItems} showNotifications>
      {children}
      <ApplicantChatWidget />
    </DashboardLayout>
  );
}
