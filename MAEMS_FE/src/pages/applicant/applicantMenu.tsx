import { FileText, FilePlus, LayoutDashboard, User } from "lucide-react";
import type { SidebarMenuItem } from "../../components/DashboardSidebar";

export const applicantMenu: SidebarMenuItem[] = [
  {
    key: "dashboard",
    label: "Tổng quan",
    icon: <LayoutDashboard size={16} />,
    path: "/applicant/dashboard",
  },
  {
    key: "applications",
    label: "Hồ sơ của tôi",
    icon: <FileText size={16} />,
    path: "/applicant/applications",
  },
  {
    key: "submit",
    label: "Nộp hồ sơ",
    icon: <FilePlus size={16} />,
    path: "/applicant/submit-application",
  },
  {
    key: "profile",
    label: "Hồ sơ cá nhân",
    icon: <User size={16} />,
    path: "/applicant/profile",
  },
];
