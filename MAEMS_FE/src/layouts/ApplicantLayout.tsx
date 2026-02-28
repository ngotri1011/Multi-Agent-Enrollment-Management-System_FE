import { ReactNode } from 'react'

type ApplicantLayoutProps = {
  children: ReactNode
}

export function ApplicantLayout({ children }: ApplicantLayoutProps) {
  // TODO: Add applicant-specific layout chrome here.
  return <div>{children}</div>
}

