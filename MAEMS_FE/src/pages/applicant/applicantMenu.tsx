import { FileText, FilePlus, LayoutDashboard, User } from "lucide-react";
import type { SidebarMenuItem } from "../../components/DashboardSidebar";

export const ApplicantMenu: SidebarMenuItem[] = [
  {
    key: "dashboard",
    label: "Tổng quan",
    icon: <LayoutDashboard size={16} />,
    path: "/applicant/dashboard",
  },
  {
    key: "applications",
    label: "Đơn đăng ký của tôi",
    icon: <FileText size={16} />,
    path: "/applicant/applications",
  },
  {
    key: "submit",
    label: "Đăng ký ngành xét tuyển",
    icon: <FilePlus size={16} />,
    path: "/applicant/submit-application",
  },
  {
    key: "profile",
    label: "Nộp hồ sơ cá nhân",
    icon: <User size={16} />,
    path: "/applicant/profile",
  },
];
