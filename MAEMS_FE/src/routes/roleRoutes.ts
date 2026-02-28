// Placeholder for role-based route configuration.
// Define route objects or helper functions based on user roles (admin, staff, applicant, guest, etc.).

export type UserRole = 'admin' | 'staff' | 'applicant' | 'guest'

export const roleRoutes: Record<UserRole, string[]> = {
  admin: [],
  staff: [],
  applicant: [],
  guest: [],
}

