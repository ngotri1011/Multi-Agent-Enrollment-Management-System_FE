import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { AuthRole } from "../types/auth";

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles: AuthRole[];
};

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const location = useLocation();

  if (!isInitialized) {
    // Chờ trạng thái xác thực khởi tạo xong trước khi quyết định điều hướng.
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Chưa đăng nhập thì chuyển về trang auth, đồng thời lưu lại trang hiện tại.
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Đã đăng nhập nhưng không đúng quyền truy cập thì quay về trang chủ.
    return <Navigate to="/" replace />;
  }

  // Có quyền hợp lệ thì render nội dung được bảo vệ.
  return <>{children}</>;
}

