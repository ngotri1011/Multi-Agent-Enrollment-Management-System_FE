import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Modal,
  Form,
  Switch,
  message,
} from "antd";
import { useEffect, useState } from "react";
import type { Campus } from "../../../types/campus";
import {
  getCampuses,
  createCampus,
  updateCampus,
} from "../../../api/campuses";

export function CampusManagement() {
  const [data, setData] = useState<Campus[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Campus | null>(null);
  const [form] = Form.useForm();

  // 🔥 FETCH DATA
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getCampuses();
      setData(res);
    } catch {
      message.error("Lấy dữ liệu campus thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // OPEN CREATE
  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  // OPEN EDIT
  const openEdit = (record: Campus) => {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

//   // DELETE (soft approach → toggle inactive)
//   const handleDelete = async (record: Campus) => {
//     try {
//       await updateCampus(record.campusId, {
//         ...record,
//         isActive: false,
//       });
//       message.success("Deleted successfully");
//       fetchData();
//     } catch {
//       message.error("Delete failed");
//     }
//   };

  // SUBMIT
  const handleSubmit = async (values: any) => {
    try {
      if (editing) {
        await updateCampus(editing.campusId, {
          campusId: editing.campusId,
          ...values,
        });
        message.success("Cập nhật thành công");
      } else {
        await createCampus(values);
        message.success("Tạo thành công");
      }

      setOpen(false);
      fetchData();
    } catch {
      message.error("Lưu dữ liệu thất bại");
    }
  };

  const columns = [
    { title: "Tên", dataIndex: "name" },
    { title: "Địa chỉ", dataIndex: "address" },
    { title: "Email", dataIndex: "email" },
    { title: "SĐT", dataIndex: "phoneNumber" },
    {
      title: "Active",
      render: (_: any, record: Campus) => (
        <Switch checked={record.isActive} disabled />
      ),
    },
    {
      title: "Actions",
      render: (_: any, record: Campus) => (
        <Space>
          <Button onClick={() => openEdit(record)}>Sửa</Button>
          {/* <Popconfirm
            title="Deactivate this campus?"
            onConfirm={() => handleDelete(record)}
          >
            <Button danger>Deactivate</Button>
          </Popconfirm> */}
        </Space>
      ),
    },
  ];

  return (
    <Card className="rounded-2xl">
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <Input placeholder="Tìm kiếm campus..." style={{ width: 250 }} />
        <Button type="primary" onClick={openCreate}>
          + Thêm Campus
        </Button>
      </div>

      {/* TABLE */}
      <Table
        rowKey="campusId"
        columns={columns}
        dataSource={data}
        loading={loading}
      />

      {/* MODAL */}
      <Modal
        title={editing ? "Sửa Campus" : "Tạo Campus"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item name="name" label="Campus" required>
            <Input />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input />
          </Form.Item>

          <Form.Item name="email" label="Email">
            <Input />
          </Form.Item>

          <Form.Item name="phoneNumber" label="SĐT">
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}