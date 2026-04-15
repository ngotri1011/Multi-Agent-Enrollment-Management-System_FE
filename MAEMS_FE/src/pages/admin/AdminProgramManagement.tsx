import { Card, Row, Col, Typography, Button, Tag, Space, Form, Switch, Input, Modal, message, Pagination, Spin, Select } from "antd";
import { AdminLayout } from "../../components/layouts/AdminLayout";
import { useEffect, useState } from "react";
import type { Program } from "../../types/program";
import { createProgram, getallPrograms, getPrograms, updateProgram } from "../../api/programs";
import { CheckCircle, CircleOff, Eye, Pencil, Save, X } from "lucide-react";

const { Title, Text } = Typography;

export function AdminProgramManagement() {

  const enrollmentYearOptions = [
    { label: "2026", value: 1 },
    { label: "2025", value: 2 },
    { label: "2024", value: 3 },
  ];

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState({
    pageNumber: 1,
    pageSize: 6,
    search: "",
    enrollmentYearId: undefined as number | undefined,
    sortBy: undefined as string | undefined,
    sortDesc: false,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pageSize: 6,
  });

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

      message.success("Cập nhật chương trình thành công");

      setDetailOpen(false);
      setEditing(false);

      // refresh list
      const data = await getPrograms();
      setPrograms(data);

    } catch (err) {
      console.error(err);
      message.error("Cập nhật chương trình thất bại");
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

      message.success("Tạo chương trình thành công");

      setOpen(false);
      form.resetFields();

      // refresh list
      const data = await getPrograms();
      setPrograms(data);

    } catch (err) {
      console.error(err);
      message.error("Tạo chương trình thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  //fetch programs from API
  useEffect(() => {
    fetchPrograms();
  }, [query]);

  function cleanParams(params: Record<string, any>) {
    return Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== "")
    );
  }

  const fetchPrograms = async () => {
    try {
      setLoading(true);

      const res = await getallPrograms(cleanParams(query));

      setPrograms(res.items);

      setPagination({
        total: res.totalCount,
        current: res.pageNumber,
        pageSize: res.pageSize,
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Title level={3} className="!mb-1">
            Quản lý chương trình đào tạo
          </Title>

          <Text type="secondary">
            Xem, tạo và chỉnh sửa các chương trình đào tạo của trường.
          </Text>
        </div>

        <Button type="primary" size="large" onClick={() => setOpen(true)}>
          Tạo chương trình mới
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">

        {/*  Search */}
        <Input.Search
          placeholder="Tìm kiếm chương trình..."
          allowClear
          onSearch={(value) => {
            setQuery((prev) => ({
              ...prev,
              search: value,
              pageNumber: 1,
            }));
          }}
          className="w-60"
        />

        {/* Enrollment Year Filter */}
        <Select
          placeholder="Lọc theo năm"
          allowClear
          options={enrollmentYearOptions}
          className="w-40"
          onChange={(value) => {
            setQuery((prev) => ({
              ...prev,
              enrollmentYearId: value,
              pageNumber: 1,
            }));
          }}
        />

        {/* Sort By */}
        <Select
          placeholder="Sắp xếp theo"
          className="w-48"
          allowClear
          options={[
            { label: "Tên chương trình", value: "programName" },
            { label: "Năm tuyển sinh", value: "enrollmentYear" },
            { label: "Thời lượng", value: "duration" },
          ]}
          onChange={(value) => {
            setQuery((prev) => ({
              ...prev,
              sortBy: value,
            }));
          }}
        />

        {/* 🔼🔽 Sort Direction */}
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">Desc</span>
          <Switch
            checked={query.sortDesc}
            onChange={(checked) => {
              setQuery((prev) => ({
                ...prev,
                sortDesc: checked,
              }));
            }}
          />
        </div>
      </div>

      {/* Program Grid */}
      <Spin spinning={loading}>
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
                    <Text type="secondary">Ngành:</Text>
                    <Text strong>{program.majorName}</Text>
                  </div>

                  <div className="flex justify-between">
                    <Text type="secondary">Năm:</Text>
                    <Text strong>{program.enrollmentYear}</Text>
                  </div>

                  <div className="flex justify-between">
                    <Text type="secondary">Thời lượng:</Text>
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
                    Chi tiết
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </Spin>
      <div className="flex justify-center mt-6">
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onChange={(page, pageSize) => {
            setQuery((prev) => ({
              ...prev,
              pageNumber: page,
              pageSize,
            }));
          }}
        />
      </div>

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
              Tạo chương trình
            </div>
            <div className="text-xl font-bold">
              Tạo chương trình học mới
            </div>
            <div className="text-gray-500 text-sm">
              Điền thông tin chương trình để thêm vào hệ thống
            </div>
          </div>

          {/* BASIC INFO */}
          <div className="mb-6 p-4 rounded-xl bg-gray-50 border">
            <div className="font-semibold mb-4">Thông tin cơ bản</div>

            <Form.Item
              name="programName"
              label="Tên chương trình"
              rules={[{ required: true }]}
            >
              <Input placeholder="e.g. Computer Science" />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item
                name="majorId"
                label="Ngành"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item
                name="enrollmentYearId"
                label="Năm Tuyển Sinh"
                rules={[{ required: true }]}
              >
                <Input type="number" />
              </Form.Item>
            </div>

            <Form.Item name="duration" label="Thời lượng">
              <Input placeholder="e.g. 3 years (9 semesters)" />
            </Form.Item>
          </div>

          {/* DESCRIPTION */}
          <div className="mb-6 p-4 rounded-xl bg-gray-50 border">
            <div className="font-semibold mb-4">Chi tiết chương trình</div>

            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item name="careerProspects" label="Cơ hội nghề nghiệp">
              <Input.TextArea rows={3} />
            </Form.Item>
          </div>

          {/* STATUS */}
          <div className="mb-6 p-4 rounded-xl bg-gray-50 border flex justify-between items-center">
            <div>
              <div className="font-semibold">Trạng thái</div>
              <div className="text-gray-500 text-sm">
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
              Tạo chương trình
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
                Chi tiết
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
                Sửa
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
                Hủy
              </Button>
            )}
          </div>

          {/* GRID LAYOUT */}
          <div className="grid grid-cols-2 gap-6 mb-6">

            {/* LEFT */}
            <div className="p-4 rounded-xl bg-gray-50 border space-y-4">
              <div className="font-semibold">Thông tin cơ bản</div>

              <Form.Item name="programName" label="Tên chương trình">
                <Input disabled={!editing} />
              </Form.Item>

              <Form.Item name="duration" label="Thời lượng">
                <Input disabled={!editing} />
              </Form.Item>

              <div className="flex items-center justify-between">
                <span className="text-gray-600">Trạng thái</span>

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
              <div className="font-semibold">Thông tin meta</div>

              <Form.Item label="Chuyên ngành">
                <Input value={selectedProgram?.majorName} disabled />
              </Form.Item>

              <Form.Item label="Năm tuyển sinh">
                <Input value={selectedProgram?.enrollmentYear} disabled />
              </Form.Item>

              <Form.Item label="Chương trình">
                <Input value={selectedProgram?.programId} disabled />
              </Form.Item>
            </div>
          </div>

          {/* FULL WIDTH */}
          <div className="p-4 rounded-xl bg-gray-50 border mb-6 space-y-4">
            <div className="font-semibold">Chi tiết chương trình</div>

            <Form.Item name="description" label="Mô tả">
              <Input.TextArea rows={3} disabled={!editing} />
            </Form.Item>

            <Form.Item name="careerProspects" label="Cơ hội nghề nghiệp">
              <Input.TextArea rows={3} disabled={!editing} />
            </Form.Item>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3">
            <Button
              icon={<X size={16} />}
              onClick={() => setDetailOpen(false)}
            >
              Đóng
            </Button>

            {editing && (
              <Button
                type="primary"
                htmlType="submit"
                icon={<Save size={16} />}
                className="flex items-center gap-2"
              >
                Lưu
              </Button>
            )}
          </div>
        </Form>
      </Modal>
    </AdminLayout>
  );
}