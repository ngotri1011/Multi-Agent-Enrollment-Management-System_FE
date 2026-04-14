import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
} from "antd";
import dayjs from "dayjs";

import {
  getEnrollmentYears,
  createEnrollmentYear,
  updateEnrollmentYear,
} from "../../../api/enrollment-years";
import type { EnrollmentYear } from "../../../types/enrollment-years";

export default function EnrollmentYears() {
  const [data, setData] = useState<EnrollmentYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EnrollmentYear | null>(null);

  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getEnrollmentYears();
      setData(res);
    } catch {
      message.error("Lấy dữ liệu năm tuyển sinh thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const payload = {
        ...values,
        registrationStartDate: values.registrationStartDate.format("YYYY-MM-DD"),
        registrationEndDate: values.registrationEndDate.format("YYYY-MM-DD"),
      };

      if (editing) {
        await updateEnrollmentYear(editing.enrollmentYearId, {
          ...editing,
          ...payload,
        });
        message.success("Cập nhật thành công");
      } else {
        await createEnrollmentYear(payload);
        message.success("Tạo thành công");
      }

      setOpen(false);
      form.resetFields();
      setEditing(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    {
      title: "Năm",
      dataIndex: "year",
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "registrationStartDate",
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "registrationEndDate",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
    },
    {
      title: "Hành động",
      render: (_: any, record: EnrollmentYear) => (
        <Button
          onClick={() => {
            setEditing(record);
            setOpen(true);
            form.setFieldsValue({
              ...record,
              registrationStartDate: dayjs(record.registrationStartDate),
              registrationEndDate: dayjs(record.registrationEndDate),
            });
          }}
        >
          Sửa
        </Button>
      ),
    },
  ];

  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          setOpen(true);
          setEditing(null);
          form.resetFields();
        }}
        style={{ marginBottom: 16 }}
      >
        + Thêm Năm Tuyển Sinh
      </Button>

      <Table
        rowKey="enrollmentYearId"
        loading={loading}
        dataSource={data}
        columns={columns}
      />

      <Modal
        title={editing ? "Sửa Năm Tuyển Sinh" : "Tạo Năm Tuyển Sinh"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="year" label="Năm" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="registrationStartDate"
            label="Ngày bắt đầu"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="registrationEndDate"
            label="Ngày kết thúc"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true }]}
          >
            <Select
              options={[
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}