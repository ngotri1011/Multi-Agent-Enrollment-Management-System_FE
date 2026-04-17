import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Select,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import { ArrowLeft, ClipboardList, GraduationCap, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ApplicantLayout } from "../../layouts/ApplicantLayout";
import { ApplicantMenu } from "../applicant/ApplicantMenu";
import { getMyApplicant } from "../../api/applicants";
import { getActiveProgramsBasic } from "../../api/programs";
import { submitApplication } from "../../api/applications";
import { getProgramAdmissionConfigsFilter } from "../../api/program-admission-configs";
import type { CreateApplicantResponse } from "../../types/applicant";
import type { ProgramBasic } from "../../types/program";

const { Title, Text } = Typography;

type FormValues = {
  programId: number;
  campusId: number;
  admissionTypeId: number;
};

type FilterLoading = "campus" | "admissionType" | "config" | null;

type CampusOption = { campusId: number; campusName: string };
type AdmTypeOption = { admissionTypeId: number; admissionTypeName: string };

function ApplicantInfoCard({ applicant }: { applicant: CreateApplicantResponse }) {
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="rounded-xl bg-orange-50 border border-orange-100 p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <User size={15} className="text-orange-500" />
        <Text className="!text-orange-700 !font-semibold !text-sm uppercase tracking-wide">
          Thông tin thí sinh
        </Text>
        <Tag color="orange" className="ml-auto !rounded-full !text-xs">
          Tự động điền từ hồ sơ
        </Tag>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <Text className="!text-xs !text-gray-400 block">Họ và tên</Text>
          <Text className="!text-sm !font-semibold !text-gray-800">{applicant.fullName}</Text>
        </div>
        <div>
          <Text className="!text-xs !text-gray-400 block">Ngày sinh</Text>
          <Text className="!text-sm !font-semibold !text-gray-800">{formatDate(applicant.dateOfBirth)}</Text>
        </div>
        <div>
          <Text className="!text-xs !text-gray-400 block">Số CCCD / CMND</Text>
          <Text className="!text-sm !font-semibold !text-gray-800">{applicant.idIssueNumber}</Text>
        </div>
        <div>
          <Text className="!text-xs !text-gray-400 block">Trường THPT</Text>
          <Text className="!text-sm !font-semibold !text-gray-800">{applicant.highSchoolName}</Text>
        </div>
        <div>
          <Text className="!text-xs !text-gray-400 block">Tỉnh / Thành phố</Text>
          <Text className="!text-sm !font-semibold !text-gray-800">{applicant.highSchoolProvince}</Text>
        </div>
        <div>
          <Text className="!text-xs !text-gray-400 block">Năm tốt nghiệp</Text>
          <Text className="!text-sm !font-semibold !text-gray-800">{applicant.graduationYear}</Text>
        </div>
        <div>
          <Text className="!text-xs !text-gray-400 block">Liên lạc</Text>
          <Text className="!text-sm !font-semibold !text-gray-800">{applicant.contactPhone}</Text>
        </div>
        <div>
          <Text className="!text-xs !text-gray-400 block">Email</Text>
          <Text className="!text-sm !font-semibold !text-gray-800">{applicant.contactEmail}</Text>
        </div>
      </div>
    </div>
  );
}

