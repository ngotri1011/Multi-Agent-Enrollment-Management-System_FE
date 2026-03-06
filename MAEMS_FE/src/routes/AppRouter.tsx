import { Navigate, Route, Routes } from "react-router-dom";
import { RoleGuard } from "./RoleGuard";
// dashboard pages
import { ApplicantDashboard } from "../pages/applicant/ApplicantDashboard";
import { ApplicantProfilePage } from "../pages/applicant/ApplicantProfilePage";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { StaffDashboard } from "../pages/staff/StaffDashboard";
import { QaDashboard } from "../pages/qa/QaDashboard";
// feature pages
import { AgentDashboard } from "../pages/agents/AgentDashboard";
import { AgentPerformance } from "../pages/agents/AgentPerformance";
import { ApplicationDetail } from "../pages/application/ApplicationDetail";
import { ApplicationList } from "../pages/application/ApplicationList";
import { SubmitApplication } from "../pages/application/SubmitApplication";
import { SubmitHocBa } from "../pages/application/SubmitHocBa";
import { SubmitDGNL } from "../pages/application/SubmitDGNL";
import { SubmitTHPT } from "../pages/application/SubmitTHPT";
import { SubmitKhac } from "../pages/application/SubmitKhac";
import { ArticleDetail } from "../pages/articles/ArticleDetail";
import { ArticleEditor } from "../pages/articles/ArticleEditor";
import { ArticleList } from "../pages/articles/ArticleList";
import { AdmissionPage } from "../pages/admission/AdmissionPage";
import { HomePage } from "../pages/homepage/HomePage";
import { AuthPage } from "../pages/auth/AuthPage";
import { RuleConfigPage } from "../pages/eligibility/RuleConfigPage";
import { ReviewEvaluationPage } from "../pages/qa/ReviewEvaluationPage";
import { ReportDashboard } from "../pages/reports/ReportDashboard";
import { AdminApplicationList } from "../pages/admin/AdminApplicationList";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tuyen-sinh" element={<AdmissionPage />} />
      <Route path="/auth" element={<AuthPage />} />

      {/* applicant */}
      <Route
        path="/applicant/dashboard"
        element={
          <RoleGuard allowedRoles={["applicant"]}>
            <ApplicantDashboard />
          </RoleGuard>
        }
      />
      <Route
        path="/applicant/applications"
        element={
          <RoleGuard allowedRoles={["applicant"]}>
            <ApplicationList />
          </RoleGuard>
        }
      />
      <Route
        path="/applicant/applications/:id"
        element={
          <RoleGuard allowedRoles={["applicant"]}>
            <ApplicationDetail />
          </RoleGuard>
        }
      />
      <Route
        path="/applicant/submit-application"
        element={
          <RoleGuard allowedRoles={["applicant"]}>
            <SubmitApplication />
          </RoleGuard>
        }
      />
      <Route
        path="/applicant/submit-application/hoc-ba"
        element={
          <RoleGuard allowedRoles={["applicant"]}>
            <SubmitHocBa />
          </RoleGuard>
        }
      />
      <Route
        path="/applicant/submit-application/danh-gia-nang-luc"
        element={
          <RoleGuard allowedRoles={["applicant"]}>
            <SubmitDGNL />
          </RoleGuard>
        }
      />
      <Route
        path="/applicant/submit-application/tot-nghiep-thpt"
        element={
          <RoleGuard allowedRoles={["applicant"]}>
            <SubmitTHPT />
          </RoleGuard>
        }
      />
      <Route
        path="/applicant/submit-application/phuong-thuc-khac"
        element={
          <RoleGuard allowedRoles={["applicant"]}>
            <SubmitKhac />
          </RoleGuard>
        }
      />
      <Route
        path="/applicant/profile"
        element={
          <RoleGuard allowedRoles={["applicant"]}>
            <ApplicantProfilePage />
          </RoleGuard>
        }
      />

      {/* staff */}
      <Route
        path="/staff/dashboard"
        element={
          <RoleGuard allowedRoles={["staff"]}>
            <StaffDashboard />
          </RoleGuard>
        }
      />
      <Route
        path="/staff/agents/dashboard"
        element={
          <RoleGuard allowedRoles={["staff"]}>
            <AgentDashboard />
          </RoleGuard>
        }
      />
      <Route
        path="/staff/agents/performance"
        element={
          <RoleGuard allowedRoles={["staff"]}>
            <AgentPerformance />
          </RoleGuard>
        }
      />

      {/* qa */}
      <Route
        path="/qa/dashboard"
        element={
          <RoleGuard allowedRoles={["qa"]}>
            <QaDashboard />
          </RoleGuard>
        }
      />
      <Route
        path="/qa/review-evaluation"
        element={
          <RoleGuard allowedRoles={["qa"]}>
            <ReviewEvaluationPage />
          </RoleGuard>
        }
      />

      {/* admin */}
      <Route
        path="/admin/dashboard"
        element={
          <RoleGuard allowedRoles={["admin"]}>
            <AdminDashboard />
          </RoleGuard>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RoleGuard allowedRoles={["admin"]}>
            <ReportDashboard />
          </RoleGuard>
        }
      />
      <Route
        path="/admin/eligibility/rules"
        element={
          <RoleGuard allowedRoles={["admin"]}>
            <RuleConfigPage />
          </RoleGuard>
        }
      />
      <Route
        path="/admin/articles"
        element={
          <RoleGuard allowedRoles={["admin"]}>
            <ArticleList />
          </RoleGuard>
        }
      />
      <Route
        path="/admin/articles/new"
        element={
          <RoleGuard allowedRoles={["admin"]}>
            <ArticleEditor />
          </RoleGuard>
        }
      />
      <Route
        path="/admin/articles/:id"
        element={
          <RoleGuard allowedRoles={["admin"]}>
            <ArticleDetail />
          </RoleGuard>
        }
      />
      <Route
        path="/admin/applications"
        element={
          <RoleGuard allowedRoles={["admin"]}>
            <AdminApplicationList />
          </RoleGuard>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

