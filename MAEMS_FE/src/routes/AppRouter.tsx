import { Navigate, Route, Routes } from "react-router-dom";
import { GuestGuard } from "../components/GuestGuard";
import { AdmissionPage } from "../pages/admissions/AdmissionPage";
import { AuthPage } from "../pages/auth/AuthPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<AdmissionPage />} />
      <Route
        path="/auth"
        element={
          <GuestGuard>
            <AuthPage />
          </GuestGuard>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

