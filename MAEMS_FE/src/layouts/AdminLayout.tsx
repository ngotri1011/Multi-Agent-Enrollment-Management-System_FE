import type { ReactNode } from "react";
import { DashboardLayout } from "./DashboardLayout"; 
import type { SidebarMenuItem } from "../components/DashboardSidebar";

import {
  LayoutDashboard,
  BarChart2,
  ShieldCheck,
  DollarSign,
  FileText,
  Server,
  HandHelping,
  Settings,
} from "lucide-react";

type AdminLayoutProps = {
  children: ReactNode;
};

const menuItems: SidebarMenuItem[] = [
  {
    key: "dashboard",
    label: "Tổng quan",
    icon: <LayoutDashboard size={16} />,
    path: "/admin/dashboard",
  },
  // {
  //   key: "applications",
  //   label: "Hồ sơ xét duyệt",
  //   icon: <BarChart2 size={16} />,
  //   path: "/admin/applications",
  // },
   {
    key: "admissionPlans",
    label: "Kế hoạch tuyển sinh",
    icon: <BarChart2 size={16} />,
    path: "/admin/admissionPlans",
  },
  {
    key: "programs",
    label: "Chương trình đào tạo",
    icon: <ShieldCheck size={16} />,
    path: "/admin/programs",
  },
  {
    key: "payments",
    label: "Thanh toán",
    icon: <DollarSign size={16} />,
    path: "/admin/payments",
  },
  // {
  //   key: "reports",
  //   label: "Báo cáo",
  //   icon: <FileText size={16} />,
  //   path: "/admin/reports",
  // },
  {
    key: "users",
    label: "Quản lý người dùng",
    icon: <FileText size={16} />,
    path: "/admin/users",
  },
  {
    key: "settings",
    label: "Cài đặt hệ thống",
    icon: <Settings size={16} />,
    path: "/admin/settings",
  },
  {
    key: "system-monitor",
    label: "Theo dõi hệ thống",
    icon: <Server size={16} />,
    path: "/admin/system-monitor",
  },
  {
    key: "feedbacks",
    label: "Phản hồi",
    icon: <HandHelping size={16} />,
    path: "/admin/feedbacks",
  },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <DashboardLayout menuItems={menuItems} showNotifications>
      {children}
    </DashboardLayout>
  );
}