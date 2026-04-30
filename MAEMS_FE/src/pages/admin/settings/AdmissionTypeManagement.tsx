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
  Descriptions,
  Tag,
  Typography,
  Row,
  Col,
} from "antd";
import { useEffect, useMemo, useState } from "react";
import type {
  AdmissionType,
  CreateAdmissionTypeRequest,
  UpdateAdmissionTypeRequest,
} from "../../../types/admission.type";
import type { EnrollmentYear } from "../../../types/enrollment-years";
import {
  getAdmissionTypes,
  createAdmissionType,
  updateAdmissionType,
} from "../../../api/admission-types";
import { getEnrollmentYears } from "../../../api/enrollment-years";

type DetailMode = "view" | "edit";

export function AdmissionTypeManagement() {
  const [data, setData] = useState<AdmissionType[]>([]);
  const [years, setYears] = useState<EnrollmentYear[]>([]);
  const [loading, setLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailMode, setDetailMode] = useState<DetailMode>("view");
  const [selectedDetail, setSelectedDetail] = useState<AdmissionType | null>(
    null
  );

  const [createForm] = Form.useForm();
  const [detailForm] = Form.useForm();

  const { Paragraph, Text } = Typography;

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getAdmissionTypes();
      setData(res);
    } catch {
      message.error("Lấy dữ liệu phương thức xét tuyển thất bại");
    } finally {
      setLoading(false);
    }
  };

  const fetchYears = async () => {
    try {
      const res = await getEnrollmentYears();
      setYears(res);
    } catch {
      message.error("Lấy dữ liệu năm tuyển sinh thất bại");
    }
  };

  useEffect(() => {
    fetchData();
    fetchYears();
  }, []);

  const parseList = (json: string) => {
    try {
      const arr = JSON.parse(json);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  const parseDocuments = (json: string) => {
    return parseList(json).join("\n");
  };

  const stringifyDocuments = (text: string) => {
    const arr = text
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    return JSON.stringify(arr);
  };

  const parseJsonPretty = (json?: string) => {
    if (!json) return "";
    try {
      return JSON.stringify(JSON.parse(json), null, 2);
    } catch {
      return json;
    }
  };

  const normalizeJsonString = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return "";
    return JSON.stringify(JSON.parse(trimmed));
  };

  const findYearId = (year?: string) =>
    years.find((y) => y.year === year)?.enrollmentYearId;

  const openCreate = () => {
    createForm.resetFields();
    createForm.setFieldsValue({
      isActive: true,
      requiredDocumentList: "",
      eligibilityRules: "",
      priorityRules: "",
    });
    setCreateOpen(true);
  };

  const openDetail = (record: AdmissionType) => {
    setSelectedDetail(record);
    setDetailMode("view");

    detailForm.resetFields();
    detailForm.setFieldsValue({
      admissionTypeName: record.admissionTypeName,
      enrollmentYearId: findYearId(record.enrollmentYear),
      type: record.type,
      requiredDocumentList: parseDocuments(record.requiredDocumentList),
      eligibilityRules: parseJsonPretty(record.eligibilityRules),
      priorityRules: parseJsonPretty(record.priorityRules),
      isActive: record.isActive,
    });

    setDetailOpen(true);
  };

  const enableEdit = () => {
    setDetailMode("edit");
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailMode("view");
    setSelectedDetail(null);
    detailForm.resetFields();
  };

  const handleCreateSubmit = async (values: any) => {
    try {
      const payload: CreateAdmissionTypeRequest = {
        admissionTypeName: values.admissionTypeName,
        enrollmentYearId: values.enrollmentYearId,
        type: values.type,
        requiredDocumentList: stringifyDocuments(values.requiredDocumentList),
        eligibilityRules: normalizeJsonString(values.eligibilityRules),
        priorityRules: normalizeJsonString(values.priorityRules),
        isActive: values.isActive ?? true,
      };

      await createAdmissionType(payload);
      message.success("Tạo thành công");
      setCreateOpen(false);
      fetchData();
    } catch {
      message.error("Lưu dữ liệu thất bại");
    }
  };

  const handleDetailSubmit = async (values: any) => {
    if (!selectedDetail) return;

    try {
      const payload: UpdateAdmissionTypeRequest = {
        admissionTypeId: selectedDetail.admissionTypeId,
        admissionTypeName: values.admissionTypeName,
        enrollmentYearId: values.enrollmentYearId,
        type: values.type,
        requiredDocumentList: stringifyDocuments(values.requiredDocumentList),
        eligibilityRules: normalizeJsonString(values.eligibilityRules),
        priorityRules: normalizeJsonString(values.priorityRules),
        isActive: values.isActive ?? true,
      };

      await updateAdmissionType(selectedDetail.admissionTypeId, payload);
      message.success("Cập nhật thành công");
      setDetailMode("view");
      fetchData();
      closeDetail();
    } catch {
      message.error("Cập nhật thất bại");
    }
  };

  const columns = useMemo(
    () => [
      { title: "Tên", dataIndex: "admissionTypeName" },
      { title: "Loại", dataIndex: "type" },
      { title: "Năm", dataIndex: "enrollmentYear" },
      {
        title: "Trạng thái",
        render: (_: unknown, record: AdmissionType) => (
          <Switch checked={record.isActive} disabled />
        ),
      },
      {
        title: "Actions",
        render: (_: unknown, record: AdmissionType) => (
          <Space>
            <Button onClick={() => openDetail(record)}>Xem chi tiết</Button>
          </Space>
        ),
      },
    ],
    [years]
  );

  return (
    <Card
      className="rounded-2xl"
      styles={{
        body: { padding: 20 },
      }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <Input placeholder="Tìm kiếm..." style={{ width: 280 }} allowClear />
        <Button type="primary" onClick={openCreate}>
          + Thêm loại
        </Button>
      </div>

      <Table
        rowKey="admissionTypeId"
        columns={columns}
        dataSource={data}
        loading={loading}
      />

      <Modal
        title="Tạo loại xét tuyển"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={() => createForm.submit()}
        width={860}
        destroyOnClose
        centered
      >
        <Form
          layout="vertical"
          form={createForm}
          onFinish={handleCreateSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="admissionTypeName"
                label="Tên"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="enrollmentYearId"
                label="Năm tuyển sinh"
                rules={[
                  { required: true, message: "Vui lòng chọn năm tuyển sinh" },
                ]}
              >
                <Select
                  placeholder="Chọn năm"
                  options={years.map((y) => ({
                    label: y.year,
                    value: y.enrollmentYearId,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="type" label="Loại">
            <Input />
          </Form.Item>

          <Form.Item
            name="requiredDocumentList"
            label="Tài liệu yêu cầu (mỗi dòng một tài liệu)"
          >
            <Input.TextArea rows={4} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="eligibilityRules" label="Eligibility Rules (JSON)">
                <Input.TextArea rows={6} placeholder='{"description":"..."}' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="priorityRules" label="Priority Rules (JSON)">
                <Input.TextArea rows={6} placeholder='{"type":"linear"}' />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="isActive"
            label="Kích hoạt"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết phương thức xét tuyển"
        open={detailOpen}
        onCancel={closeDetail}
        width={960}
        destroyOnClose
        centered
        footer={
          detailMode === "view"
            ? [
                <Button key="edit" type="primary" onClick={enableEdit}>
                  Sửa
                </Button>,
                <Button key="close" onClick={closeDetail}>
                  Đóng
                </Button>,
              ]
            : [
                <Button key="cancel" onClick={() => setDetailMode("view")}>
                  Hủy sửa
                </Button>,
                <Button key="save" type="primary" onClick={() => detailForm.submit()}>
                  Lưu
                </Button>,
              ]
        }
      >
        {selectedDetail && (
          <>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>
                  {selectedDetail.admissionTypeName}
                </div>
                <Text type="secondary">
                  ID {selectedDetail.admissionTypeId} · Năm{" "}
                  {selectedDetail.enrollmentYear}
                </Text>
              </div>

              {detailMode === "view" && (
                <Button type="primary" onClick={enableEdit}>
                  Sửa
                </Button>
              )}
            </div>

            {detailMode === "view" ? (
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Descriptions bordered column={2} size="middle">
                  <Descriptions.Item label="Tên">
                    {selectedDetail.admissionTypeName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Loại">
                    {selectedDetail.type}
                  </Descriptions.Item>
                  <Descriptions.Item label="Năm tuyển sinh">
                    {selectedDetail.enrollmentYear}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    {selectedDetail.isActive ? (
                      <Tag color="green">Active</Tag>
                    ) : (
                      <Tag color="red">Inactive</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Created At">
                    {selectedDetail.createdAt || "-"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Admission Type ID">
                    {selectedDetail.admissionTypeId}
                  </Descriptions.Item>
                </Descriptions>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 text-sm font-semibold text-slate-700">
                    Required Documents
                  </div>
                  <Paragraph style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>
                    {parseDocuments(selectedDetail.requiredDocumentList) || "-"}
                  </Paragraph>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 text-sm font-semibold text-slate-700">
                    Eligibility Rules
                  </div>
                  <pre className="m-0 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {parseJsonPretty(selectedDetail.eligibilityRules) || "-"}
                  </pre>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 text-sm font-semibold text-slate-700">
                    Priority Rules
                  </div>
                  <pre className="m-0 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {parseJsonPretty(selectedDetail.priorityRules) || "-"}
                  </pre>
                </div>
              </Space>
            ) : (
              <Form
                layout="vertical"
                form={detailForm}
                onFinish={handleDetailSubmit}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="admissionTypeName"
                      label="Tên"
                      rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                    >
                      <Input />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="enrollmentYearId"
                      label="Năm tuyển sinh"
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng chọn năm tuyển sinh",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Chọn năm"
                        options={years.map((y) => ({
                          label: y.year,
                          value: y.enrollmentYearId,
                        }))}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="type" label="Loại">
                  <Input />
                </Form.Item>

                <Form.Item
                  name="requiredDocumentList"
                  label="Tài liệu yêu cầu (mỗi dòng một tài liệu)"
                >
                  <Input.TextArea rows={4} />
                </Form.Item>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="eligibilityRules"
                      label="Eligibility Rules (JSON)"
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!value || !value.trim()) return Promise.resolve();
                            try {
                              JSON.parse(value);
                              return Promise.resolve();
                            } catch {
                              return Promise.reject(
                                new Error("Eligibility Rules phải là JSON hợp lệ")
                              );
                            }
                          },
                        },
                      ]}
                    >
                      <Input.TextArea rows={6} />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="priorityRules"
                      label="Priority Rules (JSON)"
                      rules={[
                        {
                          validator: (_, value) => {
                            if (!value || !value.trim()) return Promise.resolve();
                            try {
                              JSON.parse(value);
                              return Promise.resolve();
                            } catch {
                              return Promise.reject(
                                new Error("Priority Rules phải là JSON hợp lệ")
                              );
                            }
                          },
                        },
                      ]}
                    >
                      <Input.TextArea rows={6} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="isActive"
                  label="Kích hoạt"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Form>
            )}
          </>
        )}
      </Modal>
    </Card>
  );
}