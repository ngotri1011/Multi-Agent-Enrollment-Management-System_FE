import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Divider,
  Form,
  Input,
  Layout,
  Steps,
  Tag,
  message,
  Tabs,
  Typography,
} from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "../../components/AppHeader";
import { GoogleLoginButton } from "../../components/GoogleLoginButton";
import { useAuth } from "../../hooks/useAuth";
import * as authApi from "../../api/auth";
import type { AuthRole } from "../../types/auth";
import {
  extractApiError,
  formatCountdown,
  isEmailLike,
  type ResetPasswordApiResponse,
} from "../../utils/authReset";

const roleDashboard: Record<AuthRole, string> = {
  applicant: "/applicant/dashboard",
  admin: "/admin/dashboard",
  officer: "/officer/dashboard",
  qa: "/qa/review-evaluation",
};

const { Content } = Layout;
const { Title, Text } = Typography;

// Thứ tự các view để xác định hướng animation (tiến/lùi).
const VIEW_ORDER = { auth: 0, "reset-request": 1, "reset-verify": 2 } as const;
type AuthView = keyof typeof VIEW_ORDER;

type LoginFormValues = {
  usernameOrEmail: string;
  password: string;
};

type RegisterFormValues = {
  username: string;
  email: string;
  password: string;
};

type ResetRequestFormValues = {
  email: string;
};

type ResetVerifyFormValues = {
  otpCode: string;
  newPassword: string;
  confirmPassword: string;
};

