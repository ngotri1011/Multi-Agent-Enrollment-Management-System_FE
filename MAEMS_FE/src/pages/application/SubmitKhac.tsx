import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Divider,
  Form,
  Select,
  Spin,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeft,
  Award,
  FileText,
  GraduationCap,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "../../components/DashboardLayout";
import { applicantMenu } from "../applicant/applicantMenu";
import { getMyApplicant } from "../../api/applicant";
import { getPrograms } from "../../api/programs";
import { getCampuses } from "../../api/campuses";
import { getAdmissionTypes } from "../../api/admission_types";
import { submitApplication } from "../../api/application";
import type { CreateApplicantResponse } from "../../types/applicant";
import type { Program } from "../../types/program";
import type { Campus } from "../../types/campus";
import type { AdmissionType } from "../../types/admission_type";

const { Title, Text } = Typography;

const REQUIRED_DOCS = [
  "Bản sao CMND/CCCD/hộ chiếu",
  "Bản photo/scan các giấy tờ chứng nhận điều kiện xét tuyển thẳng (nếu có)",
  "Bản photo/scan văn bằng, chứng chỉ tương ứng với phương thức đăng ký",
];

type FormValues = {
  programId: number;
  campusId: number;
  admissionTypeId: number;
  confirmedDocs: string[];
};

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
          <Text className="!text-sm !font-semibold !text-gray-800">
            {formatDate(applicant.dateOfBirth)}
          </Text>
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

export function SubmitKhac() {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  const [applicant, setApplicant] = useState<CreateApplicantResponse | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [admissionTypes, setAdmissionTypes] = useState<AdmissionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      getMyApplicant().catch(() => null),
      getPrograms().catch(() => []),
      getCampuses().catch(() => []),
      getAdmissionTypes().catch(() => []),
    ]).then(([applicantData, programsData, campusesData, admTypesData]) => {
      setApplicant(applicantData);
      setPrograms(programsData ?? []);
      setCampuses(campusesData ?? []);
      setAdmissionTypes(
        (admTypesData ?? []).filter((t) => {
          const name = t.admissionTypeName?.toLowerCase() ?? "";
          return (
            t.type === "PT4" ||
            name.includes("thẳng") ||
            name.includes("xét thẳng") ||
            name.includes("ưu tiên") ||
            name.includes("khác")
          );
        })
      );
      setLoading(false);
    });
  }, []);

  async function handleSubmit(values: FormValues) {
    if (!values.confirmedDocs || values.confirmedDocs.length < REQUIRED_DOCS.length) {
      messageApi.warning("Vui lòng xác nhận đã chuẩn bị đầy đủ tất cả tài liệu yêu cầu.");
      return;
    }
    setSubmitting(true);
    try {
      await submitApplication({
        programId: values.programId,
        enrollmentYearId: 1,
        campusId: values.campusId,
        admissionTypeId: values.admissionTypeId,
      });
      messageApi.success("Đăng ký xét tuyển thẳng thành công!");
      setTimeout(() => navigate("/applicant/applications"), 1200);
    } catch {
      messageApi.error("Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout menuItems={applicantMenu}>
      {contextHolder}
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate("/applicant/submit-application")}
          className="flex items-center gap-2 text-gray-400 hover:text-orange-500 text-sm mb-6 transition-colors cursor-pointer bg-transparent border-0 p-0"
        >
          <ArrowLeft size={15} />
          Quay lại chọn phương thức
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center">
            <Award size={20} className="text-orange-500" />
          </div>
          <div>
            <Text className="text-xs text-gray-400 uppercase tracking-wider">
              PT4 — Phương thức xét tuyển
            </Text>
            <Title level={4} className="!mb-0 !text-gray-800 !font-bold">
              Xét tuyển thẳng
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
              <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
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

                  <Form.Item
                    name="campusId"
                    label={<Text strong>Cơ sở đăng ký</Text>}
                    rules={[{ required: true, message: "Vui lòng chọn cơ sở" }]}
                  >
                    <Select
                      placeholder="Chọn cơ sở"
                      size="large"
                      className="w-full"
                      options={campuses.map((c) => ({
                        value: c.campusId,
                        label: c.name,
                      }))}
                    />
                  </Form.Item>

                  <Form.Item
                    name="admissionTypeId"
                    label={<Text strong>Phương thức xét tuyển cụ thể</Text>}
                    rules={[{ required: true, message: "Vui lòng chọn phương thức" }]}
                  >
                    <Select
                      placeholder="Chọn phương thức xét tuyển thẳng"
                      size="large"
                      className="w-full"
                      options={admissionTypes.map((a) => ({
                        value: a.admissionTypeId,
                        label: a.admissionTypeName,
                      }))}
                    />
                  </Form.Item>
                </div>

                <Divider className="!my-5" />

                <div className="flex items-center gap-2 mb-3">
                  <FileText size={15} className="text-orange-500" />
                  <Text className="!text-gray-600 !font-semibold !text-sm uppercase tracking-wide">
                    Tài liệu cần chuẩn bị
                  </Text>
                </div>
                <Text className="text-gray-400 text-xs mb-4 block">
                  Tick vào từng mục để xác nhận đã chuẩn bị. Nộp bản mềm (PDF/JPG/PNG) tại email tuyển sinh sau khi đăng ký.
                </Text>

                <Form.Item
                  name="confirmedDocs"
                  rules={[
                    {
                      validator: (_, value) =>
                        value && value.length === REQUIRED_DOCS.length
                          ? Promise.resolve()
                          : Promise.reject("Vui lòng xác nhận đủ tất cả tài liệu"),
                    },
                  ]}
                >
                  <Checkbox.Group className="flex flex-col gap-3 w-full">
                    {REQUIRED_DOCS.map((doc) => (
                      <div
                        key={doc}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100"
                      >
                        <Checkbox value={doc} className="mt-0.5" />
                        <span className="text-sm text-gray-700 leading-snug">{doc}</span>
                      </div>
                    ))}
                  </Checkbox.Group>
                </Form.Item>

                <div className="rounded-lg bg-amber-50 border border-amber-100 p-3 mb-6 text-xs text-amber-700">
                  <strong>Lưu ý:</strong> Lệ phí đăng ký xét tuyển: <strong>200.000 đồng</strong>. Đăng ký chỉ hợp lệ khi Trường nhận được đầy đủ hồ sơ và tiền đăng ký.
                </div>

                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  loading={submitting}
                  disabled={!applicant}
                  className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 !rounded-xl !h-12 !font-semibold"
                >
                  Nộp hồ sơ xét tuyển thẳng
                </Button>
              </Form>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
