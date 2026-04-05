import {
  Button,
  Card,
  Col,
  Row,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AlertTriangle,
  Check,
  ClipboardList,
  Eye,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchAllApplications } from "../../api/applications";
import { OfficerLayout } from "../../components/layouts/OfficerLayout";
import type { Application } from "../../types/application";
import {
  APPLICATION_NEED_ACTION_PRESET_COMBO_LABEL,
  APPLICATION_PENDING_PRESET_COMBO_LABEL,
  APPLICATION_REQUIRES_REVIEW_LABEL,
  APPLICATION_STATUS,
  APPLICATION_STATUS_CARD_TW,
  APPLICATION_STATUS_HEX,
  type ApplicationStatus,
} from "../../types/application";

const { Title, Text } = Typography;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TOTAL_CARD_TW = {
  bg: "bg-blue-50",
  iconColor: "text-blue-500",
  border: "border-blue-100",
} as const;

const OFFICER_APP_LIST_PATH = "/officer/review-applications";

type ApplicationListFilter =
  | { kind: "all" }
  | { kind: "preset"; preset: "pending" | "need_action" }
  | { kind: "status"; status: ApplicationStatus };

function applicationListHref(f: ApplicationListFilter): string {
  if (f.kind === "all") return OFFICER_APP_LIST_PATH;
  if (f.kind === "preset") return `${OFFICER_APP_LIST_PATH}?preset=${f.preset}`;
  return `${OFFICER_APP_LIST_PATH}?status=${f.status}`;
}

