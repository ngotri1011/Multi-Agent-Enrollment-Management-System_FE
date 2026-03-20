import { Card, Row, Col, Typography, Button, Tag, Space, Form, Switch, Input, Modal, message } from "antd";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import { useEffect, useState } from "react";
import type { Program } from "../../types/program";
import { createProgram, getPrograms, updateProgram } from "../../api/programs";
import { CheckCircle, CircleOff, Eye, Pencil, Save, X } from "lucide-react";

const { Title, Text } = Typography;


// interface Program {
//   id: string;
//   name: string;
//   students: number;
//   active: number;
//   applications: number;
// }

// const programs: Program[] = [
//   {
//     id: "1",
//     name: "Computer Science",
//     students: 245,
//     active: 245,
//     applications: 318,
//   },
//   {
//     id: "2",
//     name: "Business Admin",
//     students: 312,
//     active: 312,
//     applications: 405,
//   },
//   {
//     id: "3",
//     name: "Nursing",
//     students: 156,
//     active: 156,
//     applications: 202,
//   },
//   {
//     id: "4",
//     name: "Psychology",
//     students: 203,
//     active: 203,
//     applications: 263,
//   },
//   {
//     id: "5",
//     name: "Engineering",
//     students: 178,
//     active: 178,
//     applications: 231,
//   },
//   {
//     id: "6",
//     name: "Others",
//     students: 153,
//     active: 153,
//     applications: 198,
//   },
// ];

