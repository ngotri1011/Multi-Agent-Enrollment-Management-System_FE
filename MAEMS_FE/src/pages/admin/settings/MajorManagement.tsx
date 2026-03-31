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
import type { Major } from "../../../types/major";
import {
  getMajors,
  createMajor,
  updateMajor,
} from "../../../api/majors";

export function MajorManagement() {
  const [data, setData] = useState<Major[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Major | null>(null);
  const [form] = Form.useForm();

  // ✅ FETCH DATA
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getMajors({
        search,
        pageNumber: pagination.current,
        pageSize: pagination.pageSize,
      });

      setData(res.items);
      setPagination((prev) => ({
        ...prev,
        total: res.totalCount,
      }));
    } catch {
      message.error("Failed to load majors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  // ✅ SEARCH (ENTER only)
  const handleSearch = (value: string) => {
    setSearch(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    setTimeout(fetchData, 0);
  };

  // ✅ CREATE / EDIT
  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: Major) => {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  };

  const handleSubmit = async (values: Major) => {
    try {
      if (editing) {
        await updateMajor(editing.majorId, {
          ...editing,
          ...values,
        });
        message.success("Updated successfully");
      } else {
        await createMajor(values);
        message.success("Created successfully");
      }

      setOpen(false);
      fetchData();
    } catch {
      message.error("Operation failed");
    }
  };


  const columns = [
    {
      title: "Code",
      dataIndex: "majorCode",
    },
    {
      title: "Name",
      dataIndex: "majorName",
    },
    {
      title: "Description",
      dataIndex: "description",
      ellipsis: true,
    },
    {
      title: "Active",
      render: (_: any, record: Major) => (
        <Switch checked={record.isActive} disabled />
      ),
    },
    {
      title: "Actions",
      render: (_: any, record: Major) => (
        <Space>
          <Button onClick={() => openEdit(record)}>Edit</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card className="rounded-2xl">
      <div className="flex justify-between mb-4">
        <Input.Search
          placeholder="Search major..."
          style={{ width: 250 }}
          onSearch={handleSearch}
          allowClear
        />

        <Button type="primary" onClick={openCreate}>
          + Add Major
        </Button>
      </div>

      <Table
        rowKey="majorId"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page, pageSize) =>
            setPagination({
              ...pagination,
              current: page,
              pageSize,
              total: pagination.total,
            }),
        }}
      />

      <Modal
        title={editing ? "Edit Major" : "Create Major"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="majorCode"
            label="Major Code"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="majorName"
            label="Major Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
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