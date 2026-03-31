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
      message.error("Failed to fetch enrollment years");
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
        message.success("Updated successfully");
      } else {
        await createEnrollmentYear(payload);
        message.success("Created successfully");
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
      title: "Year",
      dataIndex: "year",
    },
    {
      title: "Start Date",
      dataIndex: "registrationStartDate",
    },
    {
      title: "End Date",
      dataIndex: "registrationEndDate",
    },
    {
      title: "Status",
      dataIndex: "status",
    },
    {
      title: "Action",
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
          Edit
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
        Add Enrollment Year
      </Button>

      <Table
        rowKey="enrollmentYearId"
        loading={loading}
        dataSource={data}
        columns={columns}
      />

      <Modal
        title={editing ? "Edit Enrollment Year" : "Create Enrollment Year"}
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubmit}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="year" label="Year" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="registrationStartDate"
            label="Start Date"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="registrationEndDate"
            label="End Date"
            rules={[{ required: true }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
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