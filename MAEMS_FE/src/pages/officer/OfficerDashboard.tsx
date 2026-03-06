import { Badge, Button, Card, Col, Row, Spin, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  AlertTriangle,
  BarChart2,
  ClipboardList,
  Eye,
  FileText,
  LayoutDashboard,
  TrendingUp,
  User,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { fetchAllApplications } from "../../api/application";
import { DashboardLayout } from "../../components/DashboardLayout";
import type { SidebarMenuItem } from "../../components/DashboardSidebar";
import type { Application } from "../../types/application";

const { Title, Text } = Typography;

// ─── Menu ────────────────────────────────────────────────────────────────────

const menuItems: SidebarMenuItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={16} />,
    path: "/officer/dashboard",
  },
  {
    key: "review-applications",
    label: "Đánh giá đơn ĐK",
    icon: <ClipboardList size={16} />,
    path: "/officer/review-applications",
  },
  {
    key: "escalations",
    label: "Các trường hợp leo thang",
    icon: <AlertTriangle size={16} />,
    path: "/officer/escalations",
  },
  {
    key: "reports",
    label: "Báo cáo",
    icon: <BarChart2 size={16} />,
    path: "/officer/reports",
  },
  {
    key: "profile",
    label: "Hồ sơ cá nhân",
    icon: <User size={16} />,
    path: "/officer/profile",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CHART_COLORS: Record<string, string> = {
  submitted:    "#f59e0b",
  draft:        "#d1d5db",
  under_review: "#f43f5e",
  approved:     "#10b981",
  rejected:     "#9ca3af",
};

const STATUS_CHART_LABELS: Record<string, string> = {
  submitted:    "Đã nộp",
  draft:        "Bản nháp",
  under_review: "Cần kiểm tra",
  approved:     "Đủ điều kiện",
  rejected:     "Bị từ chối",
};

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

function useEscalatedColumns(navigate: ReturnType<typeof useNavigate>): ColumnsType<Application> {
  return [
    {
      title: "Mã hồ sơ",
      dataIndex: "applicationId",
      key: "id",
      width: 80,
      render: (id: number) => (
        <Text className="font-mono text-xs text-indigo-600 font-semibold">#{id}</Text>
      ),
    },
    {
      title: "Thí sinh",
      dataIndex: "applicantName",
      key: "name",
      render: (name: string) => (
        <Text className="font-medium text-gray-800">{name}</Text>
      ),
    },
    {
      title: "Ngành",
      dataIndex: "programName",
      key: "major",
      render: (prog: string) => <Text className="text-gray-600 text-sm">{prog}</Text>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: string, record: Application) => {
        if (status === "under_review")
          return <Tag color="error">Leo thang</Tag>;
        if (record.requiresReview)
          return <Tag color="warning">Cần quyết định</Tag>;
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
              <Text className="text-amber-600 text-xs block mb-1">Thiếu tài liệu:</Text>
              <div className="flex flex-wrap gap-1">
                {missingDocs.map((d) => (
                  <Tag key={d} color="orange" className="!text-[10px] !m-0 !px-1">
                    {d.replace(/_/g, " ")}
                  </Tag>
                ))}
              </div>
            </div>
          );
        }
        if (notes) return <Text className="text-gray-500 text-xs">{notes}</Text>;
        return (
          <Text className="text-gray-300 text-xs">
            {record.requiresReview ? "Cần xem xét thủ công" : "Chờ xử lý"}
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
          onClick={() => navigate(`/officer/applications/${record.applicationId}`)}
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
      .then(setApplications)
      .finally(() => setLoading(false));
  }, []);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total      = applications.length;
    const pending    = applications.filter((a) => a.status === "submitted" || a.status === "draft").length;
    const needsCheck = applications.filter((a) => a.status === "under_review" || a.requiresReview).length;
    const approved   = applications.filter((a) => a.status === "approved").length;
    const rejected   = applications.filter((a) => a.status === "rejected").length;
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
        name: STATUS_CHART_LABELS[status] ?? status,
        value,
        color: STATUS_CHART_COLORS[status] ?? "#6366f1",
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
    [applications]
  );

  // ── Quick stats cards config ───────────────────────────────────────────────
  const quickStats = [
    {
      label: "Tổng hồ sơ",
      value: stats.total,
      icon: <Users size={20} />,
      bg: "bg-blue-50",
      iconColor: "text-blue-500",
      border: "border-blue-100",
      trend: `${stats.total} hồ sơ`,
      trendUp: true,
    },
    {
      label: "Chờ xử lý",
      value: stats.pending,
      icon: <ClipboardList size={20} />,
      bg: "bg-amber-50",
      iconColor: "text-amber-500",
      border: "border-amber-100",
      trend: `${pct(stats.pending, stats.total)} tổng hồ sơ`,
      trendUp: false,
    },
    {
      label: "Cần kiểm tra thủ công",
      value: stats.needsCheck,
      icon: <AlertTriangle size={20} />,
      bg: "bg-rose-50",
      iconColor: "text-rose-500",
      border: "border-rose-100",
      trend: stats.needsCheck > 0 ? "Cần xử lý gấp" : "Không có",
      trendUp: false,
    },
    {
      label: "Đủ điều kiện",
      value: stats.approved,
      icon: <TrendingUp size={20} />,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      border: "border-emerald-100",
      trend: `${pct(stats.approved, stats.total)} tổng hồ sơ`,
      trendUp: true,
    },
    {
      label: "Bị từ chối",
      value: stats.rejected,
      icon: <FileText size={20} />,
      bg: "bg-gray-50",
      iconColor: "text-gray-400",
      border: "border-gray-100",
      trend: `${pct(stats.rejected, stats.total)} tổng hồ sơ`,
      trendUp: false,
    },
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
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
              .then(setApplications)
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
                className={`rounded-2xl border ${s.border} shadow-sm hover:shadow-md transition-all cursor-pointer`}
                styles={{ body: { padding: "16px 20px" } }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center ${s.iconColor}`}
                  >
                    {s.icon}
                  </div>
                  <Badge
                    status={s.trendUp ? "success" : "error"}
                    text={
                      <span className="text-[11px] text-gray-400">{s.trend}</span>
                    }
                  />
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
                    <Tooltip formatter={(value: number) => [`${value} hồ sơ`]} />
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
                      formatter={(value: number) => [`${value} hồ sơ`, "Số lượng"]}
                      cursor={{ fill: "#f9fafb" }}
                    />
                    <Bar
                      dataKey="total"
                      fill="#6366f1"
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
                Các hồ sơ bị leo thang hoặc cần quyết định thủ công
                {!loading && escalatedList.length > 0 && (
                  <span className="ml-1 text-rose-500 font-medium">
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

        {/* Quick Actions */}
        <Card
          className="rounded-2xl border border-gray-100 shadow-sm"
          styles={{ body: { padding: "20px 24px" } }}
        >
          <Title level={5} className="!mb-4 !text-gray-700">
            Truy cập nhanh
          </Title>
          <Row gutter={[12, 12]}>
            <Col xs={24} sm={8}>
              <button
                onClick={() => navigate("/officer/review-applications")}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                  <FileText size={18} />
                </div>
                <div>
                  <div className="font-semibold text-blue-700 text-sm">
                    Xem hồ sơ mới
                  </div>
                  <div className="text-xs text-blue-400">
                    {loading ? "—" : `${stats.pending} hồ sơ chờ duyệt`}
                  </div>
                </div>
              </button>
            </Col>
            <Col xs={24} sm={8}>
              <button
                onClick={() => navigate("/officer/review-applications")}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-rose-100 bg-rose-50 hover:bg-rose-100 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                  <Zap size={18} />
                </div>
                <div>
                  <div className="font-semibold text-rose-700 text-sm">
                    Hồ sơ cần xử lý gấp
                  </div>
                  <div className="text-xs text-rose-400">
                    {loading ? "—" : `${stats.needsCheck} hồ sơ ưu tiên`}
                  </div>
                </div>
              </button>
            </Col>
            <Col xs={24} sm={8}>
              <button
                onClick={() => navigate("/officer/review-applications")}
                className="w-full flex items-center gap-3 p-4 rounded-xl border border-amber-100 bg-amber-50 hover:bg-amber-100 transition-colors text-left group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                  <AlertTriangle size={18} />
                </div>
                <div>
                  <div className="font-semibold text-amber-700 text-sm">
                    Hồ sơ bị agent escalated
                  </div>
                  <div className="text-xs text-amber-400">
                    {loading ? "—" : `${escalatedList.length} hồ sơ cần xem xét`}
                  </div>
                </div>
              </button>
            </Col>
          </Row>
        </Card>
      </Spin>
    </DashboardLayout>
  );
}
