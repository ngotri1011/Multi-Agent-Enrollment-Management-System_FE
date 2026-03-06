export type UserRole = 'admin' | 'officer' | 'qa' | 'applicant' | 'guest'

export type User = {
  user_id: string
  username: string
  password_hash: string
  email: string
  role_id: UserRole
  created_at: string
  updated_at: string
  is_active: boolean
}

