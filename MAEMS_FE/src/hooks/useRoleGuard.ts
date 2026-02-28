import { useAuth } from './useAuth'

export function useRoleGuard(allowedRoles: string[]) {
  const { user } = useAuth()

  const isAllowed =
    user && typeof user === 'object' && 'role' in (user as Record<string, unknown>)
      ? allowedRoles.includes(String((user as Record<string, unknown>).role))
      : false

  return { isAllowed }
}

