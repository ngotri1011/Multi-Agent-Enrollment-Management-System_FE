import { ReactNode } from 'react'

type StaffLayoutProps = {
  children: ReactNode
}

export function StaffLayout({ children }: StaffLayoutProps) {
  // TODO: Add staff-specific layout chrome here.
  return <div>{children}</div>
}

