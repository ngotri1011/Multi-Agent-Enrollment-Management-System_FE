import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Select,
  Table,
  Tag,
  Avatar,
  Space,
} from "antd";
import { Search, Eye } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { AdminLayout } from "../../components/layouts/AdminLayout";

const { Title, Text } = Typography;
const { Option } = Select;

interface Application {
  key: string;
  name: string;
  code: string;
  program: string;
  date: string;
  gpa: number;
  status: "under_review" | "accepted" | "waitlisted" | "rejected" | "incomplete";
  documents: number;
}

const mockData: Application[] = [
  {
    key: "1",
    name: "John Smith",
    code: "APP2024001",
    program: "Computer Science",
    date: "15/12/2024",
    gpa: 3.75,
    status: "under_review",
    documents: 3,
  },
  {
    key: "2",
    name: "Sarah Wilson",
    code: "APP2024002",
    program: "Business Administration",
    date: "14/12/2024",
    gpa: 3.92,
    status: "accepted",
    documents: 3,
  },
  {
    key: "3",
    name: "Michael Johnson",
    code: "APP2024003",
    program: "Engineering",
    date: "13/12/2024",
    gpa: 3.64,
    status: "incomplete",
    documents: 2,
  },
  {
    key: "4",
    name: "Emily Davis",
    code: "APP2024004",
    program: "Nursing",
    date: "12/12/2024",
    gpa: 3.58,
    status: "waitlisted",
    documents: 3,
  },
  {
    key: "5",
    name: "David Brown",
    code: "APP2024005",
    program: "Psychology",
    date: "11/12/2024",
    gpa: 2.87,
    status: "rejected",
    documents: 2,
  },
];

const renderStatus = (status: Application["status"]) => {
  switch (status) {
    case "under_review":
      return <Tag color="orange">Under Review</Tag>;
    case "accepted":
      return <Tag color="green">Accepted</Tag>;
    case "waitlisted":
      return <Tag color="blue">Waitlisted</Tag>;
    case "rejected":
      return <Tag color="red">Rejected</Tag>;
    case "incomplete":
      return <Tag color="default">Incomplete</Tag>;
    default:
      return null;
  }
};


const columns: ColumnsType<Application> = [
  {
    title: "Applicant",
    key: "applicant",
    render: (_, record) => (
      <Space>
        <Avatar>
          {record.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </Avatar>
        <div>
          <div className="font-medium">{record.name}</div>
          <Text type="secondary">{record.code}</Text>
        </div>
      </Space>
    ),
  },
  {
    title: "Program",
    dataIndex: "program",
  },
  {
    title: "Application Date",
    dataIndex: "date",
  },
  {
    title: "GPA",
    dataIndex: "gpa",
    render: (gpa: number) => (
      <span
        className={
          gpa >= 3
            ? "text-green-600 font-medium"
            : "text-red-500 font-medium"
        }
      >
        {gpa.toFixed(2)}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: renderStatus,
  },
  {
    title: "Documents",
    dataIndex: "documents",
  },
  {
    title: "Actions",
    render: () => (
      <Eye size={18} className="cursor-pointer text-gray-500 hover:text-gray-700" />
    ),
  },
];


export function AdminApplicationList() {
  return (
    <AdminLayout>
      <Title level={4} className="!mb-1">
        Application Management
      </Title>
      <Text type="secondary">
        Review and manage student applications.
      </Text>

      {/* Stats Row */}
      <Row gutter={16} className="my-6">
        <Col span={4}>
          <Card>
            <Title level={3}>6</Title>
            <Text>Total Applications</Text>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Title level={3} className="text-orange-500">2</Title>
            <Text>Under Review</Text>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Title level={3} className="text-green-500">1</Title>
            <Text>Accepted</Text>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Title level={3} className="text-blue-500">1</Title>
            <Text>Waitlisted</Text>
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Title level={3} className="text-red-500">1</Title>
            <Text>Incomplete</Text>
          </Card>
        </Col>
      </Row>

      <Card className="rounded-xl">
        {/* Filters */}
        <Row gutter={16} className="mb-4">
          <Col span={10}>
            <Input
              prefix={<Search size={16} />}
              placeholder="Search applications..."
            />
          </Col>
          <Col span={6}>
            <Select defaultValue="all" style={{ width: "100%" }}>
              <Option value="all">All Status</Option>
              <Option value="under_review">Under Review</Option>
              <Option value="accepted">Accepted</Option>
              <Option value="waitlisted">Waitlisted</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </Col>
          <Col span={6}>
            <Select defaultValue="all" style={{ width: "100%" }}>
              <Option value="all">All Programs</Option>
              <Option value="cs">Computer Science</Option>
              <Option value="eng">Engineering</Option>
              <Option value="biz">Business Administration</Option>
            </Select>
          </Col>
        </Row>

        {/* Table */}
        <Table
          columns={columns}
          dataSource={mockData}
          pagination={false}
        />
      </Card>
    </AdminLayout>
  );
}