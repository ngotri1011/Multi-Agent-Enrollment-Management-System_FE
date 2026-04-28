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
  InputNumber,
  Divider,
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

type RuleFormValues = {
  admissionTypeName: string;
  enrollmentYearId: number;
  type: string;
  requiredDocumentList: string;

  eligibilityDescription?: string;
  eligibilityScoreMin?: number;
  eligibilityScoreFormula?: string;
  eligibilityRequiredSubjects?: string[];
  eligibilityElectiveSubjects?: string[];
  eligibilityElectiveCount?: number;
  eligibilitySchoolRankMax?: number;

  priorityType?: string;
  priorityLevels?: string[];
  priorityBase?: number;
  priorityStep?: number;
  priorityDescription?: string;

  isActive: boolean;
};

function safeParseJson<T>(value: string | undefined, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function parseDocumentsToText(json: string) {
  const arr = safeParseJson<string[]>(json, []);
  return Array.isArray(arr) ? arr.join("\n") : "";
}

function parseDocumentsToArray(json: string) {
  const arr = safeParseJson<string[]>(json, []);
  return Array.isArray(arr) ? arr : [];
}

function stringifyDocuments(text: string) {
  return JSON.stringify(
    text
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean)
  );
}

function parseEligibilityToForm(json?: string) {
  const parsed = safeParseJson<any>(json, {});
  return {
    eligibilityDescription: parsed?.description || "",
    eligibilityScoreMin: parsed?.requirements?.score?.min,
    eligibilityScoreFormula: parsed?.requirements?.score?.formula || "",
    eligibilityRequiredSubjects: parsed?.requirements?.subjects?.required || [],
    eligibilityElectiveSubjects:
      parsed?.requirements?.subjects?.elective_list || [],
    eligibilityElectiveCount: parsed?.requirements?.subjects?.elective_count,
    eligibilitySchoolRankMax: parsed?.requirements?.schoolrank?.max,
  };
}

function parsePriorityToForm(json?: string) {
  const parsed = safeParseJson<any>(json, {});
  return {
    priorityType: parsed?.type || "",
    priorityLevels: parsed?.levels || [],
    priorityBase: parsed?.calculation?.base,
    priorityStep: parsed?.calculation?.step,
    priorityDescription: parsed?.description || "",
  };
}

function buildEligibilityJson(values: RuleFormValues) {
  const payload = {
    description: values.eligibilityDescription || "",
    requirements: {
      score: {
        min: values.eligibilityScoreMin ?? undefined,
        formula: values.eligibilityScoreFormula || "",
      },
      subjects: {
        required: values.eligibilityRequiredSubjects || [],
        elective_list: values.eligibilityElectiveSubjects || [],
        elective_count: values.eligibilityElectiveCount ?? undefined,
      },
      schoolrank: {
        max: values.eligibilitySchoolRankMax ?? undefined,
      },
    },
  };

  return JSON.stringify(payload);
}

function buildPriorityJson(values: RuleFormValues) {
  const payload = {
    type: values.priorityType || "",
    levels: values.priorityLevels || [],
    calculation: {
      base: values.priorityBase ?? undefined,
      step: values.priorityStep ?? undefined,
    },
    description: values.priorityDescription || "",
  };

  return JSON.stringify(payload);
}

function prettifyJson(json?: string) {
  if (!json) return "-";
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  } catch {
    return json;
  }
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-slate-700">{title}</div>
      {children}
    </div>
  );
}

