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
      <main className="flex-1">{children}</main>
      <AppFooter />
    </div>
  );
}
