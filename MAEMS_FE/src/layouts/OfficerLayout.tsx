import type { ReactNode } from "react";
import {
  BarChart2,
  ClipboardList,
  LayoutDashboard,
  Newspaper,
  User,
} from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import type { SidebarMenuItem } from "../components/DashboardSidebar";

const officerMenuItems: SidebarMenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
    path: "/officer/dashboard",
  },
  {
    key: "review-applications",
    label: "Đánh giá đơn ĐK",
    icon: <ClipboardList size={16} />,
    path: "/officer/review-applications",
  },
  {
    key: "reports",
    label: "Báo cáo",
    icon: <BarChart2 size={16} />,
    path: "/officer/reports",
  },
  {
    key: "articles",
    label: "Bài viết",
    icon: <Newspaper size={16} />,
    path: "/officer/articles",
  },
  {
    key: "profile",
    label: "Hồ sơ cá nhân",
    icon: <User size={16} />,
    path: "/officer/profile",
  },
];

type OfficerLayoutProps = {
  children: ReactNode;
};

export function OfficerLayout({ children }: OfficerLayoutProps) {
  return (
    <DashboardLayout menuItems={officerMenuItems} showNotifications>
      {children}
      </DashboardLayout>
  );
}
