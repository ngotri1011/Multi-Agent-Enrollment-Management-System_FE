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
  Select,
} from "antd";
import { useEffect, useState } from "react";
import type { AdmissionType } from "../../../types/admission.type";
import type { EnrollmentYear } from "../../../types/enrollment-years";

import {
  getAdmissionTypes,
  createAdmissionType,
  updateAdmissionType,
} from "../../../api/admission-types";

import { getEnrollmentYears } from "../../../api/enrollment-years";

export function AdmissionTypeManagement() {
  const [data, setData] = useState<AdmissionType[]>([]);
  const [years, setYears] = useState<EnrollmentYear[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdmissionType | null>(null);
  const [form] = Form.useForm();

  // FETCH DATA
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAdmissionTypes();
      setData(res);
    } catch {
      message.error("Failed to load admission types");
    } finally {
      setLoading(false);
    }
  };

  // FETCH YEARS
  const fetchYears = async () => {
    try {
      const res = await getEnrollmentYears();
      setYears(res);
    } catch {
      message.error("Failed to load enrollment years");
    }
  };

  useEffect(() => {
    fetchData();
    fetchYears();
  }, []);

  // JSON → textarea
  const parseDocuments = (json: string) => {
    try {
      return JSON.parse(json).join("\n");
    } catch {
      return "";
    }
  };

  // textarea → JSON
  const stringifyDocuments = (text: string) => {
    return JSON.stringify(
      text
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean)
    );
  };

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const openEdit = (record: AdmissionType) => {
    setEditing(record);

    // map year → id
    const yearObj = years.find(
      (y) => y.year === record.enrollmentYear
    );

    form.setFieldsValue({
      ...record,
      enrollmentYearId: yearObj?.enrollmentYearId,
      requiredDocumentList: parseDocuments(
        record.requiredDocumentList
      ),
    });

    setOpen(true);
  };


  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        requiredDocumentList: stringifyDocuments(
          values.requiredDocumentList
        ),
      };

      if (editing) {
        await updateAdmissionType(editing.admissionTypeId, {
          admissionTypeId: editing.admissionTypeId,
          ...payload,
        });
        message.success("Updated successfully");
      } else {
        await createAdmissionType(payload);
        message.success("Created successfully");
      }

      setOpen(false);
      fetchData();
    } catch {
      message.error("Save failed");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "admissionTypeName" },
    { title: "Type", dataIndex: "type" },
    { title: "Year", dataIndex: "enrollmentYear" },
    {
      title: "Active",
      render: (_: any, record: AdmissionType) => (
        <Switch checked={record.isActive} disabled />
      ),
    },
    {
      title: "Actions",
      render: (_: any, record: AdmissionType) => (
        <Space>
          <Button onClick={() => openEdit(record)}>Edit</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card className="rounded-2xl">
      <div className="flex justify-between mb-4">
        <Input placeholder="Search..." style={{ width: 250 }} />
        <Button type="primary" onClick={openCreate}>
          + Add Type
        </Button>
      </div>

      <Table
        rowKey="admissionTypeId"
        columns={columns}
        dataSource={data}
        loading={loading}
      />

      <Modal
        title={
          editing
            ? "Edit Admission Type"
            : "Create Admission Type"
        }
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item name="admissionTypeName" label="Name" required>
            <Input />
          </Form.Item>

          {/* FIXED: SELECT INSTEAD OF INPUT */}
          <Form.Item
            name="enrollmentYearId"
            label="Enrollment Year"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select year"
              options={years.map((y) => ({
                label: y.year,
                value: y.enrollmentYearId,
              }))}
            />
          </Form.Item>

          <Form.Item name="type" label="Type">
            <Input />
          </Form.Item>

          <Form.Item
            name="requiredDocumentList"
            label="Required Documents (one per line)"
          >
            <Input.TextArea rows={5} />
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