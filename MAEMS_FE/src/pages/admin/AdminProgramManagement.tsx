import { Card, Row, Col, Typography, Button, Tag, Space } from "antd";
import { BarChart2, DollarSign, FileText, LayoutDashboard, ShieldCheck } from "lucide-react";
import { AdminLayout } from "../../components/layouts/AdminLayout";

const { Title, Text } = Typography;


interface Program {
  id: string;
  name: string;
  students: number;
  active: number;
  applications: number;
}

const programs: Program[] = [
  {
    id: "1",
    name: "Computer Science",
    students: 245,
    active: 245,
    applications: 318,
  },
  {
    id: "2",
    name: "Business Admin",
    students: 312,
    active: 312,
    applications: 405,
  },
  {
    id: "3",
    name: "Nursing",
    students: 156,
    active: 156,
    applications: 202,
  },
  {
    id: "4",
    name: "Psychology",
    students: 203,
    active: 203,
    applications: 263,
  },
  {
    id: "5",
    name: "Engineering",
    students: 178,
    active: 178,
    applications: 231,
  },
  {
    id: "6",
    name: "Others",
    students: 153,
    active: 153,
    applications: 198,
  },
];

export function AdminProgramManagement() {
  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">
            Program Management
          </Title>

          <Text type="secondary">
            Manage academic programs and courses.
          </Text>
        </div>

        <Button type="primary" size="large">
          Add New Program
        </Button>
      </div>

      {/* Program Grid */}
      <Row gutter={[24, 24]}>
        {programs.map((program) => (
          <Col xs={24} md={12} lg={8} key={program.id}>
            <Card
              className="rounded-2xl border border-gray-100 shadow-sm"
              styles={{ body: { padding: "24px" } }}
            >
              {/* Title */}
              <div className="flex justify-between items-center mb-6">
                <Title level={4} className="!mb-0">
                  {program.name}
                </Title>

                <Tag className="rounded-full px-3 py-1">
                  {program.students} students
                </Tag>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <Text type="secondary">Active:</Text>
                  <Text strong>{program.active}</Text>
                </div>

                <div className="flex justify-between">
                  <Text type="secondary">Applications:</Text>
                  <Text strong>{program.applications}</Text>
                </div>
              </div>

              {/* Actions */}
              <Space>
                <Button> Edit </Button>

                <Button> View Details </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </AdminLayout>
  );
}