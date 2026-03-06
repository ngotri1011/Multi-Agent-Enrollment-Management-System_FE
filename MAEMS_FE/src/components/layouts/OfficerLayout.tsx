import type { ReactNode } from "react";

type OfficerLayoutProps = {
  children: ReactNode;
};

export function OfficerLayout({ children }: OfficerLayoutProps) {
  // TODO: Add officer-specific layout chrome here.
  return <div>{children}</div>;
}