export function AuthPage() {
  const [loginForm] = Form.useForm<LoginFormValues>();
  const [registerForm] = Form.useForm<RegisterFormValues>();
  const [resetRequestForm] = Form.useForm<ResetRequestFormValues>();
  const [resetVerifyForm] = Form.useForm<ResetVerifyFormValues>();

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  // Lưu lỗi đăng nhập để hiển thị inline trong form login (message tiêu đề + errors[] chi tiết).
  const [loginErrorState, setLoginErrorState] = useState<{
    message: string;
    errors: string[];
  } | null>(null);
  // Lưu lỗi đăng ký để hiển thị inline trong form register.
  const [registerErrorState, setRegisterErrorState] = useState<{
    message: string;
    errors: string[];
  } | null>(null);

  // authView điều khiển nội dung card hiển thị theo từng bước flow.
  const [authView, setAuthView] = useState<AuthView>("auth");
  // Dùng ref để tính hướng animation so với view trước.
  const prevViewRef = useRef<AuthView>("auth");

  const [isResetExpired, setIsResetExpired] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [verifyResult, setVerifyResult] =
    useState<ResetPasswordApiResponse | null>(null);
  const [resetErrorState, setResetErrorState] = useState<{
    message: string;
    errors: string[];
  } | null>(null);

  const { setAuth } = useAuth();
  const navigate = useNavigate();

  // Chuyển view và ghi nhớ hướng di chuyển để dùng animation phù hợp.
  const changeView = (next: AuthView) => {
    prevViewRef.current = authView;
    setAuthView(next);
  };

  // Tính class animation dựa trên hướng chuyển bước (tiến hoặc lùi).
  const animClass =
    VIEW_ORDER[authView] >= VIEW_ORDER[prevViewRef.current]
      ? "auth-forward"
      : "auth-back";

  // Đặt lại toàn bộ state reset password và quay về màn đăng nhập.
  const resetPasswordState = () => {
    prevViewRef.current = authView;
    setAuthView("auth");
    setResetEmail("");
    setRemainingSeconds(0);
    setIsResetExpired(false);
    setVerifyResult(null);
    setResetErrorState(null);
    resetRequestForm.resetFields();
    resetVerifyForm.resetFields();
  };

  // Đếm ngược 10 phút; khi về 0, đánh dấu OTP hết hạn và giữ nguyên view để hiện nút gửi lại.
  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          setIsResetExpired(true);
          setResetErrorState({
            message:
              "Mã OTP đã hết hạn sau 10 phút. Nhấn 'Gửi lại OTP' để nhận mã mới.",
            errors: [],
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remainingSeconds]);

  const onLoginFinish = async (values: LoginFormValues) => {
    setLoading(true);
    // Xóa lỗi cũ mỗi lần người dùng thử đăng nhập lại.
    setLoginErrorState(null);
    try {
      const res = await authApi.login(values);
      setAuth(
        res.user,
        res.token,
        res.refreshToken,
        res.accessTokenExpiresAt,
        res.refreshTokenExpiresAt,
      );
      message.success("Đăng nhập thành công");
      navigate(roleDashboard[res.user.role] ?? "/", { replace: true });
    } catch (err: unknown) {
      // Toast ngắn gọn tiếng Việt; inline Alert dùng res.message từ API (fallback tiếng Việt) + res.errors[].
      const errData = (
        err as { response?: { data?: { message?: string; errors?: string[] } } }
      )?.response?.data;
      setLoginErrorState({
        message:
          errData?.message ||
          "Thông tin đăng nhập không hợp lệ — tên người dùng/email hoặc mật khẩu không chính xác.",
        errors: Array.isArray(errData?.errors)
          ? errData.errors.filter(Boolean)
          : [],
      });
      message.error("Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const onRegisterFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    // Xóa lỗi cũ mỗi lần người dùng thử đăng ký lại.
    setRegisterErrorState(null);
    try {
      await authApi.register(values);
      message.success(
        "Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác nhận tài khoản.",
      );
      registerForm.resetFields();
      setActiveTab("login");
    } catch (err: unknown) {
      // Toast ngắn gọn tiếng Việt; inline Alert dùng res.message từ API (fallback tiếng Việt) + res.errors[].
      const errData = (
        err as { response?: { data?: { message?: string; errors?: string[] } } }
      )?.response?.data;
      setRegisterErrorState({
        message:
          errData?.message ||
          "Đăng ký tài khoản thất bại — vui lòng kiểm tra lại thông tin.",
        errors: Array.isArray(errData?.errors)
          ? errData.errors.filter(Boolean)
          : [],
      });
      message.error("Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Mở flow reset password và tự điền email nếu người dùng đã nhập đúng định dạng ở form login.
  const openResetFlow = () => {
    const userInput = loginForm.getFieldValue("usernameOrEmail");
    const prefillEmail = isEmailLike(userInput) ? userInput.trim() : "";
    setResetErrorState(null);
    setVerifyResult(null);
    setIsResetExpired(false);
    setResetEmail(prefillEmail);
    resetRequestForm.setFieldsValue({ email: prefillEmail });
    changeView("reset-request");
  };

  // Bước 1: gửi yêu cầu nhận OTP qua email, nếu api thành công thì chuyển sang bước xác thực.
  const onResetRequestFinish = async (values: ResetRequestFormValues) => {
    setResetLoading(true);
    setResetErrorState(null);
    try {
      await authApi.requestResetPassword(values.email.trim());
      setResetEmail(values.email.trim());
      setRemainingSeconds(600);
      setIsResetExpired(false);
      resetVerifyForm.resetFields();
      changeView("reset-verify");
      message.success(
        "Mã OTP đã được gửi về email của bạn. Vui lòng kiểm tra hộp thư.",
      );
    } catch (err: unknown) {
      // Toast ngắn + inline Alert với errors[] từ API; message tiêu đề tiếng Việt cố định.
      setResetErrorState(
        extractApiError(
          err,
          "Gửi mã OTP thất bại — vui lòng kiểm tra lại địa chỉ email.",
        ),
      );
      message.error("Gửi mã OTP thất bại");
    } finally {
      setResetLoading(false);
    }
  };

  // Bước 2: xác thực OTP và đặt mật khẩu mới, chỉ chấp nhận khi timer còn hiệu lực.
  const onResetVerifyFinish = async (values: ResetVerifyFormValues) => {
    if (isResetExpired || remainingSeconds <= 0) {
      setIsResetExpired(true);
      setResetErrorState({
        message: "Mã OTP đã hết hạn. Vui lòng gửi lại yêu cầu reset.",
        errors: [],
      });
      return;
    }
    setResetLoading(true);
    setResetErrorState(null);
    try {
      const res = await authApi.verifyResetPassword({
        email: resetEmail,
        otpCode: values.otpCode,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      setVerifyResult(res);
      setRemainingSeconds(0);
      message.success("Đặt lại mật khẩu thành công");
    } catch (err: unknown) {
      // Toast ngắn + inline Alert; errors[] từ API hiển thị dưới tiêu đề lỗi tiếng Việt.
      setVerifyResult(null);
      setResetErrorState(
        extractApiError(
          err,
          "Xác thực OTP hoặc đặt mật khẩu thất bại — vui lòng kiểm tra lại mã OTP và mật khẩu.",
        ),
      );
      message.error("Xác thực OTP thất bại");
    } finally {
      setResetLoading(false);
    }
  };

  // Quay lại bước nhập email khi OTP hết hạn, giữ lại email đã nhập trước đó.
  const handleResendOtp = () => {
    prevViewRef.current = "reset-verify";
    setAuthView("reset-request");
    setIsResetExpired(false);
    setRemainingSeconds(0);
    setResetErrorState(null);
    setVerifyResult(null);
    resetVerifyForm.resetFields();
    resetRequestForm.setFieldsValue({ email: resetEmail });
  };

  return (
    <Layout
      className="min-h-screen relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #ff6a00 0%, #ee7f1a 25%, #f97316 50%, #c2410c 75%, #7c2d12 100%)",
      }}
    >
      {/* Lớp nền tối */}
      <div className="absolute inset-0 bg-black/60 z-0" />

      {/* Lớp chấm bi tạo texture nền */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.13) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      {/* Hiệu ứng lóe sáng trung tâm */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 50%, rgba(251,146,60,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <AppHeader />

        {/* pb-safe-area để không bị clip trên iPhone có Home Indicator */}
        <Content className="w-full py-6 px-4 sm:px-6 md:px-10 pb-20 box-border flex-1">
          <div className="max-w-md mx-auto mt-4 sm:mt-8 md:mt-12">
            {/* Card xác thực – padding nhỏ hơn trên điện thoại, overflow-hidden để tránh tràn khi animate */}
            <div className="rounded-2xl bg-white/75 backdrop-blur-sm border border-orange-200/30 shadow-[0_8px_40px_rgba(0,0,0,0.45)] p-5 sm:p-6 md:p-8 overflow-hidden">
              {/* ───── VIEW: Đăng nhập / Đăng ký ───── */}
              {authView === "auth" && (
                <div key="auth" className={animClass}>
                  <Title
                    level={3}
                    className="!text-slate-900 !mb-6 !text-center"
                  >
                    Tài khoản
                  </Title>

                  <Tabs
                    activeKey={activeTab}
                    onChange={(tab) => {
                      // Xóa lỗi cả 2 form khi người dùng chuyển tab để tránh hiện lỗi cũ.
                      setActiveTab(tab);
                      setLoginErrorState(null);
                      setRegisterErrorState(null);
                    }}
                    className="auth-tabs [&_.ant-tabs-nav]:mb-6 [&_.ant-tabs-tab]:py-2 [&_.ant-tabs-ink-bar]:bg-orange-500"
                    items={[
                      {
                        key: "login",
                        label: <span className="font-medium">Đăng nhập</span>,
                        children: (
                          <Form<LoginFormValues>
                            form={loginForm}
                            layout="vertical"
                            requiredMark={false}
                            onFinish={onLoginFinish}
                            className="[&_.ant-form-item]:mb-4"
                          >
                            <Form.Item
                              name="usernameOrEmail"
                              label={
                                <Text strong>Tên đăng nhập hay email</Text>
                              }
                              rules={[
                                {
                                  required: true,
                                  message:
                                    "Vui lòng nhập tên đăng nhập hoặc email",
                                },
                              ]}
                            >
                              <Input
                                placeholder="Nhập tên đăng nhập"
                                size="large"
                                className="rounded-lg"
                              />
                            </Form.Item>

                            <Form.Item
                              name="password"
                              label={<Text strong>Mật khẩu</Text>}
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập mật khẩu",
                                },
                              ]}
                            >
                              <Input.Password
                                placeholder="Nhập mật khẩu"
                                size="large"
                                className="rounded-lg"
                              />
                            </Form.Item>

                            {/* Nút quên mật khẩu: nhỏ, xám, nằm ngay dưới field mật khẩu */}
                            <Form.Item className="!mb-2 !-mt-2">
                              <Button
                                type="link"
                                onClick={openResetFlow}
                                className="!px-0 !h-auto !text-xs !font-normal !text-slate-400 hover:!text-slate-500 transition-colors"
                              >
                                Quên mật khẩu?
                              </Button>
                            </Form.Item>

                            {/* Hiển thị lỗi đăng nhập từ API (message + danh sách errors) ngay trong form */}
                            {loginErrorState && (
                              <Alert
                                type="error"
                                showIcon
                                className="rounded-xl !mb-4 [&_.ant-alert-message]:!break-words [&_.ant-alert-description]:!break-words"
                                message={loginErrorState.message}
                                description={
                                  loginErrorState.errors.length > 0 ? (
                                    <ul className="list-disc pl-4 text-sm space-y-1 mt-1">
                                      {loginErrorState.errors.map((e) => (
                                        <li key={e}>{e}</li>
                                      ))}
                                    </ul>
                                  ) : undefined
                                }
                              />
                            )}

                            <Form.Item className="!mb-0 !pt-2">
                              <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={loading}
                                className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600 !rounded-lg !h-11"
                              >
                                Đăng nhập
                              </Button>
                            </Form.Item>

                            <Divider plain className="!my-4 !text-gray-400">
                              hoặc
                            </Divider>
                            <GoogleLoginButton />
                          </Form>
                        ),
                      },
                      {
                        key: "register",
                        label: <span className="font-medium">Đăng ký</span>,
                        children: (
                          <Form<RegisterFormValues>
                            form={registerForm}
                            layout="vertical"
                            requiredMark={false}
                            onFinish={onRegisterFinish}
                            className="[&_.ant-form-item]:mb-4"
                          >
                            <Form.Item
                              name="username"
                              label={<Text strong>Tên đăng nhập</Text>}
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập tên đăng nhập",
                                },
                              ]}
                            >
                              <Input
                                placeholder="Nhập tên đăng nhập"
                                size="large"
                                className="rounded-lg"
                              />
                            </Form.Item>

                            <Form.Item
                              name="email"
                              label={<Text strong>Email</Text>}
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập email",
                                },
                                {
                                  type: "email",
                                  message: "Email không hợp lệ",
                                },
                              ]}
                            >
                              <Input
                                placeholder="Nhập email"
                                size="large"
                                className="rounded-lg"
                              />
                            </Form.Item>

                            <Form.Item
                              name="password"
                              label={<Text strong>Mật khẩu</Text>}
                              rules={[
                                {
                                  required: true,
                                  message: "Vui lòng nhập mật khẩu",
                                },
                                {
                                  min: 6,
                                  message: "Mật khẩu tối thiểu 6 ký tự",
                                },
                              ]}
                            >
                              <Input.Password
                                placeholder="Nhập mật khẩu"
                                size="large"
                                className="rounded-lg"
                              />
                            </Form.Item>

                            {/* Hiển thị lỗi đăng ký từ API (message + danh sách errors) ngay trong form */}
                            {registerErrorState && (
                              <Alert
                                type="error"
                                showIcon
                                className="rounded-xl !mb-4 [&_.ant-alert-message]:!break-words [&_.ant-alert-description]:!break-words"
                                message={registerErrorState.message}
                                description={
                                  registerErrorState.errors.length > 0 ? (
                                    <ul className="list-disc pl-4 text-sm space-y-1 mt-1">
                                      {registerErrorState.errors.map((e) => (
                                        <li key={e}>{e}</li>
                                      ))}
                                    </ul>
                                  ) : undefined
                                }
                              />
                            )}

                            <Form.Item className="!mb-0 !pt-2">
                              <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={loading}
                                className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600 !rounded-lg !h-11"
                              >
                                Đăng ký
                              </Button>
                            </Form.Item>

                            <Divider plain className="!my-4 !text-gray-400">
                              hoặc
                            </Divider>
                            <GoogleLoginButton />
                          </Form>
                        ),
                      },
                    ]}
                  />
                </div>
              )}

              {/* ───── VIEW: Bước 1 – Nhập email để nhận OTP ───── */}
              {authView === "reset-request" && (
                <div key="reset-request" className={animClass}>
                  {/* Header: nút quay lại + step indicator – ẩn label bước trên mobile để đỡ chật */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-5">
                    <Button
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      onClick={resetPasswordState}
                      className="!text-slate-500 hover:!text-slate-700 !p-1 !h-auto flex-shrink-0"
                    />
                    <Steps
                      size="small"
                      current={0}
                      className="flex-1 [&_.ant-steps-item-title]:!text-xs sm:[&_.ant-steps-item-title]:!text-sm"
                      items={[{ title: "Gửi OTP" }, { title: "Xác thực" }]}
                    />
                  </div>

                  <Title
                    level={4}
                    className="!text-slate-900 !mb-1 !text-lg sm:!text-xl"
                  >
                    Khôi phục mật khẩu
                  </Title>
                  <Text className="!text-slate-500 !text-sm block !mb-5">
                    Nhập email tài khoản để nhận mã OTP.
                  </Text>

                  {/* Thông báo lỗi từ API: message tiêu đề tiếng Việt + errors[] chi tiết */}
                  {resetErrorState && (
                    <Alert
                      type="error"
                      showIcon
                      className="rounded-xl !mb-4 [&_.ant-alert-message]:!break-words [&_.ant-alert-description]:!break-words"
                      message={resetErrorState.message}
                      description={
                        resetErrorState.errors.length > 0 ? (
                          <ul className="list-disc pl-4 text-sm space-y-1 mt-1">
                            {resetErrorState.errors.map((e) => (
                              <li key={e}>{e}</li>
                            ))}
                          </ul>
                        ) : undefined
                      }
                    />
                  )}

                  <Form<ResetRequestFormValues>
                    form={resetRequestForm}
                    layout="vertical"
                    requiredMark={false}
                    onFinish={onResetRequestFinish}
                    className="[&_.ant-form-item]:mb-4"
                  >
                    <Form.Item
                      name="email"
                      label={<Text strong>Email</Text>}
                      rules={[
                        { required: true, message: "Vui lòng nhập email" },
                        { type: "email", message: "Email không hợp lệ" },
                      ]}
                    >
                      <Input
                        size="large"
                        placeholder="Nhập email để nhận mã OTP"
                        className="rounded-xl"
                        autoComplete="email"
                      />
                    </Form.Item>

                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={resetLoading}
                      block
                      size="large"
                      className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600 !rounded-xl !h-11"
                    >
                      Gửi mã OTP
                    </Button>
                  </Form>
                </div>
              )}

              {/* ───── VIEW: Bước 2 – Xác thực OTP + đặt mật khẩu mới ───── */}
              {authView === "reset-verify" && (
                <div key="reset-verify" className={animClass}>
                  {/* Header: nút quay lại + step indicator – ẩn label bước trên mobile */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-5">
                    <Button
                      type="text"
                      icon={<ArrowLeftOutlined />}
                      onClick={() => {
                        prevViewRef.current = "reset-verify";
                        setAuthView("reset-request");
                        setVerifyResult(null);
                        setResetErrorState(null);
                        resetVerifyForm.resetFields();
                        resetRequestForm.setFieldsValue({ email: resetEmail });
                      }}
                      className="!text-slate-500 hover:!text-slate-700 !p-1 !h-auto flex-shrink-0"
                    />
                    <Steps
                      size="small"
                      current={1}
                      className="flex-1 [&_.ant-steps-item-title]:!text-xs sm:[&_.ant-steps-item-title]:!text-sm"
                      items={[{ title: "Gửi OTP" }, { title: "Xác thực" }]}
                    />
                  </div>

                  <Title
                    level={4}
                    className="!text-slate-900 !mb-1 !text-lg sm:!text-xl"
                  >
                    Xác thực OTP
                  </Title>
                  {/* break-all cho email dài không tràn layout trên màn hẹp */}
                  <Text className="!text-slate-500 !text-sm block !mb-3">
                    Mã OTP đã gửi tới{" "}
                    <strong className="text-slate-700 font-medium break-all">
                      {resetEmail}
                    </strong>
                  </Text>

                  {/* Hiển thị đồng hồ đếm ngược hoặc trạng thái hết hạn */}
                  <div className="mb-4">
                    {isResetExpired ? (
                      <Tag
                        icon={<ExclamationCircleOutlined />}
                        color="error"
                        className="!rounded-full !px-3 !py-0.5 !text-sm"
                      >
                        Mã OTP đã hết hạn
                      </Tag>
                    ) : (
                      <Tag
                        icon={<ClockCircleOutlined />}
                        color={
                          remainingSeconds <= 60 ? "warning" : "processing"
                        }
                        className="!rounded-full !px-3 !py-0.5 !text-sm !font-mono"
                      >
                        {formatCountdown(remainingSeconds)} còn lại
                      </Tag>
                    )}
                  </div>

                  {/* Thông báo thành công sau verify: message trang trọng tiếng Việt + nút về login */}
                  {verifyResult && (
                    <Alert
                      type="success"
                      showIcon
                      icon={<CheckCircleOutlined />}
                      className="rounded-xl !mb-4 [&_.ant-alert-message]:!break-words"
                      message="Đặt lại mật khẩu thành công"
                      description={
                        <Button
                          type="link"
                          className="!px-0 !h-auto !text-sm"
                          onClick={resetPasswordState}
                        >
                          Đăng nhập ngay →
                        </Button>
                      }
                    />
                  )}

                  {/* Lỗi API hoặc hết hạn – break-words phòng chuỗi dài tràn layout mobile */}
                  {resetErrorState && (
                    <Alert
                      type="error"
                      showIcon
                      className="rounded-xl !mb-4 [&_.ant-alert-message]:!break-words [&_.ant-alert-description]:!break-words"
                      message={resetErrorState.message}
                      description={
                        resetErrorState.errors.length > 0 ? (
                          <ul className="list-disc pl-4 text-sm space-y-1 mt-1">
                            {resetErrorState.errors.map((e) => (
                              <li key={e}>{e}</li>
                            ))}
                          </ul>
                        ) : undefined
                      }
                    />
                  )}

                  <Form<ResetVerifyFormValues>
                    form={resetVerifyForm}
                    layout="vertical"
                    requiredMark={false}
                    onFinish={onResetVerifyFinish}
                    className="[&_.ant-form-item]:mb-4"
                  >
                    {/* OTP 6 ô – căn đều theo chiều rộng, responsive mobile bằng gap nhỏ hơn */}
                    <Form.Item
                      name="otpCode"
                      label={<Text strong>Mã OTP</Text>}
                      rules={[
                        { required: true, message: "Vui lòng nhập mã OTP" },
                        { len: 6, message: "Mã OTP gồm 6 ký tự" },
                      ]}
                    >
                      <Input.OTP
                        length={6}
                        size="large"
                        disabled={isResetExpired}
                        inputMode="numeric"
                        className="!w-full [&_.ant-otp]:!w-full [&_.ant-otp]:!gap-1.5 sm:[&_.ant-otp]:!gap-2 [&_.ant-otp-input]:!flex-1 [&_.ant-otp-input]:!min-w-0 [&_.ant-otp-input]:!rounded-xl [&_.ant-otp-input]:!font-mono [&_.ant-otp-input]:!text-base [&_.ant-otp-input]:!h-11 sm:[&_.ant-otp-input]:!h-12"
                      />
                    </Form.Item>

                    <Form.Item
                      name="newPassword"
                      label={<Text strong>Mật khẩu mới</Text>}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng nhập mật khẩu mới",
                        },
                        { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                      ]}
                    >
                      <Input.Password
                        size="large"
                        placeholder="Nhập mật khẩu mới"
                        className="rounded-xl"
                        disabled={isResetExpired}
                        autoComplete="new-password"
                      />
                    </Form.Item>

                    <Form.Item
                      name="confirmPassword"
                      label={<Text strong>Xác nhận mật khẩu mới</Text>}
                      dependencies={["newPassword"]}
                      rules={[
                        {
                          required: true,
                          message: "Vui lòng xác nhận mật khẩu mới",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (
                              !value ||
                              getFieldValue("newPassword") === value
                            ) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("Mật khẩu xác nhận không khớp"),
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password
                        size="large"
                        placeholder="Nhập lại mật khẩu mới"
                        className="rounded-xl"
                        disabled={isResetExpired}
                        autoComplete="new-password"
                      />
                    </Form.Item>

                    {/* Nút action: gửi lại OTP (chỉ sau 10 phút) + xác thực; stack theo cột trên mobile */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                      {isResetExpired && (
                        <Button
                          type="default"
                          onClick={handleResendOtp}
                          block
                          className="!rounded-xl !h-11 sm:!w-auto sm:!flex-none"
                        >
                          Gửi lại OTP
                        </Button>
                      )}
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={resetLoading}
                        disabled={isResetExpired || !!verifyResult}
                        size="large"
                        block
                        className="!bg-orange-500 !border-orange-500 hover:!bg-orange-600 hover:!border-orange-600 !rounded-xl !h-11 disabled:!opacity-40 sm:!flex-1"
                      >
                        Xác thực và đổi mật khẩu
                      </Button>
                    </div>
                  </Form>
                </div>
              )}
            </div>
          </div>
        </Content>
      </div>

      {/* CSS animation cho chuyển view theo bước - sử dụng keyframe từ _keyframe-animations.scss */}
      <style>{`
        .auth-forward {
          animation: authViewForward 0.28s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .auth-back {
          animation: authViewBack 0.28s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
    </Layout>
  );
}
