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
  Form,
  message,
  Modal,
  Switch,
} from "antd";
import { Search, Eye, Pencil, UserPlus, X, Save } from "lucide-react";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useState } from "react";
import { createUser, getUsers, updateUser } from "../../api/users";
import type { User } from "../../types/user";

const { Title, Text } = Typography;
const { Option } = Select;

export function AdminUserManagement() {

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
      render: (role: string) => {
        const colorMap: Record<string, string> = {
          admin: "red",
          officer: "blue",
          qa: "purple",
          applicant: "green",
          guest: "default",
        };

        return <Tag color={colorMap[role] || "default"}>{role}</Tag>;
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
      defaultSortOrder: "descend",
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
      render: (date: string) =>
        new Date(date).toLocaleDateString(),
    },

    {
      title: "Actions",
      render: (_, record) => (
        <Space>
          <Eye
            size={18}
            className="cursor-pointer text-gray-500"
            onClick={() => setSelectedUser(record)}
          />
        </Space>
      ),
    },
  ];
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [creating, setCreating] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const roleMap: Record<string, number> = {
    admin: 1,
    officer: 2,
    qa: 3,
    applicant: 4,
    guest: 5,
  };

  // Handle update user from modal
  const [updating, setUpdating] = useState(false);

  const handleUpdateFromModal = async () => {
    if (!selectedUser) return;

    try {
      setUpdating(true);

      await updateUser(selectedUser.userId, {
        roleId: selectedUser.roleId,
        isActive: selectedUser.isActive,
      });
      message.success("User updated successfully");

      setSelectedUser(null);
      fetchUsers(roleFilter);

    } catch (error) {
      message.error("Update failed");
    } finally {
      setUpdating(false);
    }
  };

  // Handle create user
  const handleCreateUser = async () => {
    try {
      const values = await form.validateFields();

      await createUser(values);

      message.success("Tạo tài khoản thành công");

      setIsModalOpen(false);
      form.resetFields();

      // refresh list
      fetchUsers(roleFilter);

    } catch (error) {
      console.error(error);
      message.error("Tạo tài khoản thất bại");
    }
  };

  // Fetch users
  const fetchUsers = async (role?: string) => {
    try {
      setLoading(true);

      const roleId =
        role && role !== "all" ? roleMap[role] : undefined;

      const data = await getUsers(roleId);
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };
  //On mount, fetch all users
  useEffect(() => {
    fetchUsers();
  }, []);
  // Refetch when role filter changes
  useEffect(() => {
    fetchUsers(roleFilter);
  }, [roleFilter]);

  // Apply search and filters
  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && user.isActive) ||
      (statusFilter === "inactive" && !user.isActive);

    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">
            Quản lý người dùng
          </Title>

          <Text type="secondary">
            Quản lý người dùng và quyền truy cập trong hệ thống.
          </Text>
        </div>
      </div>

      {/* Filters */}
      <Card className="rounded-xl mb-6">
        <Row gutter={16}>
          <Col span={8}>
            <Input
              prefix={<Search size={16} />}
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Col>

          <Col span={4}>
            <Select
              value={roleFilter}
              onChange={(value) => setRoleFilter(value)}
              style={{ width: "100%" }}
            >
              <Option value="all">All Roles</Option>
              <Option value="admin">Admin</Option>
              <Option value="officer">Officer</Option>
              <Option value="qa">QA</Option>
              <Option value="applicant">Applicant</Option>
            </Select>
          </Col>

          <Col span={4}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: "100%" }}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col >
            <Button
            type="primary"
            icon={<UserPlus size={16} />}
            onClick={() => setIsModalOpen(true)}
          >
            Thêm người dùng
          </Button>
        </Col>
      </Row>
    </Card>

      {/* Table */ }
  <Card className="rounded-xl">
    <Table
      rowKey="userId"
      columns={columns}
      dataSource={filteredUsers}
      loading={loading}
      pagination={{
        pageSize: 5,
        showSizeChanger: true,
        pageSizeOptions: ["5", "10", "20"],
      }} />
  </Card>
  {/* Create Account */ }
  <Modal
    confirmLoading={creating}
    open={isModalOpen}
    onCancel={() => setIsModalOpen(false)}
    footer={null}
    width={600}
  >
    <div className="space-y-5">

      {/* Title */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-xl font-bold text-purple-700">
          <UserPlus size={16} />
          Thiết lập tài khoản người dùng
        </div>
        <div className="text-sm text-gray-500">
          Nhập thông tin người dùng và gán vai trò
        </div>
      </div>

      {/* FORM */}
      <Form form={form} layout="vertical">
        <Form.Item
          name="username"
          label="Tên người dùng"
          rules={[{ required: true, message: "Tên người dùng không hợp lệ" }]}
        >
          <Input placeholder="Vui lòng nhập tên người dùng" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true },
            { type: "email", message: " Địa chỉ email không hợp lệ" },
          ]}
        >
          <Input placeholder="Vui lòng nhập địa chỉ email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[{ required: true }]}
        >
          <Input.Password placeholder="Vui lòng nhập mật khẩu" />
        </Form.Item>

        <Form.Item
          name="roleId"
          label="Vai trò"
          rules={[{ required: true }]}
        >
          <Select placeholder="Chọn vai trò">
            <Option value={1}>Admin</Option>
            <Option value={2}>Officer</Option>
            <Option value={3}>QA</Option>
            <Option value={4}>Applicant</Option>
            <Option value={5}>Guest</Option>
          </Select>
        </Form.Item>
      </Form>

      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-3 pt-2">
        <Button
          icon={<X size={16} />}
          onClick={() => setIsModalOpen(false)}>
          Hủy
        </Button>

        <Button
          type="primary"
          icon={<Save size={16} />}
          loading={creating}
          onClick={handleCreateUser}
          className="bg-blue-800 hover:bg-blue-900 text-white px-6 flex items-center gap-2"
        >
          Tạo tài khoản
        </Button>
      </div>
    </div>
  </Modal>
  {/* View Detail / Edit Modal */ }
  <Modal
    open={!!selectedUser}
    onCancel={() => setSelectedUser(null)}
    footer={null}
    width={600}
    className="[&_.ant-modal-content]:rounded-2xl"
  >
    {selectedUser && (
      <div className="space-y-5">

        {/* HEADER */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h2 className="text-lg text-green-600 font-semibold">
            Quản lý người dùng
          </h2>
          <p className="text-gray-500 text-sm">
            Xem và quản lý quyền người dùng
          </p>
        </div>

        {/* HIGHLIGHT CARD (like AI Recommendation) */}
        <div className="bg-gray-50 border rounded-xl p-4">
          <div className="font-semibold">
            Người dùng
          </div>

          <div className="text-xl font-bold text-blue-700">
            {selectedUser.username}
          </div>

          <div className="text-sm">
            {selectedUser.email}
          </div>
        </div>

        {/* USER INFO */}
        <div className="bg-gray-50 border rounded-xl p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Ngày tạo</span>
            <span className="font-medium">
              {new Date(selectedUser.createdAt).toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Vai trò</span>
            <span className="font-medium">
              {selectedUser.roleName}
            </span>
          </div>
        </div>

        {/* EDIT SECTION (like decision panel) */}
        <div className="bg-white border rounded-xl p-4 space-y-4">

          <div className="font-semibold text-gray-700">
            Chỉnh sửa thông tin
          </div>

          {/* Role */}
          <div>
            <div className="text-sm text-gray-500 mb-1">
              Đổi vài trò
            </div>

            <Select
              value={selectedUser.roleId}
              onChange={(value) =>
                setSelectedUser((prev) =>
                  prev ? { ...prev, roleId: value } : prev
                )
              }
              style={{ width: "100%" }}
            >
              <Option value={1}>Admin</Option>
              <Option value={2}>Officer</Option>
              <Option value={3}>QA</Option>
              <Option value={4}>Applicant</Option>
              <Option value={5}>Guest</Option>
            </Select>
          </div>

          {/* Status */}
          <div className="flex justify-between items-center pt-2">
            <div>
              <div className="text-sm text-gray-500">
                Trạng thái tài khoản
              </div>
              <div className="font-medium">
                {selectedUser.isActive ? "Hoạt động" : "Không hoạt động"}
              </div>
            </div>

            <Switch
              checked={selectedUser.isActive}
              onChange={(checked) =>
                setSelectedUser((prev) =>
                  prev ? { ...prev, isActive: checked } : prev
                )
              }
            />
          </div>
        </div>

        {/* ACTION BUTTON */}
        <div className="flex justify-end gap-3">
          <Button onClick={() => setSelectedUser(null)}>
            Hủy
          </Button>

          <Button
            type="primary"
            loading={updating}
            onClick={handleUpdateFromModal}
            className="bg-blue-800 hover:bg-blue-900 px-6 flex items-center gap-2"
          >
            Lưu
          </Button>
        </div>
      </div>
    )}
  </Modal>
    </AdminLayout >
  );
}