import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Progress, Row, Spin, Tag, Typography } from "antd";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  CircleDot,
  Clock,
  FilePlus,
  FileText,
  Hourglass,
  MessageCircleQuestion,
  Paperclip,
  UserRound,
  XCircle,
} from "lucide-react";
import { ApplicantLayout } from "../../layouts/ApplicantLayout";
import { ApplicantMenu } from "./ApplicantMenu";
import { useAuthStore } from "../../stores/authStore";
import { getMyApplicant } from "../../api/applicants";
import { fetchMyApplications } from "../../api/applications";
import type { CreateApplicantResponse } from "../../types/applicant";
import {
  APPLICATION_STATUS,
  APPLICATION_STATUS_CARD_TW,
  APPLICATION_STATUS_HEX,
  type ApplicationMe,
  type ApplicationStatus,
} from "../../types/application";

const { Title, Text } = Typography;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<
  ApplicationStatus,
  { label: string; color: string; antColor: string; Icon: React.ElementType }
> = {
  draft: {
    label: APPLICATION_STATUS.draft,
    color: "text-gray-500",
    antColor: "default",
    Icon: CircleDot,
  },
  submitted: {
    label: APPLICATION_STATUS.submitted,
    color: "text-blue-500",
    antColor: "blue",
    Icon: Clock,
  },
  under_review: {
    label: APPLICATION_STATUS.under_review,
    color: "text-violet-600",
    antColor: "processing",
    Icon: Hourglass,
  },
  approved: {
    label: APPLICATION_STATUS.approved,
    color: "text-green-600",
    antColor: "success",
    Icon: CheckCircle2,
  },
  rejected: {
    label: APPLICATION_STATUS.rejected,
    color: "text-red-500",
    antColor: "error",
    Icon: XCircle,
  },
  document_required: {
    label: APPLICATION_STATUS.document_required,
    color: "text-cyan-600",
    antColor: "warning",
    Icon: CircleAlert,
  },
};

function profileCompletion(
  applicant: CreateApplicantResponse | null,
  apps: ApplicationMe[],
): number {
  let score = 0;
  if (applicant) score += 40;
  if (apps.length > 0) score += 30;
  const hasSubmitted = apps.some((a) =>
    ["submitted", "under_review", "approved"].includes(a.status),
  );
  if (hasSubmitted) score += 30;
  return score;
}

