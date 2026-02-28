import type { UserRole } from '../types/user'

export function hasPermission(role: UserRole, requiredRoles: UserRole[]) {
  return requiredRoles.includes(role)
}