function pct(part: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((part / total) * 100)}%`;
}

function parseAgentNote(notes: string | null) {
  if (!notes) return { missingDocs: [] };
  const m = notes.match(/Missing required document types?:\s*([^\n.]+)/i);
  const missingDocs = m ? m[1].split(",").map((s) => s.trim()) : [];
  return { missingDocs };
}

// ─── Escalated table columns ─────────────────────────────────────────────────

function useEscalatedColumns(
  navigate: ReturnType<typeof useNavigate>,
): ColumnsType<Application> {
  return [
    {
      title: "Mã đơn",
      dataIndex: "applicationId",
      key: "id",
      width: 80,
      render: (id: number) => (
        <Text className="font-mono text-xs text-indigo-600 font-semibold">
          #{id}
        </Text>
      ),
    },
    {
      title: "Tên thí sinh",
      dataIndex: "applicantName",
      key: "name",
      render: (name: string) => (
        <Text className="font-medium text-gray-800">{name}</Text>
      ),
    },
    {
      title: "Ngành đăng ký",
      dataIndex: "programName",
      key: "major",
      render: (prog: string) => (
        <Text className="text-gray-600 text-sm">{prog}</Text>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: string, record: Application) => {
        if (status === "under_review")
          return (
            <Tag color="processing">{APPLICATION_STATUS.under_review}</Tag>
          );
        if (record.requiresReview)
          return <Tag color="error">{APPLICATION_REQUIRES_REVIEW_LABEL}</Tag>;
        return <Tag color="processing">Đang chờ</Tag>;
      },
    },
    {
      title: "Lý do / Ghi chú agent",
      dataIndex: "notes",
      key: "reason",
      render: (notes: string | null, record: Application) => {
        const { missingDocs } = parseAgentNote(notes);
        if (missingDocs.length > 0) {
          return (
            <div>
              <Text className="text-amber-600 text-xs block mb-1">
                Thiếu tài liệu:
              </Text>
              <div className="flex flex-wrap gap-1">
                {missingDocs.map((d) => (
                  <Tag
                    key={d}
                    color="orange"
                    className="!text-[10px] !m-0 !px-1"
                  >
                    {d.replace(/_/g, " ")}
                  </Tag>
                ))}
              </div>
            </div>
          );
        }
        if (notes)
          return <Text className="text-gray-500 text-xs">{notes}</Text>;
        return (
          <Text className="text-gray-300 text-xs">
            {record.requiresReview
              ? APPLICATION_REQUIRES_REVIEW_LABEL
              : "Chờ xử lý"}
          </Text>
        );
      },
    },
    {
      title: "",
      key: "action",
      width: 70,
      render: (_: unknown, record: Application) => (
        <Button
          size="small"
          icon={<Eye size={13} />}
          type="link"
          onClick={() =>
            navigate(`/officer/applications/${record.applicationId}`)
          }
        >
          Xem
        </Button>
      ),
    },
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────

export function OfficerDashboard() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const columns = useEscalatedColumns(navigate);

  useEffect(() => {
    fetchAllApplications()
      .then((result) => setApplications(result.items))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter(
      (a) => a.status === "submitted" || a.status === "draft",
    ).length;
    const needsCheck = applications.filter(
      (a) => a.status === "under_review" || a.requiresReview,
    ).length;
    const approved = applications.filter((a) => a.status === "approved").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    return { total, pending, needsCheck, approved, rejected };
  }, [applications]);

  // ── Pie chart: by status ───────────────────────────────────────────────────
  const statusChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of applications) {
      counts[a.status] = (counts[a.status] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([status, value]) => ({
        name:
          status in APPLICATION_STATUS
            ? APPLICATION_STATUS[status as ApplicationStatus]
            : status,
        value,
        color:
          status in APPLICATION_STATUS_HEX
            ? APPLICATION_STATUS_HEX[status as ApplicationStatus]
            : "#6366f1",
      }))
      .sort((a, b) => b.value - a.value);
  }, [applications]);

  // ── Bar chart: by program ──────────────────────────────────────────────────
  const majorChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const a of applications) {
      counts[a.programName] = (counts[a.programName] ?? 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [applications]);

  // ── Escalated list: top 5 cần xử lý ──────────────────────────────────────
  const escalatedList = useMemo(
    () =>
      applications
        .filter((a) => a.status === "under_review" || a.requiresReview)
        .slice(0, 5),
    [applications],
  );

  // ── Quick stats cards config ───────────────────────────────────────────────
  const quickStats: Array<{
    label: string;
    value: number;
    bg: string;
    iconColor: string;
    border: string;
    trendDotClass: string;
    icon: ReactNode;
    trend: string;
  }> = [
    {
      label: "Tổng hồ sơ",
      value: stats.total,
      ...TOTAL_CARD_TW,
      trendDotClass: "bg-blue-500",
      icon: <Users size={20} />,
      trend: `${stats.total} hồ sơ`,
    },
    {
      label: APPLICATION_PENDING_PRESET_COMBO_LABEL,
      value: stats.pending,
      ...APPLICATION_STATUS_CARD_TW.submitted,
      trendDotClass: "bg-amber-500",
      icon: <ClipboardList size={20} />,
      trend: `${pct(stats.pending, stats.total)} tổng hồ sơ`,
    },
    {
      label: APPLICATION_NEED_ACTION_PRESET_COMBO_LABEL,
      value: stats.needsCheck,
      ...APPLICATION_STATUS_CARD_TW.under_review,
      trendDotClass: "bg-violet-600",
      icon: <AlertTriangle size={20} />,
      trend: stats.needsCheck > 0 ? "Cần xử lý gấp" : "Không có",
    },
    {
      label: APPLICATION_STATUS.approved,
      value: stats.approved,
      ...APPLICATION_STATUS_CARD_TW.approved,
      trendDotClass: "bg-emerald-500",
      icon: <Check size={20} strokeWidth={2.5} />,
      trend: `${pct(stats.approved, stats.total)} tổng hồ sơ`,
    },
    {
      label: APPLICATION_STATUS.rejected,
      value: stats.rejected,
      ...APPLICATION_STATUS_CARD_TW.rejected,
      trendDotClass: "bg-red-500",
      icon: <X size={20} strokeWidth={2.5} />,
      trend: `${pct(stats.rejected, stats.total)} tổng hồ sơ`,
    },
  ];

  const quickAccessLinks: Array<{
    title: string;
    subtitle: string;
    filter: ApplicationListFilter;
    icon: ReactNode;
    ring: string;
    bg: string;
    hoverBg: string;
    iconBg: string;
    titleClass: string;
    subtitleClass: string;
  }> = [
    {
      title: "Tất cả hồ sơ",
      subtitle: loading ? "—" : `${stats.total} hồ sơ`,
      filter: { kind: "all" },
      icon: <Users size={18} />,
      ring: "border-blue-100",
      bg: "bg-blue-50",
      hoverBg: "hover:bg-blue-100",
      iconBg: "bg-blue-500",
      titleClass: "text-blue-700",
      subtitleClass: "text-blue-400",
    },
    {
      title: APPLICATION_PENDING_PRESET_COMBO_LABEL,
      subtitle: loading ? "—" : `${stats.pending} hồ sơ`,
      filter: { kind: "preset", preset: "pending" },
      icon: <ClipboardList size={18} />,
      ring: "border-amber-100",
      bg: "bg-amber-50",
      hoverBg: "hover:bg-amber-100",
      iconBg: "bg-amber-500",
      titleClass: "text-amber-800",
      subtitleClass: "text-amber-600",
    },
    {
      title: APPLICATION_NEED_ACTION_PRESET_COMBO_LABEL,
      subtitle: loading ? "—" : `${stats.needsCheck} hồ sơ`,
      filter: { kind: "preset", preset: "need_action" },
      icon: <Zap size={18} />,
      ring: "border-violet-100",
      bg: "bg-violet-50",
      hoverBg: "hover:bg-violet-100",
      iconBg: "bg-violet-600",
      titleClass: "text-violet-700",
      subtitleClass: "text-violet-500",
    },
    {
      title: APPLICATION_STATUS.approved,
      subtitle: loading ? "—" : `${pct(stats.approved, stats.total)} tổng`,
      filter: { kind: "status", status: "approved" },
      icon: <Check size={18} strokeWidth={2.5} />,
      ring: "border-emerald-100",
      bg: "bg-emerald-50",
      hoverBg: "hover:bg-emerald-100",
      iconBg: "bg-emerald-500",
      titleClass: "text-emerald-700",
      subtitleClass: "text-emerald-500",
    },
    {
      title: APPLICATION_STATUS.rejected,
      subtitle: loading ? "—" : `${pct(stats.rejected, stats.total)} tổng`,
      filter: { kind: "status", status: "rejected" },
      icon: <X size={18} strokeWidth={2.5} />,
      ring: "border-red-100",
      bg: "bg-red-50",
      hoverBg: "hover:bg-red-100",
      iconBg: "bg-red-500",
      titleClass: "text-red-700",
      subtitleClass: "text-red-500",
    },
  ];

  return (
    <OfficerLayout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Title level={4} className="!mb-1 !text-gray-800 !font-bold">
            Dashboard Tuyển Sinh
          </Title>
          <Text className="text-gray-400 text-sm">
            Theo dõi tình trạng tuyển sinh tổng quan — cập nhật lúc{" "}
            {new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </div>
        <Button
          icon={<ClipboardList size={14} />}
          loading={loading}
          onClick={() => {
            setLoading(true);
            fetchAllApplications()
              .then((result) => setApplications(result.items))
              .finally(() => setLoading(false));
          }}
          className="!rounded-xl"
        >
          Làm mới
        </Button>
      </div>

      <Spin spinning={loading}>
        {/* Quick Stats */}
        <Row gutter={[12, 12]} className="mb-6">
          {quickStats.map((s) => (
            <Col xs={12} sm={12} md={8} lg={8} xl={4} key={s.label}>
              <Card
                className={`rounded-2xl border ${s.border} shadow-sm`}
                styles={{ body: { padding: "16px 20px" } }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center ${s.iconColor}`}
                  >
                    {s.icon}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block size-2 shrink-0 rounded-full ${s.trendDotClass}`}
                      aria-hidden
                    />
                    <span className="text-[11px] text-gray-400">{s.trend}</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {loading ? "—" : s.value}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Charts */}
        <Row gutter={[16, 16]} className="mb-6">
          {/* Pie – theo trạng thái */}
          <Col xs={24} md={10}>
            <Card
              className="rounded-2xl border border-gray-100 shadow-sm h-full"
              styles={{ body: { padding: "20px 24px" } }}
            >
              <Title level={5} className="!mb-4 !text-gray-700">
                Hồ sơ theo trạng thái
              </Title>
              {statusChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const p = payload[0];
                        const label = String(p.name ?? p.payload?.name ?? "");
                        const count = Number(p.value ?? 0);
                        return (
                          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md">
                            <div className="text-sm font-semibold text-gray-800">
                              {label}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                              {count} hồ sơ
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-xs text-gray-600">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">
                  Chưa có dữ liệu
                </div>
              )}
            </Card>
          </Col>

          {/* Bar – theo ngành */}
          <Col xs={24} md={14}>
            <Card
              className="rounded-2xl border border-gray-100 shadow-sm h-full"
              styles={{ body: { padding: "20px 24px" } }}
            >
              <Title level={5} className="!mb-4 !text-gray-700">
                Hồ sơ theo ngành
              </Title>
              {majorChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={majorChartData}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      angle={majorChartData.length > 5 ? -20 : 0}
                      textAnchor={majorChartData.length > 5 ? "end" : "middle"}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(value) => [`${value} hồ sơ`, "Số lượng"]}
                      cursor={{ fill: "#eff6ff" }}
                    />
                    <Bar
                      dataKey="total"
                      fill="#3b82f6"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">
                  Chưa có dữ liệu
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Danh sách cần xử lý */}
        <Card
          className="rounded-2xl border border-gray-100 shadow-sm mb-6"
          styles={{ body: { padding: "20px 24px" } }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <Title level={5} className="!mb-0.5 !text-gray-700">
                Danh sách hồ sơ cần xử lý
              </Title>
              <Text className="text-xs text-gray-400">
                {APPLICATION_STATUS.under_review} hoặc{" "}
                {APPLICATION_REQUIRES_REVIEW_LABEL}
                {!loading && escalatedList.length > 0 && (
                  <span className="ml-1 text-violet-600 font-medium">
                    ({escalatedList.length})
                  </span>
                )}
              </Text>
            </div>
            <Button
              type="primary"
              size="small"
              onClick={() => navigate("/officer/review-applications")}
              className="!rounded-lg"
            >
              Xem tất cả
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={escalatedList}
            rowKey="applicationId"
            pagination={false}
            size="small"
            locale={{ emptyText: "Không có hồ sơ cần xử lý" }}
            rowClassName="hover:bg-gray-50 transition-colors"
          />
        </Card>

        {/* Truy cập nhanh */}
        <div className="block" style={{ marginTop: 32, paddingBottom: 32 }}>
          <Card
            className="rounded-2xl border border-gray-100 shadow-sm"
            styles={{ body: { padding: "20px 24px" } }}
          >
            <Title level={5} className="!mb-1 !text-gray-700">
              Truy cập nhanh
            </Title>
            <Text className="text-xs text-gray-400 block mb-4">
              Mở trang quản lý hồ sơ với bộ lọc sẵn theo từng loại
            </Text>
            <Row gutter={[12, 12]}>
              {quickAccessLinks.map((item) => (
                <Col xs={24} sm={12} md={8} key={item.title}>
                  <button
                    type="button"
                    onClick={() => navigate(applicationListHref(item.filter))}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border ${item.ring} ${item.bg} ${item.hoverBg} transition-colors text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${item.iconBg} flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`font-semibold text-sm ${item.titleClass}`}
                      >
                        {item.title}
                      </div>
                      <div className={`text-xs ${item.subtitleClass}`}>
                        {item.subtitle}
                      </div>
                    </div>
                  </button>
                </Col>
              ))}
            </Row>
          </Card>
        </div>
      </Spin>
    </OfficerLayout>
  );
}
