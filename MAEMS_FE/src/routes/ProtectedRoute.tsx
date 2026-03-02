import type { ReactNode } from "react";

type ProtectedRouteProps = {
  isAllowed: boolean;
  fallback?: ReactNode;
  children: ReactNode;
};

export function ProtectedRoute({
  isAllowed,
  fallback = null,
  children,
}: ProtectedRouteProps) {
  if (!isAllowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

