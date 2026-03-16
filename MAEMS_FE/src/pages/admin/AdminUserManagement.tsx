import {
  Card,
  Row,
  Col,
  Typography,
  Input,
  Select,
  Table,
  Avatar,
  Tag,
  Space,
  Button,
} from "antd";
import { Search, Eye, Pencil, UserPlus } from "lucide-react";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { getUsers } from "../../api/users";
import type { User, UserRole } from "../../types/user";

const { Title, Text } = Typography;
const { Option } = Select;

// interface User {
//   key: string;
//   name: string;
//   email: string;
//   role: "admin" | "staff" | "student";
//   status: "active" | "inactive";
//   lastLogin: string;
//   createdAt: string;
// }

// const users: User[] = [
//   {
//     key: "1",
//     name: "John Doe",
//     email: "john@example.com",
//     role: "admin",
//     status: "active",
//     lastLogin: "2 hours ago",
//     createdAt: "01/01/2024",
//   },
//   {
//     key: "2",
//     name: "Sarah Wilson",
//     email: "sarah@example.com",
//     role: "staff",
//     status: "active",
//     lastLogin: "1 day ago",
//     createdAt: "05/02/2024",
//   },
//   {
//     key: "3",
//     name: "Michael Johnson",
//     email: "michael@example.com",
//     role: "student",
//     status: "inactive",
//     lastLogin: "3 days ago",
//     createdAt: "10/03/2024",
//   },
// ];

// const renderRole = (role: User["role"]) => {
//   switch (role) {
//     case "admin":
//       return <Tag color="red">Admin</Tag>;
//     case "staff":
//       return <Tag color="blue">Staff</Tag>;
//     case "student":
//       return <Tag color="green">Student</Tag>;
//   }
// };

// const renderStatus = (status: User["status"]) => {
//   return status === "active" ? (
//     <Tag color="green">Active</Tag>
//   ) : (
//     <Tag color="default">Inactive</Tag>
//   );
// };

const columns: ColumnsType<User> = [
  {
    title: "User",
    render: (_, record) => (
      <Space>
        <Avatar>
          {record.username
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </Avatar>

        <div>
          <div className="font-medium">{record.username}</div>
          <Text type="secondary">{record.email}</Text>
        </div>
      </Space>
    ),
  },

  {
    title: "Role",
    dataIndex: "roleName",
    render: (role: UserRole) => {
      const colorMap = {
        admin: "red",
        officer: "blue",
        qa: "purple",
        applicant: "green",
        guest: "default",
      };

      return <Tag color={colorMap[role]}>{role}</Tag>;
    },
  },

  {
    title: "Status",
    dataIndex: "isActive",
    render: (active?: boolean) =>
      active ? (
        <Tag color="green">Active</Tag>
      ) : (
        <Tag color="default">Inactive</Tag>
      ),
  },

  {
    title: "Created",
    dataIndex: "createdAt",
    render: (date: string) =>
      new Date(date).toLocaleDateString(),
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

export function AdminUserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to fetch users", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);


  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">
            User Management
          </Title>

          <Text type="secondary">
            Manage system users and permissions.
          </Text>
        </div>

        <Button type="primary" icon={<UserPlus size={16} />}>
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card className="rounded-xl mb-6">
        <Row gutter={16}>
          <Col span={8}>
            <Input
              prefix={<Search size={16} />}
              placeholder="Search users..."
            />
          </Col>

          <Col span={4}>
            <Select defaultValue="all" style={{ width: "100%" }}>
              <Option value="all">All Roles</Option>
              <Option value="admin">Admin</Option>
              <Option value="staff">Staff</Option>
              <Option value="student">Student</Option>
            </Select>
          </Col>

          <Col span={4}>
            <Select defaultValue="all" style={{ width: "100%" }}>
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card className="rounded-xl">
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          pagination={false} />
      </Card>
    </AdminLayout>
  );
}