export function AdminProgramManagement() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [detailForm] = Form.useForm();

  // Handle program update
  const handleUpdate = async (values: any) => {
    if (!selectedProgram) return;

    try {
      await updateProgram(selectedProgram.programId, {
        ...values,
        programId: selectedProgram.programId,
      });

      message.success("Program updated");

      setDetailOpen(false);
      setEditing(false);

      // refresh list
      const data = await getPrograms();
      setPrograms(data);

    } catch (err) {
      console.error(err);
      message.error("Update failed");
    }
  };
  // Handle program creation
  const handleCreate = async (values: any) => {
    try {
      setSubmitting(true);

      await createProgram({
        ...values,
        majorId: Number(values.majorId),
        enrollmentYearId: Number(values.enrollmentYearId),
      });

      message.success("Program created successfully");

      setOpen(false);
      form.resetFields();

      // refresh list
      const data = await getPrograms();
      setPrograms(data);

    } catch (err) {
      console.error(err);
      message.error("Failed to create program");
    } finally {
      setSubmitting(false);
    }
  };

  //fetch programs from API
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoading(true);
        const data = await getPrograms();
        setPrograms(data);
      } catch (err) {
        console.error("Failed to fetch programs", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">
            Program Management
          </Title>

          <Text type="secondary">
            Manage academic programs and courses.
          </Text>
        </div>

        <Button type="primary" size="large" onClick={() => setOpen(true)}>
          Tạo chương trình mới
        </Button>
      </div>

      {/* Program Grid */}
      <Row gutter={[24, 24]}>
        {programs.map((program) => (
          <Col xs={24} md={12} lg={8} key={program.programId}>
            <Card
              className="rounded-2xl border border-gray-100 shadow-sm"
              styles={{ body: { padding: "24px" } }}
            >
              {/* Title */}
              <div className="flex justify-between items-center mb-6">
                <Title level={4} className="!mb-0">
                  {program.programName}
                </Title>

                <Tag
                  color={program.isActive ? "green" : "default"}
                  className="rounded-full px-3 py-1"
                >
                  {program.isActive ? "Active" : "Inactive"}
                </Tag>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <Text type="secondary">Major:</Text>
                  <Text strong>{program.majorName}</Text>
                </div>

                <div className="flex justify-between">
                  <Text type="secondary">Year:</Text>
                  <Text strong>{program.enrollmentYear}</Text>
                </div>

                <div className="flex justify-between">
                  <Text type="secondary">Duration:</Text>
                  <Text strong>{program.duration}</Text>
                </div>
              </div>

              {/* Actions */}
              <Space>
                <Button
                  onClick={() => {
                    setSelectedProgram(program);
                    setDetailOpen(true);
                    setEditing(false);

                    detailForm.setFieldsValue(program);
                  }}
                >
                  View Details
                </Button>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Create Modal  */}
      <Modal
        open={open}
        onCancel={() => {
          setOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={720}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>

          {/* HEADER */}
          <div className="mb-6 p-4 rounded-xl bg-purple-50 border border-purple-100">
            <div className="text-purple-600 font-semibold text-sm mb-1">
              Program Creation
            </div>
            <div className="text-xl font-bold">
              Create New Academic Program
            </div>
            <div className="text-gray-500 text-sm">
              Fill in program details to add it to the system
            </div>
          </div>

          {/* BASIC INFO */}
          <div className="mb-6 p-4 rounded-xl bg-gray-50 border">
            <div className="font-semibold mb-4">Basic Information</div>

            <Form.Item
              name="programName"
              label="Program Name"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g. Computer Science" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="majorId"
                label="Major ID"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name="enrollmentYearId"
                label="Enrollment Year ID"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>
            </div>

            <Form.Item name="duration" label="Duration">
              <Input placeholder="e.g. 3 years (9 semesters)" />
            </Form.Item>
          </div>

          {/* DESCRIPTION */}
          <div className="mb-6 p-4 rounded-xl bg-gray-50 border">
            <div className="font-semibold mb-4">Program Details</div>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item name="careerProspects" label="Career Prospects">
              <Input.TextArea rows={3} />
            </Form.Item>
          </div>

          {/* STATUS */}
          <div className="mb-6 p-4 rounded-xl bg-gray-50 border flex justify-between items-center">
            <div>
              <div className="font-semibold">Program Status</div>
              <div className="text-gray-500 text-sm">
                Toggle whether this program is active
              </div>
            </div>

            <Form.Item
              name="isActive"
              valuePropName="checked"
              initialValue={true}
              className="!mb-0"
            >
              <Switch />
            </Form.Item>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3">
            <Button
              onClick={() => {
                setOpen(false);
                form.resetFields();
              }}
            >
              Cancel
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="px-6"
            >
              Create Program
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Detail/Edit Modal  */}
      <Modal
        open={detailOpen}
        onCancel={() => {
          setDetailOpen(false);
          setEditing(false);
        }}
        footer={null}
        width={800}
      >
        <Form form={detailForm} onFinish={handleUpdate}>

          {/* HEADER */}
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-100 flex justify-between items-center">
            <div>
              <div className="text-blue-600 text-sm font-semibold flex items-center gap-2">
                <Eye size={16} />
                Program Details
              </div>

              <div className="text-xl font-bold">
                {selectedProgram?.programName}
              </div>
            </div>

            {!editing ? (
              <Button
                icon={<Pencil size={16} />}
                className="flex items-center gap-2"
                type="primary"
                ghost
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
            ) : (
              <Button
                icon={<X size={16} />}
                danger
                className="flex items-center gap-2"
                onClick={() => {
                  setEditing(false);
                  detailForm.setFieldsValue(selectedProgram);
                }}
              >
                Cancel
              </Button>
            )}
          </div>

          {/* GRID LAYOUT */}
          <div className="grid grid-cols-2 gap-6 mb-6">

            {/* LEFT */}
            <div className="p-4 rounded-xl bg-gray-50 border space-y-4">
              <div className="font-semibold">Basic Info</div>

              <Form.Item name="programName" label="Program Name">
                <Input disabled={!editing} />
              </Form.Item>

              <Form.Item name="duration" label="Duration">
                <Input disabled={!editing} />
              </Form.Item>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status</span>

                {!editing ? (
                  selectedProgram?.isActive ? (
                    <span className="flex items-center gap-2 text-green-600 font-medium">
                      <CheckCircle size={16} />
                      Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-gray-500 font-medium">
                      <CircleOff size={16} />
                      Inactive
                    </span>
                  )
                ) : (
                  <Form.Item name="isActive" valuePropName="checked" className="!mb-0">
                    <Switch />
                  </Form.Item>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="p-4 rounded-xl bg-gray-50 border space-y-4">
              <div className="font-semibold">Meta Info</div>

              <Form.Item label="Major">
                <Input value={selectedProgram?.majorName} disabled />
              </Form.Item>

              <Form.Item label="Enrollment Year">
                <Input value={selectedProgram?.enrollmentYear} disabled />
              </Form.Item>

              <Form.Item label="Program ID">
                <Input value={selectedProgram?.programId} disabled />
              </Form.Item>
            </div>
          </div>

          {/* FULL WIDTH */}
          <div className="p-4 rounded-xl bg-gray-50 border mb-6 space-y-4">
            <div className="font-semibold">Program Details</div>

            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} disabled={!editing} />
            </Form.Item>

            <Form.Item name="careerProspects" label="Career Prospects">
              <Input.TextArea rows={3} disabled={!editing} />
            </Form.Item>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3">
            <Button
              icon={<X size={16} />}
              onClick={() => setDetailOpen(false)}
            >
              Close
            </Button>

            {editing && (
              <Button
                type="primary"
                htmlType="submit"
                icon={<Save size={16} />}
                className="flex items-center gap-2"
              >
                Save Changes
              </Button>
            )}
          </div>
        </Form>
      </Modal>
    </AdminLayout>
  );
}