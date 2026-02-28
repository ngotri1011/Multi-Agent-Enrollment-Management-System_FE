export type AuthRole = 'admin' | 'staff' | 'applicant' | 'guest'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: AuthRole
}

