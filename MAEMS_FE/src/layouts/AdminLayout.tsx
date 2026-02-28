import { ReactNode } from 'react'

type AdminLayoutProps = {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  // TODO: Add admin navigation, sidebars, and header here.
  return <div>{children}</div>
}

