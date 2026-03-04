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
  Upload,
  message,
} from "antd";
import type { UploadFile } from "antd";
import {
  ArrowLeft,
  GraduationCap,
  Paperclip,
  UploadCloud,
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

type DocField = {
  id: string;
  label: string;
  required: boolean;
  accept: string;
  hint?: string;
};

const DOC_FIELDS: DocField[] = [
  {
    id: "cccd_front",
    label: "Ảnh chụp CCCD/CMND mặt trước",
    required: true,
    accept: "image/*,.pdf",
  },
  {
    id: "cccd_back",
    label: "Ảnh chụp CCCD/CMND mặt sau",
    required: true,
    accept: "image/*,.pdf",
  },
  {
    id: "chung_nhan_thpt",
    label: "Bản sao Giấy chứng nhận kết quả kỳ thi tốt nghiệp THPT năm 2026",
    required: true,
    accept: "image/*,.pdf",
  },
  {
    id: "uu_tien_mat1",
    label: "Đơn ĐK ưu tiên xét tuyển – Mặt 1 (Dành cho đối tượng thế hệ 1)",
    required: false,
    accept: "image/*,.pdf",
  },
  {
    id: "uu_tien_mat2",
    label: "Đơn ĐK ưu tiên xét tuyển – Mặt 2 (Dành cho đối tượng thế hệ 1)",
    required: false,
    accept: "image/*,.pdf",
  },
  {
    id: "uu_tien_mat3",
    label: "Đơn ĐK ưu tiên xét tuyển – Mặt 3 (Dành cho đối tượng thế hệ 1)",
    required: false,
    accept: "image/*,.pdf",
  },
  {
    id: "bien_lai",
    label: "Biên lai nộp phí đăng ký",
    required: false,
    accept: "image/*,.pdf",
  },
];

type FormValues = {
  programId: number;
  campusId: number;
  admissionTypeId: number;
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

export function SubmitTHPT() {
  const navigate = useNavigate();
  const [form] = Form.useForm<FormValues>();
  const [messageApi, contextHolder] = message.useMessage();

  const [applicant, setApplicant] = useState<CreateApplicantResponse | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [admissionTypes, setAdmissionTypes] = useState<AdmissionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadFile[]>>({});

  const handleFileChange = (id: string, fileList: UploadFile[]) => {
    setUploadedFiles((prev) => ({ ...prev, [id]: fileList }));
  };

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
        (admTypesData ?? []).filter(
          (t) => t.type === "PT3" || t.admissionTypeName?.toLowerCase().includes("tốt nghiệp")
        )
      );
      setLoading(false);
    });
  }, []);

  async function handleSubmit(values: FormValues) {
    const missingRequired = DOC_FIELDS.filter(
      (f) => f.required && (!uploadedFiles[f.id] || uploadedFiles[f.id].length === 0)
    );
    if (missingRequired.length > 0) {
      messageApi.warning(
        `Vui lòng tải lên đầy đủ tài liệu bắt buộc: ${missingRequired.map((f) => f.label).join("; ")}`
      );
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
      messageApi.success("Đăng ký xét tuyển theo điểm thi THPT thành công!");
      setTimeout(() => navigate("/applicant/applications"), 1200);
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { message?: string; errors?: string[] } } }).response?.data;
      const msg =
        errData?.message ||
        (errData?.errors?.length ? errData.errors.join("; ") : null) ||
        "Đăng ký thất bại. Vui lòng thử lại.";
      messageApi.error(msg);
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
            <GraduationCap size={20} className="text-orange-500" />
          </div>
          <div>
            <Text className="text-xs text-gray-400 uppercase tracking-wider">
              PT3 — Phương thức xét tuyển
            </Text>
            <Title level={4} className="!mb-0 !text-gray-800 !font-bold">
              Xét kết quả thi tốt nghiệp THPT
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
                      placeholder="Chọn phương thức thi THPT"
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

                <div className="flex items-center gap-2 mb-1">
                  <Paperclip size={15} className="text-orange-500" />
                  <Text className="!text-gray-600 !font-semibold !text-sm uppercase tracking-wide">
                    Tài liệu đính kèm
                  </Text>
                </div>
                <Text className="text-gray-400 text-xs mb-4 block">
                  Tải lên bản scan/ảnh chụp rõ nét (JPG, PNG, PDF). Các mục <span className="text-red-500 font-medium">Bắt buộc</span> phải có trước khi nộp hồ sơ.
                </Text>

                <div className="space-y-3 mb-6">
                  {DOC_FIELDS.map((doc) => (
                    <div
                      key={doc.id}
                      className={`p-3 rounded-lg border ${
                        doc.required
                          ? "bg-red-50/40 border-red-100"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-sm text-gray-700 flex-1 leading-snug">
                          {doc.required && (
                            <span className="text-red-500 mr-1">*</span>
                          )}
                          {doc.label}
                        </span>
                        {doc.required ? (
                          <Tag color="red" className="!text-xs !shrink-0">Bắt buộc</Tag>
                        ) : (
                          <Tag className="!text-xs !shrink-0 !text-gray-400 !border-gray-200">Không bắt buộc</Tag>
                        )}
                      </div>
                      {doc.hint && (
                        <p className="text-xs text-gray-400 mb-2 italic">{doc.hint}</p>
                      )}
                      <Upload.Dragger
                        accept={doc.accept}
                        maxCount={1}
                        beforeUpload={() => false}
                        fileList={uploadedFiles[doc.id] ?? []}
                        onChange={({ fileList }) => handleFileChange(doc.id, fileList)}
                        className="!rounded-lg"
                      >
                        <div className="flex flex-col items-center gap-1 py-2 px-2">
                          <UploadCloud size={22} className="text-gray-300" />
                          <p className="text-xs text-gray-500 text-center leading-snug">
                            Kéo thả file vào đây hoặc{" "}
                            <span className="text-orange-500 font-medium">nhấn để chọn</span>
                          </p>
                          <p className="text-xs text-gray-400">JPG, PNG, PDF</p>
                        </div>
                      </Upload.Dragger>
                    </div>
                  ))}
                </div>

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
                  Nộp hồ sơ xét tuyển điểm thi THPT
                </Button>
              </Form>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
