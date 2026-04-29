import type { ReactNode } from "react";
import { AppFooter } from "../components/AppFooter";
import { AppHeader } from "../components/AppHeader";

type GuestLayoutProps = {
  children: ReactNode;
};

export function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />
      {/* -mt-[84px]: kéo main lên phủ vùng spacer của AppHeader,
          để hero section bắt đầu từ đầu viewport thay vì tạo khoảng trắng */}
      <main className="flex-1 -mt-[84px]">{children}</main>
      <AppFooter />
    </div>
  );
}
