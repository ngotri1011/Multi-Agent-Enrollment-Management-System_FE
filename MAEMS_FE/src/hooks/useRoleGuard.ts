import { useAuth } from "./useAuth";
import type { AuthRole } from "../types/auth";

export function useRoleGuard(allowedRoles: AuthRole[]) {
  const { user } = useAuth();

  const isAllowed =
    user && allowedRoles.includes(user.role);

  return { isAllowed, user };
}
