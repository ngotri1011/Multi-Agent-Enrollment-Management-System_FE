import { useState } from "react";
import { Button, message } from "antd";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import * as authApi from "../api/auth";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import type { AuthRole } from "../types/auth";

const roleDashboard: Record<AuthRole, string> = {
  applicant: "/applicant/dashboard",
  admin: "/admin/dashboard",
  officer: "/officer/dashboard",
  qa: "/qa/dashboard",
};

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      const res = await authApi.googleLogin(idToken);
      const userWithPhoto = {
        ...res.user,
        photoURL: result.user.photoURL,
      };
      setAuth(userWithPhoto, res.token, res.refreshToken);
      message.success("Đăng nhập Google thành công");
      navigate(roleDashboard[res.user.role] ?? "/", { replace: true });
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      if (firebaseError.code === "auth/popup-closed-by-user") {
        return;
      }
      const apiError = err as { response?: { data?: { message?: string } } };
      const msg =
        apiError?.response?.data?.message || "Đăng nhập Google thất bại";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="large"
      block
      loading={loading}
      onClick={handleGoogleLogin}
      className="!rounded-lg !h-11 !border-gray-300 hover:!border-orange-400 !flex !items-center !justify-center !gap-2"
    >
      {!loading && (
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      Đăng nhập bằng Google
    </Button>
  );
}
