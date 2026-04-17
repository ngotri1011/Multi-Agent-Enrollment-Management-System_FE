import { Card, Row, Col, Typography, Button } from "antd";
import {
  Users,
  DollarSign,
  FileText,
  GraduationCap,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import { AdminLayout } from "../../layouts/AdminLayout";

const { Title, Text } = Typography;

interface ReportItem {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const reports: ReportItem[] = [
  {
    title: "Enrollment Report",
    description: "Student enrollment statistics",
    icon: <Users size={22} />,
  },
  {
    title: "Financial Report",
    description: "Payment and revenue analysis",
    icon: <DollarSign size={22} />,
  },
  {
    title: "Application Report",
    description: "Application trends and status",
    icon: <FileText size={22} />,
  },
  {
    title: "Program Performance",
    description: "Program-wise analytics",
    icon: <GraduationCap size={22} />,
  },
  {
    title: "Student Demographics",
    description: "Student population breakdown",
    icon: <TrendingUp size={22} />,
  },
  {
    title: "Academic Progress",
    description: "Student academic performance",
    icon: <CheckCircle size={22} />,
  },
];

export function AdminReports() {
  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <Title level={3} className="!mb-1">
          Reports & Analytics
        </Title>
        <Text type="secondary">
          Generate and view system reports.
        </Text>
      </div>

      {/* Reports Grid */}
      <Row gutter={[24, 24]}>
        {reports.map((report, index) => (
          <Col xs={24} md={12} lg={8} key={index}>
            <Card
              className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition"
              styles={{ body: { padding: 24 } }}
            >
              {/* Icon + Title */}
              <div className="flex items-center gap-3 mb-2">
                <div className="text-blue-600">{report.icon}</div>

                <Title level={4} className="!mb-0">
                  {report.title}
                </Title>
              </div>

              {/* Description */}
              <Text type="secondary" className="block mb-6">
                {report.description}
              </Text>

              {/* Button */}
              <Button block>Generate Report</Button>
            </Card>
          </Col>
        ))}
      </Row>
    </AdminLayout>
  );
}