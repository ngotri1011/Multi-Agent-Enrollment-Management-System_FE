import type { ReactNode } from "react";

type GuestLayoutProps = {
  children: ReactNode;
};

export function GuestLayout({ children }: GuestLayoutProps) {
  // TODO: Add public/guest layout chrome here.
  return <div>{children}</div>;
}
