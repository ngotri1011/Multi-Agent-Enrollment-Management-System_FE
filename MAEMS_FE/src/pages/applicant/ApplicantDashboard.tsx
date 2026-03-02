import { Card, Col, Row, Typography } from "antd";
import { DashboardLayout } from "../../components/DashboardLayout";
import { applicantMenu } from "./applicantMenu";

const { Title, Text } = Typography;

const stats = [
  { label: "Hồ sơ đã nộp", value: "—", color: "text-orange-500" },
  { label: "Đang xét duyệt", value: "—", color: "text-blue-500" },
  { label: "Đã chấp nhận", value: "—", color: "text-green-500" },
  { label: "Chờ bổ sung", value: "—", color: "text-yellow-500" },
];

export function ApplicantDashboard() {
  return (
    <DashboardLayout menuItems={applicantMenu}>
      <Title level={4} className="!mb-6 !text-gray-700 !font-semibold">
        Tổng quan
      </Title>

      <Row gutter={[16, 16]} className="mb-6">
        {stats.map((s) => (
          <Col xs={12} md={6} key={s.label}>
            <Card
              className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              styles={{ body: { padding: "20px 24px" } }}
            >
              <Text className="text-xs text-gray-400 uppercase tracking-wide">
                {s.label}
              </Text>
              <div className={`text-3xl font-bold mt-1 ${s.color}`}>
                {s.value}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        className="rounded-2xl border border-gray-100 shadow-sm"
        styles={{ body: { padding: "24px" } }}
      >
        <Title level={5} className="!mb-4 !text-gray-700">
          Hoạt động gần đây
        </Title>
        <Text className="text-gray-400 text-sm">Chưa có hoạt động nào.</Text>
      </Card>
    </DashboardLayout>
  );
}