export function SubmitForm() {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  const [applicant, setApplicant] = useState<CreateApplicantResponse | null>(null);
  const [programs, setPrograms] = useState<ProgramBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Cascading options derived from API
  const [availableCampuses, setAvailableCampuses] = useState<CampusOption[]>([]);
  const [availableAdmTypes, setAvailableAdmTypes] = useState<AdmTypeOption[]>([]);

  // Which step is currently loading
  const [filterLoading, setFilterLoading] = useState<FilterLoading>(null);
  const [configId, setConfigId] = useState<number | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      getMyApplicant().catch(() => null),
      getActiveProgramsBasic().catch(() => []),
    ]).then(([applicantData, programsData]) => {
      setApplicant(applicantData);
      setPrograms(programsData ?? []);
      setLoading(false);
    });
  }, []);

  async function handleValuesChange(
    changedValues: Partial<FormValues>,
    allValues: FormValues
  ) {
    // ── Program changed ──────────────────────────────────────────────────────
    if ("programId" in changedValues) {
      form.setFieldsValue({ campusId: undefined, admissionTypeId: undefined });
      setAvailableCampuses([]);
      setAvailableAdmTypes([]);
      setConfigId(null);
      setConfigError(null);

      if (!changedValues.programId) return;

      setFilterLoading("campus");
      try {
        const configs = await getProgramAdmissionConfigsFilter(changedValues.programId);
        const campusMap = new Map<number, string>();
        const admTypeMap = new Map<number, string>();
        configs?.forEach((c) => {
          campusMap.set(c.campusId, c.campusName);
          admTypeMap.set(c.admissionTypeId, c.admissionTypeName);
        });
        setAvailableCampuses(
          Array.from(campusMap, ([campusId, campusName]) => ({ campusId, campusName }))
        );
        setAvailableAdmTypes(
          Array.from(admTypeMap, ([admissionTypeId, admissionTypeName]) => ({
            admissionTypeId,
            admissionTypeName,
          }))
        );
      } catch {
        setConfigError("Không thể tải danh sách cơ sở. Vui lòng thử lại.");
      } finally {
        setFilterLoading(null);
      }
      return;
    }

    // ── Campus changed ───────────────────────────────────────────────────────
    if ("campusId" in changedValues) {
      form.setFieldsValue({ admissionTypeId: undefined });
      setAvailableAdmTypes([]);
      setConfigId(null);
      setConfigError(null);

      const { programId } = allValues;
      if (!programId || !changedValues.campusId) return;

      setFilterLoading("admissionType");
      try {
        const configs = await getProgramAdmissionConfigsFilter(programId, changedValues.campusId);
        const admTypeMap = new Map<number, string>();
        configs?.forEach((c) => admTypeMap.set(c.admissionTypeId, c.admissionTypeName));
        setAvailableAdmTypes(
          Array.from(admTypeMap, ([admissionTypeId, admissionTypeName]) => ({
            admissionTypeId,
            admissionTypeName,
          }))
        );
      } catch {
        setConfigError("Không thể tải danh sách phương thức. Vui lòng thử lại.");
      } finally {
        setFilterLoading(null);
      }
      return;
    }

    // ── Admission type changed ────────────────────────────────────────────────
    if ("admissionTypeId" in changedValues) {
      setConfigId(null);
      setConfigError(null);

      const { programId, campusId } = allValues;
      if (!programId || !campusId || !changedValues.admissionTypeId) return;

      setFilterLoading("config");
      try {
        const configs = await getProgramAdmissionConfigsFilter(
          programId,
          campusId,
          changedValues.admissionTypeId
        );
        if (configs && configs.length > 0) {
          setConfigId(configs[0].configId);
        } else {
          setConfigError("Không tìm thấy cấu hình xét tuyển phù hợp với lựa chọn này.");
        }
      } catch {
        setConfigError("Không thể kiểm tra cấu hình xét tuyển. Vui lòng thử lại.");
      } finally {
        setFilterLoading(null);
      }
    }
  }

  async function handleSubmit() {
    if (!configId) {
      messageApi.error("Không có cấu hình xét tuyển hợp lệ. Vui lòng kiểm tra lại lựa chọn.");
      return;
    }
    setSubmitting(true);
    try {
      await submitApplication({ configId });
      messageApi.success("Đăng ký xét tuyển thành công! Vui lòng nộp tài liệu trong trang Hồ sơ cá nhân.");
      setTimeout(() => navigate("/applicant/profile"), 1500);
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { message?: string; errors?: string[] } } })
        .response?.data;
      const msg =
        errData?.message ||
        (errData?.errors?.length ? errData.errors.join("; ") : null) ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      messageApi.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  const programId = Form.useWatch("programId", form);
  const campusId = Form.useWatch("campusId", form);

  return (
    <ApplicantLayout menuItems={ApplicantMenu}>
      {contextHolder}
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/applicant/submit-application")}
          className="flex items-center gap-2 text-gray-400 hover:text-orange-500 text-sm mb-6 transition-colors cursor-pointer bg-transparent border-0 p-0"
        >
          <ArrowLeft size={15} />
          Quay lại xem phương thức xét tuyển
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
            <ClipboardList size={20} className="text-orange-500" />
          </div>
          <div>
            <Text className="text-xs text-gray-400 uppercase tracking-wider">
              Tuyển sinh 2026 — FPT University
            </Text>
            <Title level={4} className="!mb-0 !text-gray-800 !font-bold">
              Đăng ký xét tuyển đại học
            </Title>
          </div>
        </div>

        {loading ? (
          <Card className="rounded-2xl border border-gray-100 shadow-sm p-8">
            <Spin className="mr-3" />
            <Text className="text-gray-400">Đang tải dữ liệu...</Text>
          </Card>
        ) : (
          <>
            {!applicant && (
              <Alert
                type="warning"
                showIcon
                className="mb-6 rounded-xl"
                message="Chưa có hồ sơ thí sinh"
                description="Bạn cần hoàn thiện hồ sơ cá nhân trước khi đăng ký xét tuyển."
                action={
                  <Button
                    size="small"
                    onClick={() => navigate("/applicant/profile")}
                    className="!rounded-lg"
                  >
                    Cập nhật hồ sơ
                  </Button>
                }
              />
            )}

            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 md:p-8">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                onValuesChange={handleValuesChange}
                requiredMark={false}
              >
                {applicant ? (
                  <ApplicantInfoCard applicant={applicant} />
                ) : (
                  <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 mb-6 text-center">
                    <Text className="text-gray-400 text-sm">
                      Thông tin thí sinh sẽ hiển thị sau khi bạn tạo hồ sơ cá nhân.
                    </Text>
                  </div>
                )}

                <Divider className="!my-5" />

                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap size={15} className="text-orange-500" />
                  <Text className="!text-gray-600 !font-semibold !text-sm uppercase tracking-wide">
                    Thông tin đăng ký
                  </Text>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                  {/* ── Ngành ─────────────────────────────────────────────── */}
                  <Form.Item
                    name="programId"
                    label={<Text strong>Ngành đăng ký xét tuyển</Text>}
                    rules={[{ required: true, message: "Vui lòng chọn ngành" }]}
                    className="sm:col-span-2"
                  >
                    <Select
                      placeholder="Chọn ngành học"
                      size="large"
                      className="w-full"
                      showSearch
                      filterOption={(input, option) =>
                        String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                      }
                      options={programs.map((p) => ({
                        value: p.programId,
                        label: `${p.majorName} — ${p.programName}`,
                      }))}
                    />
                  </Form.Item>

                  {/* ── Cơ sở ─────────────────────────────────────────────── */}
                  <Form.Item
                    name="campusId"
                    label={
                      <span className="flex items-center gap-1.5">
                        <Text strong>Cơ sở đăng ký</Text>
                        {filterLoading === "campus" && <Spin size="small" />}
                        {!programId && (
                          <Text className="!text-xs !text-gray-400 !font-normal">
                            — chọn ngành trước
                          </Text>
                        )}
                        {programId && !filterLoading && availableCampuses.length > 0 && (
                          <Tag color="green" className="!rounded-full !text-xs !py-0">
                            {availableCampuses.length} khả dụng
                          </Tag>
                        )}
                      </span>
                    }
                    rules={[{ required: true, message: "Vui lòng chọn cơ sở" }]}
                  >
                    <Select
                      placeholder={
                        !programId
                          ? "Vui lòng chọn ngành trước"
                          : filterLoading === "campus"
                          ? "Đang tải..."
                          : "Chọn cơ sở"
                      }
                      size="large"
                      className="w-full"
                      disabled={!programId || filterLoading === "campus"}
                      loading={filterLoading === "campus"}
                      options={availableCampuses.map((c) => ({
                        value: c.campusId,
                        label: c.campusName,
                      }))}
                    />
                  </Form.Item>

                  {/* ── Phương thức ────────────────────────────────────────── */}
                  <Form.Item
                    name="admissionTypeId"
                    label={
                      <span className="flex items-center gap-1.5">
                        <Text strong>Phương thức xét tuyển</Text>
                        {filterLoading === "admissionType" && <Spin size="small" />}
                        {!campusId && (
                          <Text className="!text-xs !text-gray-400 !font-normal">
                            — chọn cơ sở trước
                          </Text>
                        )}
                        {campusId && !filterLoading && availableAdmTypes.length > 0 && (
                          <Tag color="green" className="!rounded-full !text-xs !py-0">
                            {availableAdmTypes.length} khả dụng
                          </Tag>
                        )}
                      </span>
                    }
                    rules={[{ required: true, message: "Vui lòng chọn phương thức" }]}
                  >
                    <Select
                      placeholder={
                        !campusId
                          ? "Vui lòng chọn cơ sở trước"
                          : filterLoading === "admissionType"
                          ? "Đang tải..."
                          : "Chọn phương thức xét tuyển"
                      }
                      size="large"
                      className="w-full"
                      disabled={!campusId || filterLoading === "admissionType"}
                      loading={filterLoading === "admissionType"}
                      options={availableAdmTypes.map((a) => ({
                        value: a.admissionTypeId,
                        label: a.admissionTypeName,
                      }))}
                    />
                  </Form.Item>
                </div>

                {/* ── Config status ─────────────────────────────────────────── */}
                {filterLoading === "config" && (
                  <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 mb-4 text-xs text-gray-500 flex items-center gap-2">
                    <Spin size="small" />
                    Đang xác nhận cấu hình xét tuyển...
                  </div>
                )}
                {filterLoading !== "config" && configError && (
                  <Alert type="error" showIcon className="mb-4 rounded-lg" message={configError} />
                )}
                {filterLoading !== "config" && configId && (
                  <Alert
                    type="success"
                    showIcon
                    className="mb-4 rounded-lg"
                    message={`Cấu hình xét tuyển hợp lệ. Bạn có thể tiến hành đăng ký.`}
                  />
                )}

                <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 mb-6 text-xs text-blue-700 mt-4">
                  Sau khi đăng ký, bạn cần <strong>nộp tài liệu</strong> trong trang{" "}
                  <span className="font-semibold">Hồ sơ cá nhân</span> để hoàn tất hồ sơ.
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={submitting}
                  disabled={!applicant || !configId || !!filterLoading}
                  className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 !rounded-xl !h-12 !font-semibold"
                >
                  Xác nhận đăng ký xét tuyển
                </Button>
              </Form>
            </div>
          </>
        )}
      </div>
    </ApplicantLayout>
  );
}
