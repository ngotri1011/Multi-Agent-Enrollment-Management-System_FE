import { Card, Col, Row, Typography } from "antd";
import { QALayout } from "../../layouts/QALayout";

const { Title, Text } = Typography;

const stats = [
  { label: "Hồ sơ cần đánh giá", value: "—", color: "text-orange-500" },
  { label: "Đã đánh giá hôm nay", value: "—", color: "text-green-500" },
  { label: "Chờ xác nhận", value: "—", color: "text-yellow-500" },
  { label: "Tổng đã xử lý", value: "—", color: "text-blue-500" },
];

export function QaDashboard() {
  return (
    <QALayout>
      <Title level={4} className="!mb-6 !text-gray-700 !font-semibold">
        Tổng quan kiểm duyệt
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
          Hồ sơ chờ đánh giá
        </Title>
        <Text className="text-gray-400 text-sm">
          Không có hồ sơ nào cần xử lý.
        </Text>
      </Card>
    </QALayout>
  );
}
