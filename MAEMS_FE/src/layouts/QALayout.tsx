import type { ReactNode } from "react";
import { ClipboardCheck, User } from "lucide-react";
import { DashboardLayout } from "./DashboardLayout";
import type { SidebarMenuItem } from "../components/DashboardSidebar";

type QALayoutProps = {
  children: ReactNode;
};

const qaMenuItems: SidebarMenuItem[] = [
  // {
  //   key: "dashboard",
  //   label: "Tổng quan",
  //   icon: <LayoutDashboard size={16} />,
  //   path: "/qa/dashboard",
  // },
  {
    key: "review",
    label: "Agent Logs",
    icon: <ClipboardCheck size={16} />,
    path: "/qa/review-evaluation",
  },
  {
    key: "llm-chat-logs",
    label: "LLM Chat Logs",
    icon: <ClipboardCheck size={16} />,
    path: "/qa/llm-chat-logs",
  },
  {
    key: "profile",
    label: "Hồ sơ cá nhân",
    icon: <User size={16} />,
    path: "/qa/profile",
  },
];

export function QALayout({ children }: QALayoutProps) {
  return (
    <DashboardLayout menuItems={qaMenuItems} showNotifications>
      {children}
    </DashboardLayout>
  );
}
