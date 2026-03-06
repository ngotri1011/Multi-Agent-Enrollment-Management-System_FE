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
} from "antd";
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
} from "lucide-react";
import dayjs from "dayjs";
import { DashboardLayout } from "../../components/DashboardLayout";
import { getProfile } from "../../api/auth";
import { createApplicant, getMyApplicant, patchApplicant } from "../../api/applicant";
import type { UserProfile } from "../../types/auth";
import type { CreateApplicantRequest, CreateApplicantResponse } from "../../types/applicant";
import { applicantMenu } from "./applicantMenu";

const { Title, Text } = Typography;

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
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    Promise.all([
      getProfile(),
      getMyApplicant().catch(() => null),
    ]).then(([profileData, applicantData]) => {
      setProfile(profileData);
      setApplicant(applicantData);
      setLoading(false);
    });
  }, []);

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
    <DashboardLayout menuItems={applicantMenu}>
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
      ) : !loading ? (
        /* Creation / Edit form */
        <Card
          className="rounded-2xl border border-gray-100 shadow-sm max-w-3xl"
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
      ) : (
        <Card className="rounded-2xl border border-gray-100 shadow-sm max-w-3xl" styles={{ body: { padding: "32px" } }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      )}
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
