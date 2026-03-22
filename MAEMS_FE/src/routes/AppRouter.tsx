import { Route, Routes } from "react-router-dom";
import { RoleGuard } from "./RoleGuard";
// dashboard pages
import { ApplicantDashboard } from "../pages/applicant/ApplicantDashboard";
import { ApplicantProfilePage } from "../pages/applicant/ApplicantProfilePage";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { AdminProfile } from "../pages/admin/AdminProfile";
import { OfficerDashboard } from "../pages/officer/OfficerDashboard";
import { OfficerApplicationList } from "../pages/officer/OfficerApplicationList";
import { OfficerApplicationDetail } from "../pages/officer/OfficerApplicationDetail";
import { OfficerProfile } from "../pages/officer/OfficerProfile";
import { OfficerReports } from "../pages/officer/OfficerReports";
import { OfficerArticles } from "../pages/officer/OfficerArticles";
import { QaDashboard } from "../pages/qa/QaDashboard";
import { QAProfile } from "../pages/qa/QAProfile";
// feature pages
import { AgentDashboard } from "../pages/agents/AgentDashboard";
import { AgentPerformance } from "../pages/agents/AgentPerformance";
import { ApplicationDetail } from "../pages/application/ApplicationDetail";
import { ApplicationList } from "../pages/application/ApplicationList";
import { SubmitApplication } from "../pages/application/SubmitApplication";
import { SubmitForm } from "../pages/application/SubmitForm";
import { ArticleDetail } from "../pages/articles/ArticleDetail";
import { ArticleEditor } from "../pages/articles/ArticleEditor";
import { NewsPage } from "../pages/articles/NewsPage";
import { ArticleKV1Page } from "../pages/articles/ArticleKV1Page";
import { AdmissionPage } from "../pages/admission/AdmissionPage";
import { AdmissionTypesPage } from "../pages/admission/AdmissionTypesPage";
import { HanoiTuitionPage } from "../pages/admission/HanoiTuitionPage";
import { HCMTuitionPage } from "../pages/admission/HCMTuitionPage";
import { DaNangTuitionPage } from "../pages/admission/DaNangTuitionPage";
import { CanThoTuitionPage } from "../pages/admission/CanThoTuitionPage";
import { QuyNhonTuitionPage } from "../pages/admission/QuyNhonTuitionPage";
import { HomePage } from "../pages/homepage/HomePage";
import { AuthPage } from "../pages/auth/AuthPage";
import { ProgramList } from "../pages/programs/ProgramList";
import { ProgramDetail } from "../pages/programs/ProgramDetail";
import { RuleConfigPage } from "../pages/eligibility/RuleConfigPage";
import { ReviewEvaluationPage } from "../pages/qa/ReviewEvaluationPage";
import { ContactPage } from "../pages/contact/ContactPage";
import { AdminApplicationList } from "../pages/admin/AdminApplicationList";
import { AdminStudentManagement } from "../pages/admin/AdminStudentManagement";
import { AdminProgramManagement } from "../pages/admin/AdminProgramManagement";
import { AdminPaymentManagement } from "../pages/admin/AdminPaymentManagement";
import { AdminReports } from "../pages/admin/AdminReports";
import { AdminSettings } from "../pages/admin/AdminSettnigs";
import { AdminUserManagement } from "../pages/admin/AdminUserManagement";
import { NotFound } from "../pages/notfound/NotFound";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/tuyen-sinh" element={<AdmissionPage />} />
      <Route path="/tuyen-sinh/phuong-thuc" element={<AdmissionTypesPage />} />
      <Route path="/tuyen-sinh/hoc-phi-ha-noi" element={<HanoiTuitionPage />} />
      <Route path="/tuyen-sinh/hoc-phi-hcm" element={<HCMTuitionPage />} />
      <Route path="/tuyen-sinh/hoc-phi-da-nang" element={<DaNangTuitionPage />} />
      <Route path="/tuyen-sinh/hoc-phi-can-tho" element={<CanThoTuitionPage />} />
      <Route path="/tuyen-sinh/hoc-phi-quy-nhon" element={<QuyNhonTuitionPage />} />
      <Route path="/dao-tao" element={<ProgramList />} />
      <Route path="/dao-tao/:id" element={<ProgramDetail />} />
      <Route path="/tin-tuc" element={<NewsPage />} />
      <Route path="/tin-tuc/ho-tro-hoc-phi-kv1" element={<ArticleKV1Page />} />
      <Route path="/lien-he" element={<ContactPage />} />
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
        path="/applicant/submit-application/form"
        element={
          <RoleGuard allowedRoles={["applicant"]}>
            <SubmitForm />
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

      {/* officer */}
      <Route
        path="/officer/dashboard"
        element={
          <RoleGuard allowedRoles={["officer"]}>
            <OfficerDashboard />
          </RoleGuard>
        }
      />
      <Route
        path="/officer/review-applications"
        element={
          <RoleGuard allowedRoles={["officer"]}>
            <OfficerApplicationList />
          </RoleGuard>
        }
      />
      <Route
        path="/officer/applications/:id"
        element={
          <RoleGuard allowedRoles={["officer"]}>
            <OfficerApplicationDetail />
          </RoleGuard>
        }
      />
      <Route
        path="/officer/reports"
        element={
          <RoleGuard allowedRoles={["officer"]}>
            <OfficerReports />
          </RoleGuard>
        }
      />
      <Route
        path="/officer/agents/dashboard"
        element={
          <RoleGuard allowedRoles={["officer"]}>
            <AgentDashboard />
          </RoleGuard>
        }
      />
      <Route
        path="/officer/agents/performance"
        element={
          <RoleGuard allowedRoles={["officer"]}>
            <AgentPerformance />
          </RoleGuard>
        }
      />
      <Route
        path="/officer/articles"
        element={
          <RoleGuard allowedRoles={["officer"]}>
            <OfficerArticles />
          </RoleGuard>
        }
      />
      <Route
        path="/officer/articles/new"
        element={
          <RoleGuard allowedRoles={["officer"]}>
            <ArticleEditor />
          </RoleGuard>
        }
      />
      <Route
        path="/officer/articles/:id"
        element={
          <RoleGuard allowedRoles={["officer"]}>
            <ArticleDetail />
          </RoleGuard>
        }
      />
      <Route
        path="/officer/profile"
        element={
          <RoleGuard allowedRoles={["officer"]}>
            <OfficerProfile />
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
      <Route
        path="/qa/profile"
        element={
          <RoleGuard allowedRoles={["qa"]}>
            <QAProfile />
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
            <AdminReports />
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
        path="/admin/profile"
        element={
          <RoleGuard allowedRoles={["admin"]}>
            <AdminProfile />
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
      <Route
        path="/admin/students"
        element={
          <RoleGuard allowedRoles={["admin"]}>
            <AdminStudentManagement />
          </RoleGuard>
        }
      />
      <Route
        path="/admin/programs"
        element={
          <RoleGuard allowedRoles={["admin"]}>
            <AdminProgramManagement />
          </RoleGuard>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <RoleGuard allowedRoles={["admin"]}>
            <AdminPaymentManagement />
          </RoleGuard>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <RoleGuard allowedRoles={["admin"]}>
            <AdminSettings />
          </RoleGuard>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RoleGuard allowedRoles={["admin"]}>
            <AdminUserManagement />
          </RoleGuard>
        }
      />
      

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

