import { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Card,
  Skeleton,
  Typography,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  Divider,
  message,
  Tag,
  Upload,
  Modal,
  Spin,
  Empty,
  Tooltip,
} from "antd";
import type { UploadFile } from "antd";
import {
  CalendarDays,
  Mail,
  ShieldCheck,
  User,
  BookOpen,
  CreditCard,
  Phone,
  CheckCircle2,
  GraduationCap,
  Paperclip,
  UploadCloud,
  FileText,
  Eye,
  FileImage,
  Trash2,
} from "lucide-react";
import dayjs from "dayjs";
import { DashboardLayout } from "../../components/DashboardLayout";
import { getProfile } from "../../api/users";
import { createApplicant, getMyApplicant, patchApplicant, uploadApplicantDocuments, getApplicantDocuments } from "../../api/applicants";
import { deleteDocument } from "../../api/documents";
import type { UserProfile } from "../../types/auth";
import type { CreateApplicantRequest, CreateApplicantResponse } from "../../types/applicant";
import type { Document as ApplicantDocument } from "../../types/document";
import { ApplicantMenu } from "./ApplicantMenu";

const { Title, Text } = Typography;

const IMAGE_FORMATS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];

function isImageFormat(fileFormat?: string) {
  const normalized = (fileFormat ?? "").toLowerCase().trim();
  return IMAGE_FORMATS.some((ext) =>
    normalized === ext
    || normalized === `.${ext}`
    || normalized.includes(`image/${ext}`)
    || normalized.includes(ext),
  );
}

function isImageDocument(doc?: ApplicantDocument | null) {
  if (!doc) return false;
  if (isImageFormat(doc.fileFormat)) return true;
  const path = (doc.filePath ?? "").toLowerCase();
  return IMAGE_FORMATS.some((ext) => path.includes(`.${ext}`));
}

const VERIFICATION_BADGE: Record<string, { color: string; label: string }> = {
  PENDING:  { color: "orange",  label: "Chờ duyệt" },
  APPROVED: { color: "success", label: "Đã duyệt" },
  VERIFIED: { color: "success", label: "Đã duyệt" },
  REJECTED: { color: "error",   label: "Từ chối" },
  FAILED:   { color: "error",   label: "Từ chối" },
};

function getVerificationBadge(result?: string | null) {
  if (!result) return { color: "default", label: "—" };
  return VERIFICATION_BADGE[result.toUpperCase()] ?? { color: "default", label: result };
}

const DOC_TYPE_OPTIONS = [
  { value: "CCCD_FRONT",  label: "CCCD/CMND mặt trước" },
  { value: "CCCD_BACK",   label: "CCCD/CMND mặt sau" },
  { value: "HOC_BA",      label: "Học bạ / Bảng điểm" },
  { value: "DGNL",        label: "Giấy chứng nhận ĐGNL" },
  { value: "THPT",        label: "Giấy chứng nhận tốt nghiệp THPT" },
  { value: "SCHOOL_RANK", label: "Xác nhận xếp hạng SchoolRank" },
  { value: "UU_TIEN",     label: "Đơn ưu tiên xét tuyển" },
  { value: "BIEN_LAI",    label: "Biên lai nộp phí" },
  { value: "VAN_BANG",    label: "Văn bằng / Chứng chỉ" },
  { value: "KHAC",        label: "Tài liệu khác" },
];

const roleLabel: Record<string, string> = {
  applicant: "Thí sinh",
  admin: "Quản trị viên",
  officer: "Nhân viên",
  qa: "Kiểm duyệt viên",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type ApplicantFormValues = Omit<
  CreateApplicantRequest,
  "dateOfBirth" | "idIssueDate" | "allowShare"
> & {
  dateOfBirth: dayjs.Dayjs;
  idIssueDate: dayjs.Dayjs;
};

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-orange-500">{icon}</span>
      <Text className="!text-gray-600 !font-semibold !text-sm uppercase tracking-wide">
        {title}
      </Text>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <Text className="!text-xs !text-gray-400">{label}</Text>
      <Text className="!text-sm !text-gray-800 !font-medium">{value ?? "—"}</Text>
    </div>
  );
}

