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
  Progress,
} from "antd";
import { Search, Eye, Pencil } from "lucide-react";
import type { ColumnsType } from "antd/es/table";
import { AdminLayout } from "../../layouts/AdminLayout";

const { Title, Text } = Typography;
const { Option } = Select;


interface Student {
  key: string;
  name: string;
  code: string;
  program: string;
  year: string;
  gpa: number;
  progress: number;
  progressText: string;
  status: "active" | "leave" | "graduated";
  payment: "paid" | "outstanding" | "overdue";
}

const students: Student[] = [
  {
    key: "1",
    name: "John Doe",
    code: "STU2024001",
    program: "Computer Science",
    year: "Sophomore",
    gpa: 3.75,
    progress: 38,
    progressText: "45/120",
    status: "active",
    payment: "paid",
  },
  {
    key: "2",
    name: "Sarah Wilson",
    code: "STU2024002",
    program: "Business Administration",
    year: "Senior",
    gpa: 3.92,
    progress: 88,
    progressText: "105/120",
    status: "active",
    payment: "outstanding",
  },
  {
    key: "3",
    name: "Michael Johnson",
    code: "STU2024003",
    program: "Engineering",
    year: "Junior",
    gpa: 3.64,
    progress: 60,
    progressText: "78/130",
    status: "active",
    payment: "paid",
  },
  {
    key: "4",
    name: "Emily Davis",
    code: "STU2024004",
    program: "Nursing",
    year: "Junior",
    gpa: 3.58,
    progress: 58,
    progressText: "72/125",
    status: "leave",
    payment: "paid",
  },
  {
    key: "5",
    name: "David Brown",
    code: "STU2024005",
    program: "Psychology",
    year: "Freshman",
    gpa: 3.23,
    progress: 10,
    progressText: "12/120",
    status: "active",
    payment: "overdue",
  },
  {
    key: "6",
    name: "Lisa Garcia",
    code: "STU2023001",
    program: "Computer Science",
    year: "Graduate",
    gpa: 3.82,
    progress: 100,
    progressText: "120/120",
    status: "graduated",
    payment: "paid",
  },
];



const renderStatus = (status: Student["status"]) => {
  switch (status) {
    case "active":
      return <Tag color="green">Active</Tag>;
    case "leave":
      return <Tag color="orange">On Leave</Tag>;
    case "graduated":
      return <Tag color="blue">Graduated</Tag>;
  }
};

const renderPayment = (payment: Student["payment"]) => {
  switch (payment) {
    case "paid":
      return <Tag color="green">Paid</Tag>;
    case "outstanding":
      return <Tag color="orange">Outstanding</Tag>;
    case "overdue":
      return <Tag color="red">Overdue</Tag>;
  }
};

//Table and columns

const columns: ColumnsType<Student> = [
  {
    title: "Student",
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
    title: "Year",
    dataIndex: "year",
    render: (year) => <Tag color="blue">{year}</Tag>,
  },

  {
    title: "GPA",
    dataIndex: "gpa",
    render: (gpa: number) => (
      <span className="text-green-600 font-medium">
        {gpa.toFixed(2)}
      </span>
    ),
  },

  {
    title: "Progress",
    render: (_, record) => (
      <div className="w-[120px]">
        <Text className="text-xs">
          {record.progressText} {record.progress}%
        </Text>
        <Progress
          percent={record.progress}
          showInfo={false}
          size="small"
        />
      </div>
    ),
  },

  {
    title: "Status",
    dataIndex: "status",
    render: renderStatus,
  },

  {
    title: "Payment",
    dataIndex: "payment",
    render: renderPayment,
  },

  {
    title: "Actions",
    render: () => (
      <Space>
        <Eye size={18} className="cursor-pointer text-gray-500" />
        <Pencil size={18} className="cursor-pointer text-gray-500" />
      </Space>
    ),
  },
];

export function AdminStudentManagement() {
  return (
    <AdminLayout>
      <Title level={4}>Student Management</Title>
      <Text type="secondary">
        View and manage enrolled students.
      </Text>

      {/* Stats */}
      <Row gutter={16} className="my-6">
        <Col span={6}>
          <Card>
            <Title level={3}>6</Title>
            <Text>Total Students</Text>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Title level={3} className="text-green-600">4</Title>
            <Text>Active Students</Text>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Title level={3} className="text-blue-600">1</Title>
            <Text>Graduated</Text>
          </Card>
        </Col>

        <Col span={6}>
          <Card>
            <Title level={3}>3.66</Title>
            <Text>Average GPA</Text>
          </Card>
        </Col>
      </Row>

      <Card>
        <Title level={5}>Student Management</Title>
        <Text type="secondary">
          View and manage enrolled students
        </Text>

        {/* Filters */}
        <Row gutter={16} className="my-4">
          <Col span={8}>
            <Input
              prefix={<Search size={16} />}
              placeholder="Search students..."
            />
          </Col>

          <Col span={5}>
            <Select defaultValue="all" style={{ width: "100%" }}>
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="leave">On Leave</Option>
              <Option value="graduated">Graduated</Option>
            </Select>
          </Col>

          <Col span={5}>
            <Select defaultValue="all" style={{ width: "100%" }}>
              <Option value="all">All Programs</Option>
            </Select>
          </Col>

          <Col span={5}>
            <Select defaultValue="all" style={{ width: "100%" }}>
              <Option value="all">All Year</Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={students}
          pagination={false}
        />
      </Card>
    </AdminLayout>
  );
}
