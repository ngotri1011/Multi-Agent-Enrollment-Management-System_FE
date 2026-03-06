import { Card, Row, Col, Typography, Avatar, Tag } from "antd";
import { AdminLayout } from "../../components/layouts/AdminLayout";

const { Title, Text } = Typography;

interface Payment {
  id: string;
  name: string;
  code: string;
  amount: number;
  time: string;
  status: "paid" | "outstanding" | "overdue";
}

const payments: Payment[] = [
  { id: "1", name: "Student 1", code: "STU2024001", amount: 2500, time: "Today", status: "paid" },
  { id: "2", name: "Student 2", code: "STU2024002", amount: 2500, time: "Today", status: "paid" },
  { id: "3", name: "Student 3", code: "STU2024003", amount: 2500, time: "Today", status: "paid" },
  { id: "4", name: "Student 4", code: "STU2024004", amount: 2500, time: "Today", status: "paid" },
  { id: "5", name: "Student 5", code: "STU2024005", amount: 2500, time: "Today", status: "paid" },
];

export function AdminPaymentManagement() {
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <Title level={3} className="!mb-1">
          Payment Management
        </Title>
        <Text type="secondary">
          Monitor student payments and financial aid.
        </Text>
      </div>

      {/* Stat Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={8}>
          <Card className="rounded-xl text-center">
            <Title level={2} className="!text-green-600 !mb-0">
              $1,234,567
            </Title>
            <Text type="secondary">Total Collected</Text>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="rounded-xl text-center">
            <Title level={2} className="!text-orange-500 !mb-0">
              $456,789
            </Title>
            <Text type="secondary">Outstanding</Text>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card className="rounded-xl text-center">
            <Title level={2} className="!text-red-500 !mb-0">
              $23,456
            </Title>
            <Text type="secondary">Overdue</Text>
          </Card>
        </Col>
      </Row>

      {/* Recent Payments */}
      <Card
        className="rounded-2xl border border-gray-100"
        styles={{ body: { padding: 24 } }}
      >
        <Title level={4} className="!mb-4">
          Recent Payments
        </Title>

        <div className="space-y-4">
          {payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between border rounded-xl px-4 py-3 hover:bg-gray-50 transition"
            >
              {/* Student */}
              <div className="flex items-center gap-3">
                <Avatar>
                  {payment.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Avatar>

                <div>
                  <div className="font-medium">{payment.name}</div>
                  <Text type="secondary">{payment.code}</Text>
                </div>
              </div>

              {/* Amount */}
              <div className="text-center">
                <div className="font-semibold text-lg">
                  ${payment.amount.toLocaleString()}
                </div>
                <Text type="secondary">{payment.time}</Text>
              </div>

              {/* Status */}
              <Tag color="green">Paid</Tag>
            </div>
          ))}
        </div>
      </Card>
    </AdminLayout>
  );
}