export function ApplicantProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [applicant, setApplicant] = useState<CreateApplicantResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form] = Form.useForm<ApplicantFormValues>();
  const [docForm] = Form.useForm<{ documentType: string }>();
  const [messageApi, contextHolder] = message.useMessage();

  // Document state
  const [documents, setDocuments] = useState<ApplicantDocument[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewDoc, setPreviewDoc] = useState<ApplicantDocument | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<number | null>(null);

  async function loadDocuments() {
    setDocsLoading(true);
    try {
      const docs = await getApplicantDocuments();
      setDocuments(docs);
    } catch {
      setDocuments([]);
    } finally {
      setDocsLoading(false);
    }
  }

  useEffect(() => {
    Promise.all([
      getProfile(),
      getMyApplicant().catch(() => null),
    ]).then(([profileData, applicantData]) => {
      setProfile(profileData);
      setApplicant(applicantData);
      setLoading(false);
      if (applicantData) loadDocuments();
    });
  }, []);

  async function handleUploadDoc() {
    let values: { documentType: string };
    try {
      values = await docForm.validateFields();
    } catch {
      return;
    }
    if (fileList.length === 0) {
      messageApi.warning("Vui lòng chọn file cần tải lên.");
      return;
    }
    const formData = new FormData();
    formData.append("documentType", values.documentType);
    formData.append("file", fileList[0].originFileObj as File);
    setUploading(true);
    try {
      await uploadApplicantDocuments(formData);
      messageApi.success("Tải lên tài liệu thành công!");
      setUploadOpen(false);
      docForm.resetFields();
      setFileList([]);
      loadDocuments();
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { message?: string } } }).response?.data;
      messageApi.error(errData?.message ?? "Tải lên thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
    }
  }

  function handleCloseUpload() {
    docForm.resetFields();
    setFileList([]);
    setUploadOpen(false);
  }

  function handleDeleteDocument(doc: ApplicantDocument) {
    Modal.confirm({
      title: "Xoá tài liệu",
      content: `Bạn có chắc muốn xoá tài liệu "${doc.fileName || DOC_TYPE_OPTIONS.find((o) => o.value === doc.documentType)?.label || "này"}"?`,
      okText: "Xoá",
      okButtonProps: { danger: true },
      cancelText: "Huỷ",
      onOk: async () => {
        if (doc.documentId == null) return;
        setDeletingDocId(doc.documentId);
        try {
          await deleteDocument(doc.documentId);
          messageApi.success("Đã xoá tài liệu thành công.");
          loadDocuments();
        } catch {
          messageApi.error("Xoá tài liệu thất bại. Vui lòng thử lại.");
        } finally {
          setDeletingDocId(null);
        }
      },
    });
  }

  const initial = profile?.username?.charAt(0).toUpperCase() ?? "U";

  function handleStartEdit() {
    if (!applicant) return;
    form.setFieldsValue({
      fullName: applicant.fullName,
      gender: applicant.gender,
      dateOfBirth: dayjs(applicant.dateOfBirth),
      highSchoolName: applicant.highSchoolName,
      highSchoolDistrict: applicant.highSchoolDistrict,
      highSchoolProvince: applicant.highSchoolProvince,
      graduationYear: applicant.graduationYear,
      idIssueNumber: applicant.idIssueNumber,
      idIssueDate: dayjs(applicant.idIssueDate),
      idIssuePlace: applicant.idIssuePlace,
      contactName: applicant.contactName,
      contactPhone: applicant.contactPhone,
      contactEmail: applicant.contactEmail,
      contactAddress: applicant.contactAddress,
    });
    setIsEditing(true);
  }

  async function handleSubmit(values: ApplicantFormValues) {
    setSubmitting(true);
    try {
      const payload: CreateApplicantRequest = {
        ...values,
        dateOfBirth: values.dateOfBirth.format("YYYY-MM-DD"),
        idIssueDate: values.idIssueDate.format("YYYY-MM-DD"),
        allowShare: true,
      };
      if (isEditing && applicant) {
        const response = await patchApplicant(payload);
        setApplicant(response);
        setIsEditing(false);
        messageApi.success("Hồ sơ thí sinh đã được cập nhật!");
      } else {
        const response = await createApplicant(payload);
        setApplicant(response);
        messageApi.success("Hồ sơ thí sinh đã được tạo thành công!");
        form.resetFields();
        loadDocuments();
      }
    } catch {
      messageApi.error(
        isEditing ? "Cập nhật hồ sơ thất bại. Vui lòng thử lại." : "Tạo hồ sơ thất bại. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout menuItems={ApplicantMenu}>
      {contextHolder}
      <Title level={4} className="!mb-6 !text-gray-700 !font-semibold">
        Hồ sơ cá nhân
      </Title>

      {/* Account summary card */}
      <Card
        className="rounded-2xl border border-gray-100 shadow-sm max-w-3xl mb-6"
        styles={{ body: { padding: "32px" } }}
      >
        {loading ? (
          <div className="flex items-center gap-6">
            <Skeleton.Avatar active size={80} />
            <div className="flex-1">
              <Skeleton active paragraph={{ rows: 3 }} title={false} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar
              size={80}
              className="!bg-orange-500 !text-white text-3xl font-bold select-none flex-shrink-0"
            >
              {initial}
            </Avatar>

            <div className="flex-1 w-full">
              <div className="text-center sm:text-left mb-5">
                <Title level={4} className="!mb-0 !text-gray-800">
                  {profile?.username ?? "—"}
                </Title>
                <Badge
                  color="orange"
                  text={
                    <Text className="text-orange-600 text-xs font-medium">
                      {roleLabel[profile?.role ?? ""] ?? profile?.role}
                    </Text>
                  }
                />
              </div>

              <div className="space-y-3">
                <InfoRow
                  icon={<User size={15} className="text-gray-400" />}
                  label="Tên đăng nhập"
                  value={profile?.username ?? "—"}
                />
                <InfoRow
                  icon={<Mail size={15} className="text-gray-400" />}
                  label="Email"
                  value={profile?.email || "Chưa cập nhật"}
                />
                <InfoRow
                  icon={<ShieldCheck size={15} className="text-gray-400" />}
                  label="Vai trò"
                  value={roleLabel[profile?.role ?? ""] ?? profile?.role ?? "—"}
                />
                <InfoRow
                  icon={<CalendarDays size={15} className="text-gray-400" />}
                  label="Ngày tham gia"
                  value={
                    profile?.createdAt ? formatDate(profile.createdAt) : "—"
                  }
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Applicant info — read-only if already submitted */}
      {!loading && applicant && !isEditing ? (
        <Card
          className="rounded-2xl border border-green-100 shadow-sm max-w-3xl"
          styles={{ body: { padding: "32px" } }}
        >
          <div className="flex items-center justify-between mb-1">
            <Title level={5} className="!mb-0 !text-gray-800">
              Thông tin thí sinh
            </Title>
            <div className="flex items-center gap-3">
              <Tag
                icon={<CheckCircle2 size={13} />}
                color="success"
                className="flex items-center gap-1 !rounded-full !px-3"
              >
                Đã có hồ sơ
              </Tag>
              <Button
                size="small"
                onClick={handleStartEdit}
                className="!rounded-lg"
              >
                Sửa
              </Button>
            </div>
          </div>
          <Text className="text-gray-400 text-sm">
            Thông tin đã được lưu. Nhấn <strong>Sửa</strong> nếu cần chỉnh sửa.
          </Text>

          <Divider className="!my-5" />

          {/* Personal */}
          <SectionHeader icon={<User size={16} />} title="Thông tin cá nhân" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <ReadOnlyField label="Họ và tên" value={applicant.fullName} />
            <ReadOnlyField label="Giới tính" value={applicant.gender} />
            <ReadOnlyField
              label="Ngày sinh"
              value={applicant.dateOfBirth ? formatDate(applicant.dateOfBirth) : "—"}
            />
          </div>

          <Divider className="!my-5" />

          {/* High school */}
          <SectionHeader icon={<GraduationCap size={16} />} title="Thông tin trường THPT" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <ReadOnlyField
              label="Tên trường"
              value={applicant.highSchoolName}
            />
            <ReadOnlyField label="Quận / Huyện" value={applicant.highSchoolDistrict} />
            <ReadOnlyField label="Tỉnh / Thành phố" value={applicant.highSchoolProvince} />
            <ReadOnlyField label="Năm tốt nghiệp" value={applicant.graduationYear} />
          </div>

          <Divider className="!my-5" />

          {/* ID */}
          <SectionHeader icon={<CreditCard size={16} />} title="Giấy tờ tùy thân" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
            <ReadOnlyField label="Số CCCD / CMND" value={applicant.idIssueNumber} />
            <ReadOnlyField
              label="Ngày cấp"
              value={applicant.idIssueDate ? formatDate(applicant.idIssueDate) : "—"}
            />
            <ReadOnlyField label="Nơi cấp" value={applicant.idIssuePlace} />
          </div>

          <Divider className="!my-5" />

          {/* Contact */}
          <SectionHeader icon={<Phone size={16} />} title="Thông tin liên lạc" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <ReadOnlyField label="Họ tên người liên lạc" value={applicant.contactName} />
            <ReadOnlyField label="Số điện thoại" value={applicant.contactPhone} />
            <ReadOnlyField label="Email liên lạc" value={applicant.contactEmail} />
            <ReadOnlyField label="Địa chỉ liên lạc" value={applicant.contactAddress} />
          </div>
        </Card>
      ) : null}

      {/* Document section — shown when applicant exists and not editing */}
      {!loading && applicant && !isEditing && (
        <Card
          className="rounded-2xl border border-gray-100 shadow-sm max-w-3xl mt-6"
          styles={{ body: { padding: "32px" } }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Paperclip size={16} className="text-orange-500" />
              <Title level={5} className="!mb-0 !text-gray-800">
                Tài liệu đính kèm
              </Title>
            </div>
            <Button
              icon={<UploadCloud size={14} />}
              className="!rounded-lg !border-orange-200 !text-orange-600 hover:!bg-orange-50"
              onClick={() => setUploadOpen(true)}
            >
              Tải lên tài liệu
            </Button>
          </div>
          <Text className="text-gray-400 text-sm block mb-5">
            Các tài liệu bạn nộp sẽ được đính kèm vào hồ sơ và dùng cho quá trình xét tuyển.
          </Text>

          {docsLoading ? (
            <div className="flex justify-center py-8">
              <Spin />
            </div>
          ) : documents.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<Text className="text-gray-400 text-sm">Chưa có tài liệu nào.</Text>}
              className="py-6"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {documents.map((doc, idx) => {
                const typeLabel = DOC_TYPE_OPTIONS.find((o) => o.value === doc.documentType)?.label ?? doc.documentType ?? "Tài liệu";
                const isImage = isImageDocument(doc);
                const badge = getVerificationBadge(doc.verificationResult);
                return (
                  <Tooltip key={doc.documentId ?? idx} title="Nhấn để xem chi tiết">
                    <div
                      className="group relative flex flex-col rounded-xl border border-gray-100 bg-white overflow-hidden cursor-pointer hover:border-orange-300 hover:shadow-md transition-all"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      {/* Thumbnail area */}
                      <div className="relative w-full h-24 bg-gray-50 flex items-center justify-center overflow-hidden">
                        {isImage ? (
                          <img
                            src={doc.filePath}
                            alt={doc.fileName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                              (e.currentTarget.nextElementSibling as HTMLElement | null)?.style.setProperty("display", "flex");
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full items-center justify-center flex-col gap-1"
                          style={{ display: isImage ? "none" : "flex" }}
                        >
                          <FileText size={28} className="text-orange-300" />
                          <span className="text-xs text-gray-400 uppercase">{doc.fileFormat ?? "file"}</span>
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <Eye size={20} className="text-white" />
                          <button
                            className="text-white hover:text-red-300 transition-colors"
                            onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc); }}
                            disabled={deletingDocId === doc.documentId}
                            title="Xoá tài liệu"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        {/* Verification badge */}
                        <div className="absolute top-1.5 right-1.5">
                          <Tag color={badge.color} className="!text-[10px] !px-1.5 !py-0 !leading-4 !m-0 !rounded-full">
                            {badge.label}
                          </Tag>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="px-2.5 py-2">
                        <p className="text-xs font-medium text-gray-700 truncate leading-tight" title={doc.fileName}>
                          {doc.fileName || typeLabel}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate mt-0.5 leading-tight flex items-center gap-1">
                          <FileImage size={10} className="shrink-0" />
                          {typeLabel}
                        </p>
                        {doc.uploadedAt && (
                          <p className="text-[10px] text-gray-300 mt-0.5 leading-tight">
                            {new Date(doc.uploadedAt).toLocaleDateString("vi-VN")}
                          </p>
                        )}
                      </div>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Document preview modal */}
      <Modal
        open={!!previewDoc}
        onCancel={() => setPreviewDoc(null)}
        footer={null}
        destroyOnClose
        width={720}
        title={
          previewDoc && (
            <div className="flex items-center gap-2 pr-4">
              <FileText size={16} className="text-orange-500 shrink-0" />
              <span className="text-sm font-semibold text-gray-800 truncate">
                {previewDoc.fileName || DOC_TYPE_OPTIONS.find((o) => o.value === previewDoc.documentType)?.label || "Tài liệu"}
              </span>
              {previewDoc.verificationResult && (() => {
                const b = getVerificationBadge(previewDoc.verificationResult);
                return <Tag color={b.color} className="!rounded-full !ml-1">{b.label}</Tag>;
              })()}
            </div>
          )
        }
      >
        {previewDoc && (
          <div className="flex flex-col gap-4 pt-2">
            {/* Preview area */}
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center min-h-[320px]">
              {isImageDocument(previewDoc) ? (
                <img
                  src={previewDoc.filePath}
                  alt={previewDoc.fileName}
                  className="max-w-full max-h-[480px] object-contain"
                />
              ) : (
                <iframe
                  src={previewDoc.filePath}
                  title={previewDoc.fileName}
                  className="w-full h-[480px] border-0"
                />
              )}
            </div>

            {/* Meta info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <Text className="!text-xs !text-gray-400 block">Loại tài liệu</Text>
                <Text className="!text-sm !text-gray-700 !font-medium">
                  {DOC_TYPE_OPTIONS.find((o) => o.value === previewDoc.documentType)?.label ?? previewDoc.documentType ?? "—"}
                </Text>
              </div>
              <div>
                <Text className="!text-xs !text-gray-400 block">Định dạng</Text>
                <Text className="!text-sm !text-gray-700 !font-medium uppercase">
                  {previewDoc.fileFormat ?? "—"}
                </Text>
              </div>
              <div>
                <Text className="!text-xs !text-gray-400 block">Ngày tải lên</Text>
                <Text className="!text-sm !text-gray-700 !font-medium">
                  {previewDoc.uploadedAt ? new Date(previewDoc.uploadedAt).toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" }) : "—"}
                </Text>
              </div>
              {previewDoc.verificationDetails && (
                <div className="col-span-2">
                  <Text className="!text-xs !text-gray-400 block">Ghi chú duyệt</Text>
                  <Text className="!text-sm !text-gray-700">{previewDoc.verificationDetails}</Text>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <a href={previewDoc.filePath} target="_blank" rel="noopener noreferrer">
                <Button icon={<Eye size={14} />} className="!rounded-lg !border-orange-200 !text-orange-600 hover:!bg-orange-50">
                  Mở trong tab mới
                </Button>
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload modal */}
      <Modal
        open={uploadOpen}
        onCancel={handleCloseUpload}
        title={
          <div className="flex items-center gap-2">
            <UploadCloud size={18} className="text-orange-500" />
            <span className="text-base font-bold text-gray-800">Tải lên tài liệu</span>
          </div>
        }
        footer={null}
        destroyOnClose
        width={480}
      >
        <Form form={docForm} layout="vertical" requiredMark={false} className="mt-4">
          <Form.Item
            name="documentType"
            label={<Text strong>Loại tài liệu</Text>}
            rules={[{ required: true, message: "Vui lòng chọn loại tài liệu" }]}
          >
            <Select
              placeholder="Chọn loại tài liệu"
              size="large"
              options={DOC_TYPE_OPTIONS}
            />
          </Form.Item>

          <Form.Item label={<Text strong>File tài liệu</Text>}>
            <Upload.Dragger
              accept="image/*,.pdf"
              maxCount={1}
              beforeUpload={() => false}
              fileList={fileList}
              onChange={({ fileList: fl }) => setFileList(fl)}
              className="!rounded-xl"
            >
              <div className="flex flex-col items-center gap-1.5 py-4">
                <UploadCloud size={28} className="text-gray-300" />
                <Text className="text-sm text-gray-500">
                  Kéo thả file vào đây hoặc{" "}
                  <span className="text-orange-500 font-medium">nhấn để chọn</span>
                </Text>
                <Text className="text-xs text-gray-400">JPG, PNG, PDF — tối đa 10 MB</Text>
              </div>
            </Upload.Dragger>
          </Form.Item>

          <div className="flex gap-2 justify-end mt-2">
            <Button onClick={handleCloseUpload} className="!rounded-xl">
              Hủy
            </Button>
            <Button
              type="primary"
              loading={uploading}
              onClick={handleUploadDoc}
              icon={<UploadCloud size={14} />}
              className="!rounded-xl !bg-orange-500 !border-orange-500 hover:!bg-orange-600"
            >
              Tải lên
            </Button>
          </div>
        </Form>
      </Modal>

      {!loading && (!applicant || isEditing) ? (
        /* Creation / Edit form */
        <Card
          className="rounded-2xl border border-gray-100 shadow-sm max-w-3xl mt-6"
          styles={{ body: { padding: "32px" } }}
        >
          <Title level={5} className="!mb-1 !text-gray-800">
            {isEditing ? "Chỉnh sửa thông tin thí sinh" : "Thông tin thí sinh"}
          </Title>
          <Text className="text-gray-400 text-sm">
            {isEditing
              ? "Cập nhật thông tin hồ sơ thí sinh của bạn."
              : "Điền đầy đủ thông tin để hoàn thiện hồ sơ đăng ký xét tuyển."}
          </Text>

          <Divider className="!my-5" />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            className="!mt-0"
            initialValues={{ gender: "Nam" }}
          >
            {/* Personal information */}
            <SectionHeader
              icon={<User size={16} />}
              title="Thông tin cá nhân"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>

              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select
                  options={[
                    { value: "Nam", label: "Nam" },
                    { value: "Nữ", label: "Nữ" },
                    { value: "Khác", label: "Khác" },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="dateOfBirth"
                label="Ngày sinh"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  placeholder="DD/MM/YYYY"
                  disabledDate={(d) => d && d.isAfter(dayjs())}
                />
              </Form.Item>
            </div>

            <Divider className="!my-5" />

            {/* High school information */}
            <SectionHeader
              icon={<BookOpen size={16} />}
              title="Thông tin trường THPT"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
              <Form.Item
                name="highSchoolName"
                label="Tên trường"
                rules={[{ required: true, message: "Vui lòng nhập tên trường" }]}
                className="sm:col-span-2"
              >
                <Input placeholder="THPT Chuyên Lê Hồng Phong" />
              </Form.Item>

              <Form.Item
                name="highSchoolDistrict"
                label="Quận / Huyện"
                rules={[{ required: true, message: "Vui lòng nhập quận/huyện" }]}
              >
                <Input placeholder="Quận 5" />
              </Form.Item>

              <Form.Item
                name="highSchoolProvince"
                label="Tỉnh / Thành phố"
                rules={[{ required: true, message: "Vui lòng nhập tỉnh/thành phố" }]}
              >
                <Input placeholder="TP. Hồ Chí Minh" />
              </Form.Item>

              <Form.Item
                name="graduationYear"
                label="Năm tốt nghiệp"
                rules={[{ required: true, message: "Vui lòng nhập năm tốt nghiệp" }]}
              >
                <InputNumber
                  className="w-full"
                  min={1990}
                  max={new Date().getFullYear() + 1}
                  placeholder="2025"
                />
              </Form.Item>
            </div>

            <Divider className="!my-5" />

            {/* ID information */}
            <SectionHeader
              icon={<CreditCard size={16} />}
              title="Giấy tờ tùy thân"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
              <Form.Item
                name="idIssueNumber"
                label="Số CCCD / CMND"
                rules={[{ required: true, message: "Vui lòng nhập số CCCD/CMND" }]}
              >
                <Input placeholder="079xxxxxxxxx" maxLength={12} />
              </Form.Item>

              <Form.Item
                name="idIssueDate"
                label="Ngày cấp"
                rules={[{ required: true, message: "Vui lòng chọn ngày cấp" }]}
              >
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  placeholder="DD/MM/YYYY"
                  disabledDate={(d) => d && d.isAfter(dayjs())}
                />
              </Form.Item>

              <Form.Item
                name="idIssuePlace"
                label="Nơi cấp"
                rules={[{ required: true, message: "Vui lòng nhập nơi cấp" }]}
                className="sm:col-span-2"
              >
                <Input placeholder="Cục Cảnh sát quản lý hành chính về TTXH" />
              </Form.Item>
            </div>

            <Divider className="!my-5" />

            {/* Contact information */}
            <SectionHeader
              icon={<Phone size={16} />}
              title="Thông tin liên lạc"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
              <Form.Item
                name="contactName"
                label="Họ tên người liên lạc"
                rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
              >
                <Input placeholder="Nguyễn Thị B" />
              </Form.Item>

              <Form.Item
                name="contactPhone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  { pattern: /^[0-9]{9,11}$/, message: "Số điện thoại không hợp lệ" },
                ]}
              >
                <Input placeholder="0901234567" maxLength={11} />
              </Form.Item>

              <Form.Item
                name="contactEmail"
                label="Email liên lạc"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input placeholder="lienhe@example.com" />
              </Form.Item>

              <Form.Item
                name="contactAddress"
                label="Địa chỉ liên lạc"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
                className="sm:col-span-2"
              >
                <Input.TextArea
                  rows={2}
                  placeholder="123 Đường ABC, Phường XYZ, Quận 1, TP. HCM"
                />
              </Form.Item>
            </div>

            <Divider className="!my-5" />

            <div className="flex justify-end gap-3 pt-2">
              {isEditing && (
                <Button
                  size="large"
                  className="!rounded-lg px-8"
                  onClick={() => setIsEditing(false)}
                  disabled={submitting}
                >
                  Hủy
                </Button>
              )}
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600 !rounded-lg px-8"
                size="large"
              >
                {isEditing ? "Cập nhật" : "Lưu hồ sơ"}
              </Button>
            </div>
          </Form>
        </Card>
      ) : loading ? (
        <Card className="rounded-2xl border border-gray-100 shadow-sm max-w-3xl mt-6" styles={{ body: { padding: "32px" } }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      ) : null}
    </DashboardLayout>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className="flex-shrink-0">{icon}</span>
      <Text className="text-xs text-gray-400 w-32 flex-shrink-0">{label}</Text>
      <Text className="text-sm text-gray-700 font-medium">{value}</Text>
    </div>
  );
}
