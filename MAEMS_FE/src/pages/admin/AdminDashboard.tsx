import { Card, Col, Row, Typography, Tag, Space, Spin } from "antd";
import {
  CheckCircle2,
  DollarSign,
  FileText,
  LayoutDashboard,
  TrendingUp,
  User,
} from "lucide-react";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import { useEffect, useState } from "react";
import type { ApplicationsByCampus, ApplicationStatusCounts, ReportSummary, WeeklyApplications } from "../../types/report";
import { getApplicationsByCampus, getApplicationStatusCounts, getReportSummary, getWeeklyApplications } from "../../api/reports";
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const { Title, Text } = Typography;



const activities = [
  {
    title: "New application received from John Smith",
    time: "10 minutes ago",
    icon: <FileText size={16} />,
    iconBg: "bg-blue-100 text-blue-600",
  },
  {
    title: "Payment overdue for student ID: STU2024089",
    time: "1 hour ago",
    icon: <DollarSign size={16} />,
    iconBg: "bg-yellow-100 text-yellow-600",
    priority: "high",
  },
  {
    title: "Sarah Wilson enrolled in Computer Science program",
    time: "2 hours ago",
    icon: <User size={16} />,
    iconBg: "bg-green-100 text-green-600",
  },
  {
    title: "Document verification completed for 5 applications",
    time: "3 hours ago",
    icon: <CheckCircle2 size={16} />,
    iconBg: "bg-blue-100 text-blue-600",
  },
];

const COLORS = ["#22c55e", "#ef4444", "#f59e0b",];

export function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyApplications[]>([]);
  const [campusData, setCampusData] = useState<ApplicationsByCampus[]>([]);
  const [status, setStatus] = useState<ApplicationStatusCounts | null>(null);

  const stats = [
    {
      label: "Tổng sinh viên",
      value: summary?.numApplicant ?? "—",
      bg: "bg-purple-50",
      color: "text-purple-500",
      icon: <User color="#8b5cf6" size={20} />
    },

    {
      label: "Hồ sơ mới",
      value: summary?.numApplication ?? "—",
      bg: "bg-yellow-50",
      color: "text-yellow-500",
      icon: <FileText color="#f59e0b" size={20} />
    },

    {
      label: "Thanh toán chờ xử lý",
      value: summary?.numPaymentNeedCheck ?? "—",
      bg: "bg-blue-50",
      color: "text-blue-500",
      icon: <DollarSign color="#22c55e" size={20} />
    },

    {
      label: "Chương trình đào tạo",
      value: summary?.numProgram ?? "—",
      bg: "bg-green-50",
      color: "text-green-500",
      icon: <LayoutDashboard color="#3b82f6" size={20} />
    },

  ];

  // fecth
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);

        const [s, w, c, st] = await Promise.all([
          getReportSummary(),
          getWeeklyApplications({}),
          getApplicationsByCampus(),
          getApplicationStatusCounts(),
        ]);

        setSummary(s);
        setWeeklyData(w);
        setCampusData(c);
        setStatus(st);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

if (loading) {
  return (
    <AdminLayout>
      <div className="h-[60vh] flex items-center justify-center">
        <Spin size="large" />
      </div>
    </AdminLayout>
  );
}
  return (
    <AdminLayout>
      <Title level={4} className="!mb-6 !text-gray-700 !font-semibold">
        Tổng quan hệ thống
      </Title>

      {/* stats */}
      <Row gutter={[16, 16]} className="mb-6">
        {stats.map((item) => (
          <Col xs={12} md={6} key={item.label}>
            <Card
              className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              styles={{ body: { padding: "20px 24px" } }}
            >
              <Space align="center" className="w-full justify-between">
                <div>
                  <Text className="text-xs text-gray-400 uppercase tracking-wide">
                    {item.label}
                  </Text>
                  <div className="text-3xl font-bold mt-1 text-gray-800">
                    {item.value}
                  </div>
                </div>
                <div className={`w-9 h-9 ${item.bg} rounded-xl flex items-center justify-center`}>
                  {item.icon}
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ===== Middle Section ===== */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12} style={{ display: "flex" }}>
          <Card
            className="rounded-2xl border border-gray-100 shadow-sm flex-1"
            styles={{ body: { padding: "24px", height: 360 } }}
          >
            <Title level={5} className="!mb-2">
              Hồ sơ theo cơ sở
            </Title>
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={campusData}>
                  <XAxis dataKey="campusName" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12} style={{ display: "flex" }}>
          <Card
            className="rounded-2xl border border-gray-100 shadow-sm  flex-1"
            styles={{ body: { padding: "24px", height: 360 } }}
          >
            <Title level={5} className="!mb-2">
              Hồ sơ theo trạng thái
            </Title>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Approved",
                        value: status?.numApproved ?? 0,
                      },
                      {
                        name: "Rejected",
                        value: status?.numRejected ?? 0,
                      },
                      {
                        name: "Pending",
                        value: status?.numPending ?? 0,
                      },
                    ]}

                    innerRadius="80%"
                    outerRadius="100%"
                    // padding angle is the gap between each pie slice
                    paddingAngle={3}
                    dataKey="value"

                  >
                    {COLORS.map((c, i) => (
                      <Cell key={i} fill={c} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4 text-sm">
              <Tag color="green">Đã phê duyệt</Tag>
              <Tag color="red">Không được duyệt</Tag>
              <Tag color="gold">Chờ xét duyệt</Tag>
            </div>
          </Card>
        </Col>
      </Row>
      {/*  trend */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col span={24}>
          <Card className="rounded-xl border border-gray-100 shadow-sm">
            <Title level={5} className="!mb-4 text-gray-700">
              Xu hướng hồ sơ theo tuần
            </Title>

            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={weeklyData}>
                  <XAxis
                    dataKey="weekStart"
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString()
                    }
                  />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>
      {/* recent*/}
      <Card
        className="rounded-2xl border border-gray-100 shadow-sm"
        styles={{ body: { padding: "24px" } }}
      >
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={16} className="text-gray-500" />
          <Title level={5} className="!mb-0 !text-gray-700">
            Recent Activity
          </Title>
        </div>

        <Text className="text-gray-400 text-sm block mb-4">
          Latest system activities and notifications
        </Text>

        <div className="space-y-3">
          {activities.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-100 transition"
            >
              <div className="flex items-center gap-3">
                {/* Icon Circle */}
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-full ${item.iconBg}`}
                >
                  {item.icon}
                </div>

                {/* Text Content */}
                <div>
                  <div className="font-medium text-gray-800">
                    {item.title}
                  </div>
                  <Text className="text-xs text-gray-400">
                    {item.time}
                  </Text>
                </div>
              </div>

              {/* High Priority Tag */}
              {item.priority === "high" && (
                <Tag
                  color="red"
                  className="rounded-full px-3 py-[2px] text-xs"
                >
                  High Priority
                </Tag>
              )}
            </div>
          ))}
        </div>
      </Card>
    </AdminLayout>
  );
}