function overallStatus(apps: ApplicationMe[]): ApplicationStatus | null {
  if (apps.some((a) => a.status === "approved")) return "approved";
  if (apps.some((a) => a.status === "under_review")) return "under_review";
  if (apps.some((a) => a.status === "submitted")) return "submitted";
  if (apps.some((a) => a.status === "rejected")) return "rejected";
  if (apps.some((a) => a.status === "draft")) return "draft";
  return null;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ApplicantDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [applicant, setApplicant] = useState<CreateApplicantResponse | null>(
    null,
  );
  const [apps, setApps] = useState<ApplicationMe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyApplicant().catch(() => null),
      fetchMyApplications().catch(() => []),
    ])
      .then(([ap, apList]) => {
        setApplicant(ap);
        setApps(apList ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const completion = profileCompletion(applicant, apps);
  const overall = overallStatus(apps);
  const displayName =
    applicant?.fullName ?? user?.username ?? user?.email ?? "Thí sinh";

  // stats
  const countByStatus = (s: ApplicationStatus) =>
    apps.filter((a) => a.status === s).length;
  const stats: {
    label: string;
    value: number;
    tw: (typeof APPLICATION_STATUS_CARD_TW)[ApplicationStatus];
    accentStatus: ApplicationStatus;
  }[] = [
    {
      label: "Hồ sơ đã nộp",
      value: apps.length,
      tw: APPLICATION_STATUS_CARD_TW.submitted,
      accentStatus: "submitted",
    },
    {
      label: APPLICATION_STATUS.under_review,
      value: countByStatus("under_review"),
      tw: APPLICATION_STATUS_CARD_TW.under_review,
      accentStatus: "under_review",
    },
    {
      label: APPLICATION_STATUS.document_required,
      value: countByStatus("document_required"),
      tw: APPLICATION_STATUS_CARD_TW.document_required,
      accentStatus: "document_required",
    },
    {
      label: APPLICATION_STATUS.approved,
      value: countByStatus("approved"),
      tw: APPLICATION_STATUS_CARD_TW.approved,
      accentStatus: "approved",
    },
    {
      label: APPLICATION_STATUS.draft,
      value: countByStatus("draft"),
      tw: APPLICATION_STATUS_CARD_TW.draft,
      accentStatus: "draft",
    },
  ];

  // recent apps (last 3)
  const recentApps = [...apps]
    .sort(
      (a, b) =>
        new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime(),
    )
    .slice(0, 3);

  const quickActions = [
    {
      label: "Đăng ký ngành mới",
      icon: FilePlus,
      path: "/applicant/submit-application",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      label: "Nộp / bổ sung tài liệu",
      icon: Paperclip,
      path: "/applicant/applications",
      color: "bg-orange-600 hover:bg-orange-700",
    },
    {
      label: "Xem đơn đăng ký",
      icon: FileText,
      path: "/applicant/applications",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      label: "Cập nhật hồ sơ",
      icon: UserRound,
      path: "/applicant/profile",
      color: "bg-teal-500 hover:bg-teal-600",
    },
    {
      label: "Tìm hiểu ngành học",
      icon: BookOpen,
      path: "/tuyen-sinh",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      label: "Hỏi đáp tuyển sinh",
      icon: MessageCircleQuestion,
      path: "/tuyen-sinh",
      color: "bg-pink-500 hover:bg-pink-600",
    },
  ];

  /* Render */
  return (
    <ApplicantLayout menuItems={ApplicantMenu}>
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <Spin size="large" />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* ── Welcome banner ── */}
          <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 shadow-md">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center shrink-0">
              <UserRound size={32} className="text-white" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <Text className="!text-orange-200 !text-xs uppercase tracking-widest">
                {getGreeting()}
              </Text>
              <Title level={4} className="!mb-1 !text-white !font-bold">
                {displayName}
              </Title>
              {applicant && (
                <Text className="!text-orange-200 !text-xs">
                  {applicant.contactEmail} &nbsp;·&nbsp;{" "}
                  {applicant.contactPhone}
                </Text>
              )}

              {/* Overall status badge */}
              {overall &&
                (() => {
                  const sc = statusConfig[overall];
                  return (
                    <div className="flex items-center gap-1.5 mt-2">
                      <sc.Icon size={14} className="text-white opacity-80" />
                      <Text className="!text-white !text-xs !font-medium opacity-90">
                        Trạng thái hiện tại: {sc.label}
                      </Text>
                    </div>
                  );
                })()}
            </div>

            {/* Profile progress */}
            <div className="w-full sm:w-52 shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <Text className="!text-orange-200 !text-xs">
                  Mức độ hoàn thiện hồ sơ
                </Text>
                <Text className="!text-white !text-xs !font-bold">
                  {completion}%
                </Text>
              </div>
              <Progress
                percent={completion}
                showInfo={false}
                strokeColor="#fff"
                trailColor="rgba(255,255,255,0.25)"
                size={["100%", 8]}
                className="!mb-0"
              />
              <Text className="!text-orange-200 !text-[11px] mt-1 block">
                {completion < 40
                  ? "Hãy tạo hồ sơ cá nhân để bắt đầu"
                  : completion < 70
                    ? "Hãy nộp đơn đăng ký ngành học"
                    : "Hãy nộp tài liệu để hoàn tất"}
              </Text>
            </div>
          </div>

          {/* ── Stats cards ── */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
            {stats.map((s) => (
              <Card
                key={s.label}
                className={[
                  "h-full min-h-[100px] rounded-2xl border shadow-sm",
                  "transition-[box-shadow,transform] duration-200 ease-out",
                  "hover:shadow-md hover:-translate-y-0.5",
                  "cursor-default overflow-hidden",
                  s.tw.border,
                  s.tw.bg,
                ].join(" ")}
                styles={{ body: { padding: "14px 16px 16px" } }}
              >
                <div
                  className="-mx-4 -mt-[14px] mb-3 h-1 rounded-none opacity-90"
                  style={{
                    backgroundColor: APPLICATION_STATUS_HEX[s.accentStatus],
                  }}
                  aria-hidden
                />
                <Text className="!mb-0 block text-[11px] font-semibold uppercase tracking-wider text-gray-500 leading-snug">
                  {s.label}
                </Text>
                <div
                  className={[
                    "mt-2 text-3xl font-extrabold tabular-nums tracking-tight sm:text-4xl",
                    s.tw.iconColor,
                  ].join(" ")}
                >
                  {s.value}
                </div>
              </Card>
            ))}
          </div>

          {/* ── Middle row ── */}
          <Row gutter={[16, 16]} className="mb-5">
            {/* Recent applications */}
            <Col xs={24} lg={14}>
              <Card
                className="rounded-2xl border border-gray-100 shadow-sm h-full"
                styles={{ body: { padding: "20px 24px" } }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Title
                    level={5}
                    className="!mb-0 !text-gray-700 !font-semibold"
                  >
                    Đơn đăng ký gần đây
                  </Title>
                  <Button
                    type="link"
                    size="small"
                    className="!text-orange-500 !p-0"
                    onClick={() => navigate("/applicant/applications")}
                  >
                    Xem tất cả <ChevronRight size={13} className="inline" />
                  </Button>
                </div>

                {recentApps.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8">
                    <FileText size={36} className="text-gray-200" />
                    <Text className="text-gray-400 text-sm">
                      Bạn chưa có đơn đăng ký nào.
                    </Text>
                    <Button
                      type="primary"
                      size="small"
                      className="!rounded-lg !bg-orange-500 !border-orange-500 mt-1"
                      onClick={() => navigate("/applicant/submit-application")}
                    >
                      Đăng ký ngay
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {recentApps.map((app) => {
                      const sc = statusConfig[app.status];
                      return (
                        <div
                          key={app.applicationId}
                          onClick={() =>
                            navigate(
                              `/applicant/applications/${app.applicationId}`,
                            )
                          }
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                          <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                            <FileText size={16} className="text-orange-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <Text className="text-sm font-semibold text-gray-700 block truncate">
                              {app.programName}
                            </Text>
                            <Text className="text-[11px] text-gray-400">
                              {app.admissionTypeName} &nbsp;·&nbsp;{" "}
                              {app.campusName}
                              {app.lastUpdated && (
                                <>
                                  {" "}
                                  &nbsp;·&nbsp; {formatDate(app.lastUpdated)}
                                </>
                              )}
                            </Text>
                          </div>
                          <Tag color={sc.antColor} className="text-xs shrink-0">
                            {sc.label}
                          </Tag>
                          <ChevronRight
                            size={14}
                            className="text-gray-300 group-hover:text-gray-500 shrink-0 transition-colors"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            </Col>

            {/* Quick actions */}
            <Col xs={24} lg={10}>
              <Card
                className="rounded-2xl border border-gray-100 shadow-sm h-full"
                styles={{ body: { padding: "20px 24px" } }}
              >
                <Title
                  level={5}
                  className="!mb-4 !text-gray-700 !font-semibold"
                >
                  Thao tác nhanh
                </Title>
                <div className="grid grid-cols-2 gap-2.5">
                  {quickActions.map((a) => (
                    <button
                      key={a.label}
                      onClick={() => navigate(a.path)}
                      className={`flex flex-col items-center gap-2 p-3.5 rounded-xl text-white text-center cursor-pointer border-0 transition-all ${a.color}`}
                    >
                      <a.icon size={22} />
                      <span className="text-xs font-medium leading-tight">
                        {a.label}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>
            </Col>
          </Row>

          {/* ── Profile reminder ── */}
          {!applicant && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
              <CircleAlert
                size={20}
                className="text-amber-500 shrink-0 mt-0.5"
              />
              <div className="flex-1">
                <Text className="text-sm font-semibold text-amber-800 block">
                  Hồ sơ cá nhân chưa được tạo
                </Text>
                <Text className="text-xs text-amber-600">
                  Bạn cần tạo hồ sơ cá nhân trước khi nộp đơn đăng ký xét tuyển.
                </Text>
              </div>
              <Button
                size="small"
                className="!rounded-lg !border-amber-400 !text-amber-700 !bg-amber-50 hover:!bg-amber-100 shrink-0"
                onClick={() => navigate("/applicant/profile")}
              >
                Tạo hồ sơ ngay
              </Button>
            </div>
          )}
        </div>
      )}
    </ApplicantLayout>
  );
}