function RuleFields() {
  return (
    <>
      <Divider style={{ margin: "16px 0 12px" }}>Eligibility Rules</Divider>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="eligibilityDescription" label="Mô tả">
            <Input.TextArea rows={2} placeholder="Mô tả điều kiện xét tuyển" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="eligibilityScoreFormula" label="Công thức điểm">
            <Input placeholder="Ví dụ: Toán + 2 môn tự chọn cao nhất..." />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item name="eligibilityScoreMin" label="Điểm tối thiểu">
            <InputNumber style={{ width: "100%" }} placeholder="21" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="eligibilityElectiveCount" label="Số môn tự chọn">
            <InputNumber style={{ width: "100%" }} placeholder="2" />
          </Form.Item>
        </Col>
        <Col xs={24} md={8}>
          <Form.Item name="eligibilitySchoolRankMax" label="SchoolRank tối đa">
            <InputNumber style={{ width: "100%" }} placeholder="55" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="eligibilityRequiredSubjects" label="Môn bắt buộc">
            <Select
              mode="tags"
              placeholder="Ví dụ: Toán"
              tokenSeparators={[","]}
            />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="eligibilityElectiveSubjects" label="Môn tự chọn">
            <Select
              mode="tags"
              placeholder="Ví dụ: Ngữ văn, Ngoại ngữ..."
              tokenSeparators={[","]}
            />
          </Form.Item>
        </Col>
      </Row>

      <Divider style={{ margin: "16px 0 12px" }}>Priority Rules</Divider>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="priorityType" label="Loại ưu tiên">
            <Input placeholder="Ví dụ: linear" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="priorityDescription" label="Mô tả">
            <Input placeholder="Càng cao hơn điểm sàn thì ưu tiên càng cao" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item name="priorityBase" label="Base">
            <InputNumber style={{ width: "100%" }} placeholder="21" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item name="priorityStep" label="Step">
            <InputNumber style={{ width: "100%" }} placeholder="2" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item name="priorityLevels" label="Levels">
        <Select
          mode="tags"
          placeholder="Normal, Good, Great, Excellent"
          tokenSeparators={[","]}
        />
      </Form.Item>
    </>
  );
}

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

  const [createForm] = Form.useForm<RuleFormValues>();
  const [detailForm] = Form.useForm<RuleFormValues>();

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

  const findYearId = (year?: string) =>
    years.find((y) => y.year === year)?.enrollmentYearId;

  const openCreate = () => {
    createForm.resetFields();
    createForm.setFieldsValue({
      isActive: true,
      requiredDocumentList: "",
      eligibilityDescription: "",
      eligibilityScoreMin: undefined,
      eligibilityScoreFormula: "",
      eligibilityRequiredSubjects: [],
      eligibilityElectiveSubjects: [],
      eligibilityElectiveCount: undefined,
      eligibilitySchoolRankMax: undefined,
      priorityType: "",
      priorityLevels: [],
      priorityBase: undefined,
      priorityStep: undefined,
      priorityDescription: "",
    });
    setCreateOpen(true);
  };

  const openDetail = (record: AdmissionType) => {
    setSelectedDetail(record);
    setDetailMode("view");

    const eligibility = parseEligibilityToForm(record.eligibilityRules);
    const priority = parsePriorityToForm(record.priorityRules);

    detailForm.resetFields();
    detailForm.setFieldsValue({
      admissionTypeName: record.admissionTypeName,
      enrollmentYearId: findYearId(record.enrollmentYear),
      type: record.type,
      requiredDocumentList: parseDocumentsToText(record.requiredDocumentList),
      ...eligibility,
      ...priority,
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

  const handleCreateSubmit = async (values: RuleFormValues) => {
    try {
      const payload: CreateAdmissionTypeRequest = {
        admissionTypeName: values.admissionTypeName,
        enrollmentYearId: values.enrollmentYearId,
        type: values.type,
        requiredDocumentList: stringifyDocuments(values.requiredDocumentList),
        eligibilityRules: buildEligibilityJson(values),
        priorityRules: buildPriorityJson(values),
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

  const handleDetailSubmit = async (values: RuleFormValues) => {
    if (!selectedDetail) return;

    try {
      const payload: UpdateAdmissionTypeRequest = {
        admissionTypeId: selectedDetail.admissionTypeId,
        admissionTypeName: values.admissionTypeName,
        enrollmentYearId: values.enrollmentYearId,
        type: values.type,
        requiredDocumentList: stringifyDocuments(values.requiredDocumentList),
        eligibilityRules: buildEligibilityJson(values),
        priorityRules: buildPriorityJson(values),
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

  const detailTags = selectedDetail
    ? [
        { label: "Năm", value: selectedDetail.enrollmentYear },
        { label: "Loại", value: selectedDetail.type || "-" },
        {
          label: "Trạng thái",
          value: selectedDetail.isActive ? (
            <Tag color="green">Active</Tag>
          ) : (
            <Tag color="red">Inactive</Tag>
          ),
        },
      ]
    : [];

  return (
    <Card className="rounded-2xl" styles={{ body: { padding: 20 } }}>
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
        width={980}
        destroyOnClose
        centered
      >
        <Form
          layout="vertical"
          form={createForm}
          onFinish={handleCreateSubmit}
        >
          <SectionCard title="Thông tin chung">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="admissionTypeName"
                  label="Tên"
                  rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
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
              label="Tài liệu yêu cầu"
              extra="Mỗi dòng là một tài liệu"
            >
              <Input.TextArea rows={4} />
            </Form.Item>
          </SectionCard>

          <RuleFields />

          <div style={{ marginTop: 16 }}>
            <Form.Item
              name="isActive"
              label="Kích hoạt"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title="Chi tiết phương thức xét tuyển"
        open={detailOpen}
        onCancel={closeDetail}
        width={1040}
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
                <div style={{ fontSize: 20, fontWeight: 700 }}>
                  {selectedDetail.admissionTypeName}
                </div>
                <Text type="secondary">
                  ID {selectedDetail.admissionTypeId} · Created at{" "}
                  {selectedDetail.createdAt || "-"}
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
                <SectionCard title="Thông tin chung">
                  <Descriptions bordered column={3} size="middle">
                    <Descriptions.Item label="Tên">
                      {selectedDetail.admissionTypeName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Loại">
                      {selectedDetail.type || "-"}
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
                    <Descriptions.Item label="ID">
                      {selectedDetail.admissionTypeId}
                    </Descriptions.Item>
                  </Descriptions>
                </SectionCard>

                <SectionCard title="Tài liệu yêu cầu">
                  <div className="flex flex-wrap gap-2">
                    {parseDocumentsToArray(selectedDetail.requiredDocumentList).length
                      ? parseDocumentsToArray(selectedDetail.requiredDocumentList).map(
                          (item, index) => (
                            <Tag key={index} className="m-0 px-3 py-1">
                              {item}
                            </Tag>
                          )
                        )
                      : "-"}
                  </div>
                </SectionCard>

                <Row gutter={16}>
                  <Col xs={24} lg={12}>
                    <SectionCard title="Eligibility Rules">
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Description">
                          {safeParseJson<any>(
                            selectedDetail.eligibilityRules,
                            {}
                          )?.description || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Score min">
                          {safeParseJson<any>(
                            selectedDetail.eligibilityRules,
                            {}
                          )?.requirements?.score?.min ?? "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Formula">
                          {safeParseJson<any>(
                            selectedDetail.eligibilityRules,
                            {}
                          )?.requirements?.score?.formula || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Required subjects">
                          {safeParseJson<any>(
                            selectedDetail.eligibilityRules,
                            {}
                          )?.requirements?.subjects?.required?.length ? (
                            <Space wrap>
                              {safeParseJson<any>(
                                selectedDetail.eligibilityRules,
                                {}
                              )?.requirements?.subjects?.required.map(
                                (s: string, idx: number) => (
                                  <Tag key={idx}>{s}</Tag>
                                )
                              )}
                            </Space>
                          ) : (
                            "-"
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Elective subjects">
                          {safeParseJson<any>(
                            selectedDetail.eligibilityRules,
                            {}
                          )?.requirements?.subjects?.elective_list?.length ? (
                            <Space wrap>
                              {safeParseJson<any>(
                                selectedDetail.eligibilityRules,
                                {}
                              )?.requirements?.subjects?.elective_list.map(
                                (s: string, idx: number) => (
                                  <Tag key={idx}>{s}</Tag>
                                )
                              )}
                            </Space>
                          ) : (
                            "-"
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Elective count">
                          {safeParseJson<any>(
                            selectedDetail.eligibilityRules,
                            {}
                          )?.requirements?.subjects?.elective_count ?? "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="SchoolRank max">
                          {safeParseJson<any>(
                            selectedDetail.eligibilityRules,
                            {}
                          )?.requirements?.schoolrank?.max ?? "-"}
                        </Descriptions.Item>
                      </Descriptions>
                    </SectionCard>
                  </Col>

                  <Col xs={24} lg={12}>
                    <SectionCard title="Priority Rules">
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Type">
                          {safeParseJson<any>(
                            selectedDetail.priorityRules,
                            {}
                          )?.type || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Description">
                          {safeParseJson<any>(
                            selectedDetail.priorityRules,
                            {}
                          )?.description || "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Levels">
                          {safeParseJson<any>(
                            selectedDetail.priorityRules,
                            {}
                          )?.levels?.length ? (
                            <Space wrap>
                              {safeParseJson<any>(
                                selectedDetail.priorityRules,
                                {}
                              )?.levels.map((s: string, idx: number) => (
                                <Tag key={idx}>{s}</Tag>
                              ))}
                            </Space>
                          ) : (
                            "-"
                          )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Base">
                          {safeParseJson<any>(
                            selectedDetail.priorityRules,
                            {}
                          )?.calculation?.base ?? "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Step">
                          {safeParseJson<any>(
                            selectedDetail.priorityRules,
                            {}
                          )?.calculation?.step ?? "-"}
                        </Descriptions.Item>
                      </Descriptions>
                    </SectionCard>
                  </Col>
                </Row>
              </Space>
            ) : (
              <Form
                layout="vertical"
                form={detailForm}
                onFinish={handleDetailSubmit}
              >
                <SectionCard title="Thông tin chung">
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="admissionTypeName"
                        label="Tên"
                        rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                      >
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
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
                    label="Tài liệu yêu cầu"
                    extra="Mỗi dòng là một tài liệu"
                  >
                    <Input.TextArea rows={4} />
                  </Form.Item>
                </SectionCard>

                <RuleFields />

                <div style={{ marginTop: 16 }}>
                  <Form.Item
                    name="isActive"
                    label="Kích hoạt"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </div>
              </Form>
            )}
          </>
        )}
      </Modal>
    </Card>
  );
}